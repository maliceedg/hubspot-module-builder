import type { ModuleSpec, LayoutNode } from './module-spec';

const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id_${Math.random().toString(16).slice(2)}`;

export function createDefaultModuleSpec(): ModuleSpec {
  return {
    specVersion: '1.0',
    module: {
      name: 'New Module',
      slug: 'new-module',
      contentTypes: ['SITE_PAGE', 'LANDING_PAGE'],
    },
    fields: [],
    layout: {
      kind: 'section',
      id: uid(),
      title: 'root',
      children: [
        {
          kind: 'stack',
          id: uid(),
          title: 'content',
          children: [],
        },
      ],
    } satisfies LayoutNode,
  };
}

export const createInitialSpec = createDefaultModuleSpec;
