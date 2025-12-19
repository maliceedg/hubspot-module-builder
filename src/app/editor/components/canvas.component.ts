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
        class="node rounded-2xl border border-white/10 bg-white/5 p-3 mb-3
           hover:bg-white/10 transition cursor-pointer"
        [class.border-cyan-300]="s.selectedNodeId() === node.id"
      >
        <!-- Header del nodo -->
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[11px] text-neutral-400 uppercase tracking-wider">
              {{ node.kind }}
            </div>
            <div class="text-sm font-semibold">
              {{ node.title || node.id }}
            </div>
          </div>

          <!-- Indicador visual del tipo -->
          <div
            class="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-neutral-400"
          >
            {{ node.kind }}
          </div>
        </div>

        <!-- Body -->
        <div class="mt-3">
          <ng-container [ngSwitch]="node.kind">
            <!-- ================= SLOT ================= -->
            <div
              *ngSwitchCase="'slot'"
              class="rounded-xl border border-dashed border-cyan-400/40
                 bg-neutral-950/40 p-3"
              (click)="onSelect(node); $event.stopPropagation()"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="text-xs uppercase tracking-wider text-cyan-400">
                  Slot
                </div>

                <!-- Identificador visual del slot -->
                <div class="text-[10px] font-mono text-neutral-400">
                  {{ node.id.slice(0, 6) }}
                </div>
              </div>

              <div class="text-xs text-neutral-400 mb-1">
                bind →
                <span class="font-mono text-neutral-200">
                  {{ getFieldName(node.bindFieldId) }}
                </span>
              </div>

              <div
                class="mt-2 rounded-2xl border border-white/10 bg-neutral-950/60 p-3"
              >
                <div class="text-[11px] text-neutral-500 mb-1">
                  preview value
                </div>
                <div class="text-sm">
                  {{ resolveSlotPreview(node.bindFieldId) }}
                </div>
              </div>
            </div>

            <!-- ============ STACK / SECTION ============ -->
            <div
              *ngSwitchDefault
              class="space-y-2"
              (click)="onSelect(node); $event.stopPropagation()"
            >
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

  private getFieldById(fieldId?: string) {
    if (!fieldId) return null;
    return this.s.spec().fields.find((f) => f.id === fieldId) ?? null;
  }

  resolveSlotPreview(bindFieldId?: string) {
    const field = this.getFieldById(bindFieldId);
    if (!field) return '(unbound)';

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

  public getFieldName(fieldId?: string) {
    return this.getFieldById(fieldId)?.name ?? '(unbound)';
  }

  onSelect(node: LayoutNode) {
    console.log('SELECT NODE', node.id, node.kind);
    this.s.selectNode(node.id);
  }
}
