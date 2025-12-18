import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';

export type GeneratedFiles = Record<string, string>;

export async function publishViaHsCli(params: {
  account: string;
  remotePath: string; // e.g. "hsmb/test-4.module"
  files: GeneratedFiles; // paths -> contents
}): Promise<{ ok: boolean; logs: string[] }> {
  const logs: string[] = [];
  const dir = await mkdtemp(join(tmpdir(), 'hsmb-'));

  try {
    // write files to temp dir
    for (const [relPath, content] of Object.entries(params.files)) {
      const abs = join(dir, relPath);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, content, 'utf8');
    }

    // Determine local module folder:
    // We expect something like "<slug>.module/module.html" inside files.
    const moduleFolder = Object.keys(params.files)
      .map((p) => p.replaceAll('\\', '/').split('/')[0])
      .find((p) => p.endsWith('.module'));

    if (!moduleFolder) {
      return { ok: false, logs: ['No .module folder found in files payload.'] };
    }

    const localPath = join(dir, moduleFolder);

    const hsArgs = [
      'cms',
      'upload',
      localPath,
      params.remotePath,
      `--account=${params.account}`,
    ];

    logs.push(`> hs ${hsArgs.join(' ')}`);

    const proc = spawn('hs', hsArgs, { shell: true });

    proc.stdout.on('data', (d) => logs.push(String(d).trimEnd()));
    proc.stderr.on('data', (d) => logs.push(String(d).trimEnd()));

    const exitCode: number = await new Promise((resolve) =>
      proc.on('close', resolve)
    );

    return { ok: exitCode === 0, logs };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
