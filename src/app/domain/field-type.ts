export type FieldType = 'text' | 'boolean' | 'image';

export const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'image', label: 'Image' },
] as const;
