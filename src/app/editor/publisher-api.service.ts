import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PublisherApiService {
  private baseUrl = 'http://127.0.0.1:8787';

  async publish(payload: {
    account: string;
    remoteBase: string;
    slug: string;
    files: Record<string, string>;
  }): Promise<{ ok: boolean; logs: string[] }> {
    const url = new URL('/publish', this.baseUrl).toString();

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw data ?? { ok: false, logs: ['Publish failed (no JSON body).'] };
    }

    return data;
  }

  async health(): Promise<{ ok: boolean }> {
    const url = new URL('/health', this.baseUrl).toString();
    const res = await fetch(url);
    return res.json();
  }
}
