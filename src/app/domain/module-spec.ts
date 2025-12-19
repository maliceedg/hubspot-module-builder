export type FieldType = 'text' | 'image' | 'boolean';

export interface FieldSpecBase {
  id: string;
  name: string; // HubSpot "name"
  label: string;
  required?: boolean;
}

export interface TextFieldSpec extends FieldSpecBase {
  type: 'text';
  defaultValue?: string;
  maxLength?: number;
}

export interface ImageFieldSpec extends FieldSpecBase {
  type: 'image';
  defaultAlt?: string;
}

export interface BooleanFieldSpec extends FieldSpecBase {
  type: 'boolean';
  defaultValue?: boolean;
}

export type FieldSpec = TextFieldSpec | ImageFieldSpec | BooleanFieldSpec;

export type LayoutKind = 'section' | 'stack' | 'slot';

export interface LayoutNodeBase {
  id: string;
  kind: LayoutKind;
  title?: string;
}

export interface SectionNode extends LayoutNodeBase {
  kind: 'section';
  children?: LayoutNode[];
}

export interface StackNode extends LayoutNodeBase {
  kind: 'stack';
  children?: LayoutNode[];
}

export interface SlotNode extends LayoutNodeBase {
  kind: 'slot';
  /** Binding estable: no se rompe al renombrar fields */
  bindFieldId?: string;
}

export type LayoutNode = SectionNode | StackNode | SlotNode;

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
