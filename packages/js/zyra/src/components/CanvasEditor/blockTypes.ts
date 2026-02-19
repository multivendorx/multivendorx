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
    | 'multi-select'
    | 'checkboxes'
    | 'datepicker'
    | 'TimePicker'
    | 'attachment'
    | 'section'
    | 'recaptcha'
    | 'address'
    | 'title';

export type ColumnLayout = '1' | '2-50' | '2-66' | '3' | '4';

export interface TitleBlock {
    type: 'title';
}
export interface Option {
    id: string;
    label: string;
    value: string;
    isdefault?: boolean;
}

export interface Block {
    id: number;
    type: BlockType;
    name: string;
    label?: string;
    placeholder?: string;
    context?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    options?: Option[];
    charlimit?: number;
    row?: number;
    column?: number;
    filesize?: number;
    sitekey?: string;   
    text?: string;                          
    level?: 1 | 2 | 3 | 4 | 5 | 6;       
    html?: string;                          
    src?: string;                           
    alt?: string;                           
    url?: string;                          
    style?: import('./blockStyle').BlockStyle;
    layout?: ColumnLayout;
    columns?: Block[][];
}
export interface ColumnsBlock extends Block {
    type: 'columns';
    layout: ColumnLayout;
    columns: Block[][];
}

// Block Configuration
export interface BlockConfig {
    id: string;
    icon: string;
    value: BlockType;
    label: string;
    name?: string;
    fixedName?: string;
    placeholder?: string;
    options?: Option[];
}

// Helper Types
export type BlockPatch<T extends Block = Block> = Partial<T>;
export type FieldValue = string | number | boolean | FieldValue[] | { [key: string]: FieldValue };

export const getColumnCount = (layout: ColumnLayout): number => {
    switch (layout) {
        case '1': return 1;
        case '2-50':
        case '2-66': return 2;
        case '3': return 3;
        case '4': return 4;
        default: return 2;
    }
};
