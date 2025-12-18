import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaletteComponent } from './components/palette.component';
import { CanvasComponent } from './components/canvas.component';
import { InspectorComponent } from './components/inspector.component';
import { EditorStateService } from './editor-state.service';
import { generateModuleFiles } from '../generator/module-files';
import { exportZip } from '../generator/export-zip';
import { PublisherApiService } from './publisher-api.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PaletteComponent,
    CanvasComponent,
    InspectorComponent,
  ],
  selector: 'app-editor-page',
  template: `
    <div class="min-h-screen text-neutral-100">
      <!-- Background -->
      <div class="fixed inset-0 -z-10 overflow-hidden">
        <div class="absolute inset-0 bg-neutral-950"></div>

        <!-- soft blobs -->
        <div
          class="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl"
        ></div>
        <div
          class="absolute top-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-3xl"
        ></div>
        <div
          class="absolute bottom-0 left-1/3 h-[32rem] w-[32rem] rounded-full bg-indigo-500/15 blur-3xl"
        ></div>

        <!-- subtle grid -->
        <div
          class="absolute inset-0 opacity-[0.08]"
          style="
            background-image:
              linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px);
            background-size: 56px 56px;
          "
        ></div>
      </div>

      <header
        class="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/40 backdrop-blur-xl"
      >
        <div class="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div class="flex items-center gap-3">
            <div
              class="h-9 w-9 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center"
            >
              <span class="text-xs font-semibold">HS</span>
            </div>
            <div>
              <div class="text-sm font-semibold tracking-wide">
                HubSpot Module Builder
              </div>
              <div class="text-xs text-neutral-400">MVP · Spec-driven</div>
            </div>
          </div>

          <div class="ml-auto flex items-center gap-2">
            <div
              class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/10 bg-white/5"
            >
              <span class="text-xs text-neutral-400">Validation</span>
              <span
                class="text-xs font-medium"
                [class.text-emerald-300]="!s.hasIssues()"
                [class.text-amber-300]="s.hasIssues()"
              >
                {{ s.hasIssues() ? s.issues().length + ' issues' : 'OK' }}
              </span>
            </div>

            <button
              class="px-4 py-2 text-xs rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 active:bg-white/20 transition
         shadow-[0_0_0_1px_rgba(255,255,255,.06),0_12px_30px_rgba(0,0,0,.35)]
         disabled:opacity-50 disabled:hover:bg-white/10"
              [disabled]="s.hasIssues()"
              (click)="onExportZip()"
            >
              Export ZIP
            </button>

            <button
              class="px-3 py-2 text-xs rounded-2xl border border-white border-opacity-10 bg-white bg-opacity-10 hover:bg-opacity-15 transition disabled:opacity-50"
              [disabled]="publishing || s.hasIssues()"
              (click)="onPublish()"
            >
              {{ publishing ? 'Publishing...' : 'Publish' }}
            </button>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-6">
        <details
          *ngIf="logs.length"
          class="mb-4 rounded-3xl border border-white border-opacity-10 bg-neutral-950 bg-opacity-40 p-4"
          open
        >
          <summary class="cursor-pointer select-none text-xs text-neutral-300">
            Publish logs ({{ logs.length }})
          </summary>

          <div class="mt-3 flex items-center justify-between">
            <div class="text-[11px] text-neutral-500">
              Últimas líneas del proceso de publicación.
            </div>

            <button
              type="button"
              class="text-[11px] px-3 py-1 rounded-2xl border border-white border-opacity-10 bg-white bg-opacity-5 hover:bg-opacity-10 transition"
              (click)="logs = []"
            >
              Clear
            </button>
          </div>

          <pre class="mt-3 text-[11px] whitespace-pre-wrap text-neutral-200">{{
            logs.join('\n')
          }}</pre>
        </details>

        <div class="grid grid-cols-12 gap-4">
          <aside class="col-span-12 lg:col-span-3">
            <div
              class="rounded-3xl border border-white border-opacity-10 bg-white bg-opacity-5 backdrop-blur-xl shadow-xl"
            >
              <app-palette />
            </div>
          </aside>

          <section class="col-span-12 lg:col-span-6">
            <div
              class="rounded-3xl border border-white border-opacity-10 bg-white bg-opacity-5 backdrop-blur-xl shadow-xl"
            >
              <app-canvas />
            </div>
          </section>

          <aside class="col-span-12 lg:col-span-3">
            <div
              class="rounded-3xl border border-white border-opacity-10 bg-white bg-opacity-5 backdrop-blur-xl shadow-xl"
            >
              <app-inspector />
            </div>
          </aside>
        </div>
      </main>
    </div>
  `,
})
export class EditorPageComponent {
  logs: string[] = [];
  publishing = false;

  constructor(
    public s: EditorStateService,
    private publisher: PublisherApiService
  ) {}

  async onExportZip() {
    const spec = this.s.spec();
    const files = generateModuleFiles(spec);
    const filename = `${spec.module.slug || 'module'}.zip`;
    await exportZip(files, filename);
  }

  async onPublish() {
    this.publishing = true;
    this.logs = [];

    try {
      const spec = this.s.spec();
      const files = generateModuleFiles(spec);

      const result = await this.publisher.publish({
        account: 'dev-edgardo',
        remoteBase: 'hsmb',
        slug: spec.module.slug,
        files,
      });

      this.logs = result.logs;
    } catch (e: any) {
      this.logs = Array.isArray(e?.logs) ? e.logs : [JSON.stringify(e)];
    } finally {
      this.publishing = false;
    }
  }
}
