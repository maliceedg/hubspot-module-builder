import type { FieldSpec, ModuleSpec } from './module-spec';

export type LayoutNode = SectionNode | StackNode | SlotNode;

interface BaseLayoutNode {
  id: string;
  title?: string;
}

export interface SectionNode extends BaseLayoutNode {
  kind: 'section';
  children: LayoutNode[];
}

export interface StackNode extends BaseLayoutNode {
  kind: 'stack';
  children: LayoutNode[];
}

export interface SlotNode extends BaseLayoutNode {
  kind: 'slot';
  bindFieldName: string;
  title?: string;
}

const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id_${Math.random().toString(16).slice(2)}`;

const defaultField = (): FieldSpec => ({
  id: uid(),
  type: 'text',
  name: 'headline',
  label: 'Headline',
  required: false,
  defaultValue: '',
});

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
      id: 'root',
      children: [
        {
          kind: 'stack',
          id: 'content',
          title: 'content',
          children: [],
        },
      ],
    },
  };
}

/**
 * Alias por si ya lo estabas usando en algún lado.
 * Si no lo usas, elimínalo y quédate solo con createDefaultModuleSpec().
 */
export const createInitialSpec = createDefaultModuleSpec;
