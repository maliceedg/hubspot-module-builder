// ---- Fields ----
export type FieldType = 'text' | 'boolean' | 'image';

export type FieldSpec =
  | {
      id: string;
      type: 'text';
      name: string;
      label: string;
      required?: boolean;
      defaultValue?: string;
    }
  | {
      id: string;
      type: 'boolean';
      name: string;
      label: string;
      required?: boolean;
      defaultValue?: boolean;
    }
  | {
      id: string;
      type: 'image';
      name: string;
      label: string;
      required?: boolean;
    };

// ---- Layout ----
interface BaseLayoutNode {
  id: string;
  title?: string; // <- agrega title aquí
}

export type LayoutNode = SectionNode | StackNode | SlotNode;

export interface SectionNode extends BaseLayoutNode {
  kind: 'section';
  children?: LayoutNode[];
}

export interface StackNode extends BaseLayoutNode {
  kind: 'stack';
  children?: LayoutNode[];
}

export interface SlotNode extends BaseLayoutNode {
  kind: 'slot';
  bindFieldName: string;
  // sin children
}

// ---- ModuleSpec ----
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

type _Stack = Extract<LayoutNode, { kind: 'stack' }>;
type _HasTitle = _Stack['title'];
