import type { ModuleSpec, LayoutNode } from './module-spec';

export interface ValidationIssue {
  path: string;
  message: string;
}

const walk = (node: LayoutNode, fn: (n: LayoutNode) => void) => {
  fn(node);
  if ('children' in node) {
    for (const c of node.children ?? []) walk(c, fn);
  }
};

export function validateModuleSpec(spec: ModuleSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!spec.module.name?.trim())
    issues.push({ path: 'module.name', message: 'Name is required.' });

  if (!spec.module.slug?.trim())
    issues.push({ path: 'module.slug', message: 'Slug is required.' });

  if (!spec.module.contentTypes?.length)
    issues.push({
      path: 'module.contentTypes',
      message: 'Select at least one content type.',
    });

  // MVP: si EMAIL está seleccionado, bloquéalo por ahora (hasta que adaptemos generator/reglas)
  if (spec.module.contentTypes?.includes('EMAIL')) {
    issues.push({
      path: 'module.contentTypes',
      message: 'EMAIL content type not supported yet in MVP.',
    });
  }

  // Fields: name válido + único
  const byName = new Map<string, number>();
  for (const f of spec.fields) {
    if (!f.name?.trim()) {
      issues.push({
        path: `fields.${f.id}.name`,
        message: 'Field name is required.',
      });
      continue;
    }
    if (!/^[a-z][a-z0-9_]*$/i.test(f.name)) {
      issues.push({
        path: `fields.${f.id}.name`,
        message: 'Field name must be alphanumeric/underscore.',
      });
    }
    byName.set(f.name, (byName.get(f.name) ?? 0) + 1);
  }
  for (const [name, count] of byName) {
    if (count > 1)
      issues.push({ path: 'fields', message: `Duplicate field name: ${name}` });
  }

  const fieldIds = new Set(spec.fields.map((f) => f.id));

  let slotCount = 0;
  walk(spec.layout, (n) => {
    if (n.kind !== 'slot') return;
    slotCount++;

    if (!n.bindFieldId) {
      issues.push({
        path: `layout.${n.id}.bindFieldId`,
        message: 'Slot must bind to a field.',
      });
      return;
    }

    if (!fieldIds.has(n.bindFieldId)) {
      issues.push({
        path: `layout.${n.id}.bindFieldId`,
        message: 'Slot binds to missing field (deleted?).',
      });
    }
  });

  // MVP: si no hay slots, no tiene sentido exportar/publicar (no hay contenido)
  if (slotCount === 0) {
    issues.push({
      path: 'layout',
      message: 'Add at least one slot to export/publish.',
    });
  }

  return issues;
}
