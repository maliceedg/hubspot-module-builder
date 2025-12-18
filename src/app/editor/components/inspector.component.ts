import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStateService } from '../editor-state.service';
import type { HubSpotContentType } from '../../domain/module-spec';
import { FIELD_TYPE_OPTIONS } from '../../domain/field-type';
import { UiSelectComponent } from '../../ui/ui-select/ui-select.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, UiSelectComponent],
  selector: 'app-inspector',
  template: `
    <div class="p-4 space-y-4">
      <div>
        <div class="text-sm font-semibold">Inspector</div>
        <div class="text-xs text-neutral-400">Edit module + selected field</div>
      </div>

      <!-- Module -->
      <div class="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div class="text-xs text-neutral-400">Module</div>

        <label class="block text-xs text-neutral-300">Name</label>
        <input
          class="w-full px-3 py-2 rounded-2xl bg-neutral-950/40 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40"
          [ngModel]="s.spec().module.name"
          (ngModelChange)="s.updateModule({ name: $event })"
        />

        <label class="block text-xs text-neutral-300 mt-2">Slug</label>
        <input
          class="w-full px-3 py-2 rounded-2xl bg-neutral-950/40 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40 font-mono"
          [ngModel]="s.spec().module.slug"
          (ngModelChange)="s.updateModule({ slug: $event })"
        />
      </div>

      <!-- Content types -->
      <div class="mt-4">
        <div class="text-xs text-neutral-400">Content types</div>

        <div class="mt-2 space-y-2">
          <label
            *ngFor="let opt of contentOptions"
            class="flex items-start gap-3 p-2 rounded-2xl border border-white border-opacity-10 bg-white bg-opacity-5 hover:bg-opacity-10 transition"
          >
            <input
              type="checkbox"
              class="mt-1 accent-cyan-300"
              [checked]="hasContentType(opt.value)"
              (change)="
                toggleContentType(opt.value, $any($event.target).checked)
              "
            />
            <div>
              <div class="text-xs font-medium">{{ opt.label }}</div>
              <div *ngIf="opt.hint" class="text-[11px] text-neutral-500">
                {{ opt.hint }}
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Field -->
      <div
        *ngIf="selectedField() as f; else noField"
        class="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-neutral-400">Field</div>
            <div class="text-sm font-semibold">{{ f.label }}</div>
          </div>

          <span
            class="text-[10px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300"
          >
            {{ f.type }}
          </span>
        </div>

        <!-- Type selector -->
        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-12">
            <div class="text-xs text-neutral-400">Type</div>
          </div>

          <div class="col-span-12">
            <ui-select
              [ngModel]="f.type"
              (ngModelChange)="onChangeFieldType(f.id, f.type, $event)"
              [options]="fieldTypeOptions"
            ></ui-select>

            <div class="mt-2 text-[11px] text-neutral-500">
              Cambiar el tipo puede descartar el default actual (MVP).
            </div>
          </div>
        </div>

        <!-- Label -->
        <div>
          <label class="block text-xs text-neutral-300">Label</label>
          <input
            class="w-full px-3 py-2 rounded-2xl bg-neutral-950/40 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40"
            [ngModel]="f.label"
            (ngModelChange)="s.updateField(f.id, { label: $event })"
          />
        </div>

        <!-- Name (sanitized) -->
        <div>
          <label class="block text-xs text-neutral-300">Name</label>
          <input
            class="w-full px-3 py-2 rounded-2xl bg-neutral-950/40 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40 font-mono"
            [ngModel]="f.name"
            (ngModelChange)="onFieldNameInput(f.id, $event)"
          />
          <div class="mt-2 text-[11px] text-neutral-500">
            Se usa en HubL como
            <span class="font-mono">module.&lt;name&gt;</span>. Recomendación:
            lower_snake_case.
          </div>
        </div>

        <!-- Required -->
        <label class="flex items-center gap-2 text-sm text-neutral-200">
          <input
            type="checkbox"
            class="accent-cyan-300"
            [checked]="!!f.required"
            (change)="
              s.updateField(f.id, { required: $any($event.target).checked })
            "
          />
          Required
        </label>

        <!-- Defaults by type -->
        <div
          class="rounded-2xl border border-white/10 bg-neutral-950/20 p-3 space-y-2"
        >
          <div class="text-xs text-neutral-400">Defaults</div>

          <!-- TEXT -->
          <ng-container *ngIf="f.type === 'text'">
            <label class="block text-xs text-neutral-300">Default text</label>
            <input
              class="w-full px-3 py-2 rounded-2xl bg-neutral-950/40 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40"
              [ngModel]="f.defaultValue ?? ''"
              (ngModelChange)="s.updateField(f.id, { defaultValue: $event })"
            />
          </ng-container>

          <!-- BOOLEAN -->
          <ng-container *ngIf="f.type === 'boolean'">
            <label class="block text-xs text-neutral-300">Default</label>
            <label class="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                class="accent-cyan-300"
                [checked]="!!f.defaultValue"
                (change)="
                  s.updateField(f.id, {
                    defaultValue: $any($event.target).checked
                  })
                "
              />
              true
            </label>
          </ng-container>

          <!-- IMAGE -->
          <ng-container *ngIf="f.type === 'image'">
            <div class="text-[11px] text-neutral-500">
              MVP: image aún no tiene default. Luego podemos soportar
              src/alt/size.
            </div>
          </ng-container>
        </div>

        <!-- Optional: remove field -->
        <button
          class="w-full mt-2 px-3 py-2 rounded-2xl border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
          (click)="s.removeField(f.id)"
        >
          Remove field
        </button>
      </div>

      <ng-template #noField>
        <div class="text-xs text-neutral-500">
          Selecciona un field para editarlo.
        </div>
      </ng-template>
    </div>
  `,
})
export class InspectorComponent {
  fieldTypeOptions = FIELD_TYPE_OPTIONS;

  constructor(public s: EditorStateService) {}

  selectedField = computed(() => {
    const id = this.s.selectedFieldId();
    if (!id) return null;
    return this.s.spec().fields.find((f) => f.id === id) ?? null;
  });

  contentOptions: {
    value: HubSpotContentType;
    label: string;
    hint?: string;
  }[] = [
    { value: 'SITE_PAGE', label: 'Site Page', hint: 'Páginas web normales' },
    { value: 'LANDING_PAGE', label: 'Landing Page', hint: 'Landing pages' },
    { value: 'BLOG_POST', label: 'Blog Post' },
    { value: 'BLOG_LISTING', label: 'Blog Listing' },
    {
      value: 'EMAIL',
      label: 'Email',
      hint: 'Puede requerir restricciones extra',
    },
  ];

  hasContentType(ct: HubSpotContentType): boolean {
    return (this.s.spec().module.contentTypes ?? []).includes(ct);
  }

  toggleContentType(ct: HubSpotContentType, checked: boolean) {
    const current = this.s.spec().module.contentTypes ?? [];
    const next = checked
      ? Array.from(new Set([...current, ct]))
      : current.filter((x) => x !== ct);
    this.s.updateModule({ contentTypes: next });
  }

  onFieldNameInput(fieldId: string, raw: string) {
    const sanitized = raw
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');

    this.s.updateField(fieldId, { name: sanitized });
  }

  onChangeFieldType(fieldId: string, current: string, next: string) {
    if (current === next) return;

    // MVP: cambio destructivo (si quieres confirmación)
    // if (!confirm("Cambiar el tipo puede descartar el default actual. ¿Continuar?")) return;

    this.s.replaceFieldType(fieldId, next as any);
  }
}
