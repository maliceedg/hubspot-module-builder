import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../editor-state.service';
import { UiSelectComponent } from '../../ui/ui-select/ui-select.component';
import { FormsModule } from '@angular/forms';
import { FIELD_TYPE_OPTIONS, FieldType } from '../../domain/field-type';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, UiSelectComponent],
  selector: 'app-palette',
  template: `
    <div class="p-4 space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-semibold">Module</div>
          <div class="text-xs text-neutral-400">Spec + Fields</div>
        </div>
        <span
          class="text-[10px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300"
        >
          v{{ s.spec().specVersion }}
        </span>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-1">
        <div class="text-xs text-neutral-400">Name</div>
        <div class="text-sm font-medium">{{ s.spec().module.name }}</div>
        <div class="mt-2 text-xs text-neutral-400">Slug</div>
        <div class="text-xs font-mono text-neutral-200">
          {{ s.spec().module.slug }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <ui-select
          [(ngModel)]="fieldType"
          [options]="fieldTypeOptions"
          class="w-full"
        ></ui-select>

        <button
          type="button"
          class="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100
           hover:bg-white/10 transition"
          (click)="s.addField(fieldType)"
        >
          Add
        </button>

        <button
          type="button"
          *ngIf="s.selectedNodeId()"
          (click)="s.addSlotToSelected()"
          class="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100
           hover:bg-white/10 transition"
        >
          Add slot
        </button>
      </div>

      <div class="space-y-2">
        <button
          *ngFor="let f of s.spec().fields"
          class="w-full text-left p-3 rounded-2xl border border-white border-opacity-10 bg-white bg-opacity-5 hover:bg-opacity-10 transition"
          [class.border-cyan-300]="s.selectedFieldId() === f.id"
          [class.bg-opacity-10]="s.selectedFieldId() === f.id"
          (click)="s.selectField(f.id)"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium">{{ f.label }}</div>
            <span
              class="text-[10px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300"
            >
              {{ f.type }}
            </span>
          </div>
          <div class="mt-1 text-xs text-neutral-400 font-mono">
            {{ f.name }}
          </div>
        </button>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5 p-3">
        <div class="text-sm font-semibold">Validation</div>
        <div *ngIf="!s.hasIssues()" class="mt-2 text-xs text-emerald-300">
          No issues.
        </div>

        <ul
          *ngIf="s.hasIssues()"
          class="mt-2 text-xs text-amber-300 list-disc pl-4 space-y-1"
        >
          <li *ngFor="let i of s.issues()">{{ i.path }} — {{ i.message }}</li>
        </ul>
      </div>
    </div>
  `,
})
export class PaletteComponent {
  fieldType: FieldType = 'text';
  fieldTypeOptions = FIELD_TYPE_OPTIONS;
  open = false;

  constructor(public s: EditorStateService) {}

  selectType(t: 'text' | 'boolean' | 'image') {
    this.fieldType = t;
    this.open = false;
  }

  fieldTypeLabel(t: 'text' | 'boolean' | 'image') {
    return t === 'text' ? 'Text' : t === 'boolean' ? 'Boolean' : 'Image';
  }
}
