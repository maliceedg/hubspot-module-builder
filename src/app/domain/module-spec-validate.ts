import type { ModuleSpec, LayoutNode } from "./module-spec";

export interface ValidationIssue {
  path: string;
  message: string;
}

const walk = (node: LayoutNode, fn: (n: LayoutNode) => void) => {
  fn(node);
  for (const c of (node.kind === "slot" ? [] : node.children ?? [])) walk(c, fn);
};

export function validateModuleSpec(spec: ModuleSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!spec.module.name?.trim()) {
    issues.push({ path: "module.name", message: "Name is required." });
  }

  if (!spec.module.slug?.trim()) {
    issues.push({ path: "module.slug", message: "Slug is required." });
  }

  if (!spec.module.contentTypes?.length) {
    issues.push({
      path: "module.contentTypes",
      message: "Select at least one content type.",
    });
  }

  // Field names únicos
  const names = spec.fields.map((f) => f.name);
  const dup = names.find((n, i) => names.indexOf(n) !== i);
  if (dup) {
    issues.push({
      path: "fields",
      message: `Duplicate field name: "${dup}"`,
    });
  }

  // Slots deben apuntar a campos existentes
  const fieldNameSet = new Set(spec.fields.map((f) => f.name));
  walk(spec.layout, (n) => {
    if (n.kind === "slot" && !fieldNameSet.has(n.bindFieldName)) {
      issues.push({
        path: "layout",
        message: `Slot references missing field: "${n.bindFieldName}"`,
      });
    }
  });

  return issues;
}

/**
 * Alias opcional (si ya lo estabas importando con otro nombre).
 */
export const validateSpec = validateModuleSpec;
