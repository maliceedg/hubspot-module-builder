import { Injectable, computed, effect, signal } from '@angular/core';
import type { LayoutNode } from '../domain/module-spec';

import type {
  ModuleSpec,
  FieldSpec,
  HubSpotContentType,
} from '../domain/module-spec';
import {
  createDefaultModuleSpec,
  SlotNode,
} from '../domain/module-spec-factory';
import {
  validateModuleSpec,
  type ValidationIssue,
} from '../domain/module-spec-validate';

export interface PublishTarget {
  account: string; // e.g. "dev-edgardo"
  remoteBase: string; // e.g. "hsmb"
}

const LS_SPEC_KEY = 'hsmb.spec';
const LS_PUBLISH_TARGET_KEY = 'hsmb.publishTarget';

@Injectable({ providedIn: 'root' })
export class EditorStateService {
  // -----------------------
  // Core state
  // -----------------------
  readonly spec = signal<ModuleSpec>(createDefaultModuleSpec());
  readonly selectedFieldId = signal<string | null>(null);
  private readonly _selectedNodeId = signal<string | null>(null);
  selectedNodeId = this._selectedNodeId.asReadonly();

  // Publish settings (no hardcode en el componente)
  readonly publishTarget = signal<PublishTarget>(this.loadPublishTarget());

  // -----------------------
  // Derived state
  // -----------------------
  readonly issues = computed(() => validateModuleSpec(this.spec()));

  readonly hasIssues = computed<boolean>(() => this.issues().length > 0);

  readonly selectedField = computed<FieldSpec | null>(() => {
    const id = this.selectedFieldId();
    if (!id) return null;
    return this.spec().fields.find((f) => f.id === id) ?? null;
  });

  private findNodeById(root: LayoutNode, id: string): LayoutNode | null {
    if ((root as any).id === id) return root;
    if (root.kind === 'slot') return null;
    for (const c of root.children ?? []) {
      const found = this.findNodeById(c, id);
      if (found) return found;
    }
    return null;
  }

  selectNode(id: string) {
    this._selectedNodeId.set(id);
  }

  readonly selectedNode = computed<LayoutNode | null>(() => {
    const id = this.selectedNodeId();
    if (!id) return null;
    return this.findNodeById(this.spec().layout, id);
  });

  constructor() {
    // Autosave spec (MVP). Si no lo quieres aún, comenta este effect.
    effect(() => {
      const s = this.spec();
      try {
        localStorage.setItem(LS_SPEC_KEY, JSON.stringify(s));
      } catch {
        // ignore
      }
    });

    effect(() => {
      const t = this.publishTarget();
      try {
        localStorage.setItem(LS_PUBLISH_TARGET_KEY, JSON.stringify(t));
      } catch {
        // ignore
      }
    });
  }

  // -----------------------
  // Public API: spec lifecycle
  // -----------------------
  setSpec(next: ModuleSpec) {
    this.spec.set(next);

    // Si el campo seleccionado ya no existe, limpia selección
    const currentSelected = this.selectedFieldId();
    if (currentSelected && !next.fields.some((f) => f.id === currentSelected)) {
      this.selectedFieldId.set(null);
    }
  }

  resetSpec() {
    this.setSpec(createDefaultModuleSpec());
  }

  tryRestoreSpecFromLocalStorage(): boolean {
    try {
      const raw = localStorage.getItem(LS_SPEC_KEY);
      if (!raw) return false;

      const parsed = JSON.parse(raw) as ModuleSpec;

      // Validación antes de setear
      const issues = validateModuleSpec(parsed);
      if (issues.length) return false;

      this.setSpec(parsed);
      return true;
    } catch {
      return false;
    }
  }

  // -----------------------
  // Mutations: module
  // -----------------------
  updateModule(
    patch: Partial<{
      name: string;
      slug: string;
      contentTypes: HubSpotContentType[];
    }>
  ) {
    this.spec.update((prev) => ({
      ...prev,
      module: {
        ...prev.module,
        ...patch,
      },
    }));
  }

  // -----------------------
  // Mutations: publish target
  // -----------------------
  updatePublishTarget(patch: Partial<PublishTarget>) {
    this.publishTarget.update((prev) => ({ ...prev, ...patch }));
  }

  private loadPublishTarget(): PublishTarget {
    try {
      const raw = localStorage.getItem(LS_PUBLISH_TARGET_KEY);
      if (!raw) return { account: 'dev-edgardo', remoteBase: 'hsmb' };
      const parsed = JSON.parse(raw) as PublishTarget;

      return {
        account: parsed.account || 'dev-edgardo',
        remoteBase: parsed.remoteBase || 'hsmb',
      };
    } catch {
      return { account: 'dev-edgardo', remoteBase: 'hsmb' };
    }
  }

  // -----------------------
  // Mutations: fields
  // -----------------------
  selectField(id: string | null) {
    this.selectedFieldId.set(id);
  }

