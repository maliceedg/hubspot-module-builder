import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { GeneratedFiles } from './module-files';

export const exportZip = async (files: GeneratedFiles, filename: string) => {
  const zip = new JSZip();

  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, filename);
};
