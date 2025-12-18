import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface UiSelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <select
        class="w-full appearance-none rounded-2xl bg-neutral-950/40 border border-white/10 px-3 py-2 pr-10 text-sm text-neutral-100
               outline-none focus:ring-2 focus:ring-cyan-300/40 focus:border-cyan-300/30 hover:bg-white/5 transition
               disabled:opacity-60"
        [disabled]="disabled"
        [value]="value"
        (change)="onSelect($any($event.target).value)"
        (blur)="onBlur()"
      >
        <option
          *ngFor="let opt of options"
          [value]="opt.value"
          [disabled]="opt.disabled"
        >
          {{ opt.label }}
        </option>
      </select>

      <div
        class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-300"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
  `,
})
export class UiSelectComponent<T extends string = string>
  implements ControlValueAccessor
{
  @Input() options: ReadonlyArray<UiSelectOption> = [];

  value: T | '' = '';
  disabled = false;

  private onChange: (v: T) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: T): void {
    this.value = v ?? '';
  }
  registerOnChange(fn: (v: T) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelect(v: T) {
    this.value = v;
    this.onChange(v);
  }

  onBlur() {
    this.onTouched();
  }
}
