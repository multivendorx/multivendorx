// Base Types

export interface Option {
    id: string;
    label: string;
    value: string;
    isdefault?: boolean;
}

export interface SelectOption {
    icon: string;
    value: string;
    label: string;
    name?: string;
}

// Style Types

export interface BlockStyle {
    backgroundColor?: string;
    padding?: number | string;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    margin?: number | string;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    lineHeight?: number;
    fontWeight?: string;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: string;
    borderRadius?: number;
    width?: string;
    height?: string;
    textDecoration?: string;
    align?: 'left' | 'center' | 'right';
}

// Block Type Definitions

export type BlockType = 
    | 'text'
    | 'email'
    | 'number'
    | 'textarea'
    | 'richtext'
    | 'heading'
    | 'image'
    | 'button'
    | 'divider'
    | 'columns'
    | 'radio'
    | 'dropdown'
    | 'multiselect'
    | 'checkboxes'
    | 'datepicker'
    | 'TimePicker'
    | 'attachment'
    | 'section'
    | 'recaptcha'
    | 'address'
    | 'title';

export type ColumnLayout = '1' | '2-50' | '2-66' | '3' | '4';

// Base Block Interface

export interface BaseBlock {
    id: number;
    type: BlockType;
    label: string;
    required?: boolean;
    name?: string;
    disabled?: boolean;
    readonly?: boolean;
    style?: BlockStyle;
}

// Specific Block Interfaces

export interface TextBlock extends BaseBlock {
    type: 'text' | 'email' | 'number';
    placeholder?: string;
    charlimit?: number;
}

export interface TextAreaBlock extends BaseBlock {
    type: 'textarea';
    placeholder?: string;
    charlimit?: number;
    row?: number;
    column?: number;
}

export interface RichTextBlock extends BaseBlock {
    type: 'richtext';
    html: string;
}

export interface HeadingBlock extends BaseBlock {
    type: 'heading';
    text: string;
    level: 1 | 2 | 3;
}

export interface ImageBlock extends BaseBlock {
    type: 'image';
    src: string;
    alt?: string;
}

export interface ButtonBlock extends BaseBlock {
    type: 'button';
    text: string;
    url?: string;
}

export interface DividerBlock extends BaseBlock {
    type: 'divider';
}

export interface ColumnsBlock extends BaseBlock {
    type: 'columns';
    layout: ColumnLayout;
    columns: Block[][];
}

export interface SelectionBlock extends BaseBlock {
    type: 'radio' | 'dropdown' | 'multiselect' | 'checkboxes';
    options: Option[];
}

export interface DatePickerBlock extends BaseBlock {
    type: 'datepicker';
    placeholder?: string;
}

export interface TimePickerBlock extends BaseBlock {
    type: 'TimePicker';
    placeholder?: string;
}

export interface AttachmentBlock extends BaseBlock {
    type: 'attachment';
    filesize?: number;
}

export interface SectionBlock extends BaseBlock {
    type: 'section';
    placeholder?: string;
}

export interface RecaptchaBlock extends BaseBlock {
    type: 'recaptcha';
    sitekey?: string;
}

export interface AddressField {
    id: string | number;
    key: string;
    label: string;
    type: 'text' | 'select';
    placeholder?: string;
    options?: string[];
    required?: boolean;
}

export interface AddressBlock extends BaseBlock {
    type: 'address';
    fields: AddressField[];
    value?: Record<string, unknown>;
}

export interface TitleBlock extends BaseBlock {
    type: 'title';
}

// Union Type for All Blocks
export type Block = 
    | TextBlock
    | TextAreaBlock
    | RichTextBlock
    | HeadingBlock
    | ImageBlock
    | ButtonBlock
    | DividerBlock
    | ColumnsBlock
    | SelectionBlock
    | DatePickerBlock
    | TimePickerBlock
    | AttachmentBlock
    | SectionBlock
    | RecaptchaBlock
    | AddressBlock
    | TitleBlock;

// Block Configuration

export interface BlockConfig {
    id: string;
    icon: string;
    value: BlockType;
    label: string;
    name?: string;
    category: 'basic' | 'advanced' | 'layout' | 'store';
}

// Helper Types

export type BlockPatch<T extends Block = Block> = Omit<Partial<T>, 'type' | 'id'>;

export type FieldValue = string | number | boolean | FieldValue[] | { [key: string]: FieldValue };

// Constants

export const DEFAULT_BLOCK_STYLES: Partial<BlockStyle> = {
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: 16,
    lineHeight: 1.5,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
};
