import { Component } from '@angular/core';
import { EditorPageComponent } from './editor/editor-page.component';

@Component({
  selector: 'app-root',
  imports: [EditorPageComponent],
  template: `<app-editor-page />`,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hs-module-builder';
}