  addField(type: 'text' | 'boolean' | 'image') {
    const base = {
      id: crypto.randomUUID(),
      name: this.uniqueFieldName(type === 'text' ? 'headline' : type),
      label: type === 'text' ? 'Headline' : this.capitalize(type),
      required: false,
    };

    const newField =
      type === 'text'
        ? { ...base, type: 'text' as const, defaultValue: '' }
        : type === 'boolean'
        ? { ...base, type: 'boolean' as const, defaultValue: false }
        : { ...base, type: 'image' as const };

    this.spec.update((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));

    this.selectedFieldId.set(newField.id);
  }

  updateField(fieldId: string, patch: Partial<FieldSpec>) {
    this.spec.update((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === fieldId ? ({ ...f, ...patch } as FieldSpec) : f
      ),
    }));
  }

  replaceFieldType(fieldId: string, nextType: 'text' | 'boolean' | 'image') {
    this.spec.update((prev) => {
      const fields = prev.fields.map((f) => {
        if (f.id !== fieldId) return f;

        const base = {
          id: f.id,
          name: f.name,
          label: f.label,
          required: f.required,
        };

        if (nextType === 'text')
          return { ...base, type: 'text', defaultValue: '' } as any;
        if (nextType === 'boolean')
          return { ...base, type: 'boolean', defaultValue: false } as any;
        return { ...base, type: 'image' } as any;
      });

      return { ...prev, fields };
    });
  }

  removeField(fieldId: string) {
    this.spec.update((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== fieldId),
    }));

    if (this.selectedFieldId() === fieldId) {
      this.selectedFieldId.set(null);
    }
  }

  updateSlotBinding(slotId: string, fieldId: string) {
    const spec = structuredClone(this.spec());
    const node = this.findNodeById(spec.layout, slotId);

    if (!node || node.kind !== 'slot') return;

    node.bindFieldId = fieldId;

    this.spec.set(spec);
  }

  private uid() {
    return (
      globalThis.crypto?.randomUUID?.() ??
      `id_${Math.random().toString(16).slice(2)}`
    );
  }

  private mapLayout(
    node: LayoutNode,
    fn: (n: LayoutNode) => LayoutNode
  ): LayoutNode {
    const next = fn(node);

    if (next.kind === 'slot') return next;

    const children = (next.children ?? []).map((c) => this.mapLayout(c, fn));
    return { ...next, children };
  }

  private insertChild(
    layout: LayoutNode,
    targetId: string,
    child: LayoutNode
  ): LayoutNode {
    return this.mapLayout(layout, (n) => {
      if (n.id !== targetId) return n;
      if (n.kind === 'slot') return n; // no admite children

      const children = [...(n.children ?? []), child];
      return { ...n, children };
    });
  }

  // -----------------------
  // Helpers
  // -----------------------
  private uniqueFieldName(base: string): string {
    const taken = new Set(this.spec().fields.map((f) => f.name));
    let name = base;
    let i = 1;
    while (taken.has(name)) {
      i += 1;
      name = `${base}_${i}`;
    }
    return name;
  }

  private ensureAtLeastOneField(): string {
    const spec = this.spec();
    if (spec.fields.length > 0) return spec.fields[0].name;

    const name = this.uniqueFieldName('text');
    const newField: FieldSpec = {
      id: this.uid(),
      type: 'text',
      name,
      label: 'Text',
      required: false,
      defaultValue: '',
    };

    this.spec.set({ ...spec, fields: [...spec.fields, newField] });
    this.selectedFieldId.set(newField.id);

    return name;
  }

  addSlotToSelected() {
    const selectedId = this.selectedNodeId();
    if (!selectedId) return;

    const spec = structuredClone(this.spec());

    const parent = this.findNodeById(spec.layout, selectedId);
    if (!parent || parent.kind === 'slot') return;

    if (!parent.children) parent.children = [];

    const slot: SlotNode = {
      kind: 'slot',
      id: crypto.randomUUID(),
      title: 'slot',
      bindFieldName: '',
    };

    parent.children.push(slot);

    this.spec.set(spec);
    this._selectedNodeId.set(slot.id);
  }

  addStackToSelected() {
    const targetId = this.selectedNodeId();
    if (!targetId) return;

    const stack: LayoutNode = {
      kind: 'stack',
      id: this.uid(),
      title: 'stack',
      children: [],
    };

    const spec = this.spec();
    const nextLayout = this.insertChild(spec.layout, targetId, stack);

    this.spec.set({ ...spec, layout: nextLayout });
    this._selectedNodeId.set(stack.id);
  }

  private ensureAtLeastOneFieldId(): string {
    const spec = this.spec();
    if (spec.fields.length > 0) return spec.fields[0].id;

    const name = this.uniqueFieldName('text');
    const newField: FieldSpec = {
      id: this.uid(),
      type: 'text',
      name,
      label: 'Text',
      required: false,
      defaultValue: '',
    };

    this.spec.set({ ...spec, fields: [...spec.fields, newField] });
    this.selectedFieldId.set(newField.id);

    return newField.id;
  }

  private capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
