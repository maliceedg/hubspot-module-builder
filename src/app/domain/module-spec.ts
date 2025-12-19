// domain/module-spec.ts
export type FieldType = 'text' | 'boolean' | 'image';

export interface FieldSpecBase {
  id: string;
  name: string; // HubSpot "name" (identifier used in HubL: module.<name>)
  label: string;
  required?: boolean;
}

export interface TextFieldSpec extends FieldSpecBase {
  type: 'text';
  defaultValue?: string;
  maxLength?: number;
}

export interface BooleanFieldSpec extends FieldSpecBase {
  type: 'boolean';
  defaultValue?: boolean;
}

export interface ImageFieldSpec extends FieldSpecBase {
  type: 'image';
  // MVP: mantén simple. Luego puedes modelar src/alt/size, etc.
  defaultValue?: string;
}

export type FieldSpec = TextFieldSpec | BooleanFieldSpec | ImageFieldSpec;

// -----------------------
// Layout
// -----------------------
export interface BaseLayoutNode {
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
  /** Binding estable: no se rompe al renombrar fields */
  bindFieldId?: string;
}

export type LayoutNode = SectionNode | StackNode | SlotNode;

// -----------------------
// HubSpot meta
// -----------------------
export type HubSpotContentType =
  | 'SITE_PAGE'
  | 'LANDING_PAGE'
  | 'BLOG_POST'
  | 'BLOG_LISTING'
  | 'EMAIL'
  | 'CUSTOMER_PORTAL'
  | 'WEB_INTERACTIVE';

export interface ModuleSpec {
  specVersion: '1.0';
  module: {
    name: string;
    slug: string;
    contentTypes: HubSpotContentType[];
  };
  fields: FieldSpec[];
  layout: LayoutNode;
}
