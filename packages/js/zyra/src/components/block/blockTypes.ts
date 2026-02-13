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

// Union Type for All Blocks
export type Block =TitleBlock;

// Block Configuration
export interface BlockConfig {
    id: string;
    icon: string;
    value: BlockType;
    label: string;
    name?: string;
}

// Helper Types
export type BlockPatch<T extends Block = Block> = Omit<Partial<T>, 'type' | 'id'>;
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
