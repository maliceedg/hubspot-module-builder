import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../editor-state.service';
import { LayoutNode } from '../../domain/module-spec';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-canvas',
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-semibold">Preview</div>
          <div class="text-xs text-neutral-400">Local renderer (not HubL)</div>
        </div>
      </div>

      <div
        class="mt-4 rounded-3xl border border-white/10 bg-neutral-950/40 p-4"
      >
        <ng-container
          *ngTemplateOutlet="nodeTpl; context: { node: s.spec().layout }"
        ></ng-container>
      </div>

      <div class="mt-3 text-xs text-neutral-500">
        Este preview es aproximado. El ZIP genera module.html/fields.json para
        HubSpot.
      </div>
    </div>

    <ng-template #nodeTpl let-node="node">
      <div
        class="rounded-2xl border border-white/10 bg-white/5 p-3 mb-3 hover:bg-white/10 transition"
        [class.border-cyan-300]="s.selectedNodeId() === node.id"
      >
        <button class="text-left w-full" (click)="s.selectNode(node.id)">
          <div class="text-[11px] text-neutral-400 uppercase tracking-wider">
            {{ node.kind }}
          </div>
          <div class="text-sm font-semibold">{{ node.title || node.id }}</div>
        </button>

        <div class="mt-3">
          <ng-container [ngSwitch]="node.kind">
            <div *ngSwitchCase="'slot'" class="text-sm">
              <div class="flex items-center gap-2 text-xs text-neutral-400">
                <span>bind</span>
                <span class="font-mono text-neutral-200">{{
                  node.bindFieldName
                }}</span>
              </div>

              <div
                class="mt-2 rounded-2xl border border-white/10 bg-neutral-950/50 p-3"
              >
                <div class="text-xs text-neutral-500 mb-1">preview value</div>
                <div class="text-sm">
                  {{ resolveSlotPreview(node.bindFieldName) }}
                </div>
              </div>
            </div>

            <div *ngSwitchDefault class="space-y-2">
              <ng-container *ngFor="let c of node.children ?? []">
                <ng-container
                  *ngTemplateOutlet="nodeTpl; context: { node: c }"
                ></ng-container>
              </ng-container>
            </div>
          </ng-container>
        </div>
      </div>
    </ng-template>
  `,
})
export class CanvasComponent {
  constructor(public s: EditorStateService) {}

  resolveSlotPreview(fieldName?: string): string {
    if (!fieldName) return '(unbound slot)';
    const field = this.s.spec().fields.find((f) => f.name === fieldName);
    if (!field) return '(unknown field)';

    switch (field.type) {
      case 'text':
        return field.defaultValue ?? '';
      case 'boolean':
        return String(field.defaultValue ?? false);
      case 'image':
        return '[image]';
      default:
        return '';
    }
  }
}
