import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { publishViaHsCli } from './publish.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

const PublishReq = z.object({
  account: z.string().min(1),
  remoteBase: z.string().min(1), // e.g. "hsmb"
  slug: z.string().min(1),
  files: z.record(z.string(), z.string()), // GeneratedFiles
});

app.post('/publish', async (req, res) => {
  const parsed = PublishReq.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const { account, remoteBase, slug, files } = parsed.data;
    const remotePath = `${remoteBase}/${slug}.module`;

    const result = await publishViaHsCli({ account, remotePath, files });
    return res.status(result.ok ? 200 : 500).json(result);
  } catch (err: any) {
    console.error('PUBLISH FAILED:', err);
    return res.status(500).json({
      ok: false,
      logs: [
        'Publisher crashed while handling /publish',
        String(err?.message ?? err),
        String(err?.path ?? ''),
      ].filter(Boolean),
    });
  }
});

app.listen(8787, () => {
  // eslint-disable-next-line no-console
  console.log('Publisher listening on http://localhost:8787');
});
