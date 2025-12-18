import type { FieldSpec } from '../domain/module-spec';

type HubSpotField = Record<string, unknown>;

const assertNever = (x: never): never => {
  throw new Error(`Unhandled field type: ${JSON.stringify(x)}`);
};

export const toHubSpotFieldsJson = (fields: FieldSpec[]): HubSpotField[] => {
  return fields.map((f) => {
    switch (f.type) {
      case 'text':
        return {
          name: f.name,
          label: f.label,
          type: 'text',
          required: !!f.required,
          default: f.defaultValue ?? '',
        };

      case 'boolean':
        return {
          name: f.name,
          label: f.label,
          type: 'boolean',
          required: !!f.required,
          default: f.defaultValue ?? false,
        };

      case 'image':
        return {
          name: f.name,
          label: f.label,
          type: 'image',
          required: !!f.required,
        };

      default:
        return assertNever(f);
    }
  });
};
