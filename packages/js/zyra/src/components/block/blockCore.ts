import { 
    Block, 
    BlockType, 
    BlockConfig, 
    Option, 
    AddressField,
    DEFAULT_BLOCK_STYLES,
    ColumnLayout
} from './types';

// BLOCK CONFIGURATIONS
export const STORE_BLOCKS: BlockConfig[] = [
    { 
        id: 'store-name', 
        icon: 'adminfont-t-letter-bold icon-form-textbox', 
        value: 'text', 
        label: 'Store Name', 
        name: 'name', 
        category: 'store' 
    },
    { 
        id: 'store-description', 
        icon: 'adminfont-text icon-form-textarea', 
        value: 'textarea', 
        label: 'Store Desc', 
        name: 'description', 
        category: 'store' 
    },
    { 
        id: 'store-phone', 
        icon: 'adminfont-form-phone icon-form-textbox', 
        value: 'text', 
        label: 'Store Phone', 
        name: 'phone', 
        category: 'store' 
    },
    { 
        id: 'store-paypal', 
        icon: 'adminfont-unread icon-form-email', 
        value: 'email', 
        label: 'Store Paypal Email', 
        name: 'paypal_email', 
        category: 'store' 
    },
    { 
        id: 'store-address', 
        icon: 'adminfont-form-address icon-form-address', 
        value: 'address', 
        label: 'Store Address', 
        name: 'address', 
        category: 'store' 
    },
];

export const EMAIL_BLOCKS: BlockConfig[] = [
    { 
        id: 'heading', 
        icon: 'adminfont-form-textarea', 
        value: 'heading', 
        label: 'Heading', 
        category: 'advanced' 
    },
    { 
        id: 'richtext', 
        icon: 'adminfont-t-letter-bold', 
        value: 'richtext', 
        label: 'Text', 
        category: 'advanced' 
    },
    { 
        id: 'image', 
        icon: 'adminfont-image', 
        value: 'image', 
        label: 'Image', 
        category: 'advanced' 
    },
    { 
        id: 'button', 
        icon: 'adminfont-button', 
        value: 'button', 
        label: 'Button', 
        category: 'advanced' 
    },
    { 
        id: 'divider', 
        icon: 'adminfont-divider', 
        value: 'divider', 
        label: 'Divider', 
        category: 'advanced' 
    },
    { 
        id: 'columns', 
        icon: 'adminfont-blocks', 
        value: 'columns', 
        label: 'Columns', 
        category: 'layout' 
    },
];

export const REGISTRATION_BLOCKS: BlockConfig[] = [
    { id: 'text', icon: 'adminfont-t-letter-bold icon-form-textbox', value: 'text', label: 'Textbox', category: 'basic' },
    { id: 'email', icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Email', category: 'basic' },
    { id: 'textarea', icon: 'adminfont-text icon-form-textarea', value: 'textarea', label: 'Textarea', category: 'basic' },
    { id: 'datepicker', icon: 'adminfont-calendar icon-form-store-description', value: 'datepicker', label: 'Date Picker', category: 'basic' },
    { id: 'timepicker', icon: 'adminfont-alarm icon-form-address', value: 'TimePicker', label: 'Time Picker', category: 'basic' },
    { id: 'richtext', icon: 'adminfont-text icon-form-textarea', value: 'richtext', label: 'Rich Text Block', category: 'advanced' },
    { id: 'heading', icon: 'adminfont-form-textarea', value: 'heading', label: 'Heading', category: 'advanced' },
    { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image', category: 'advanced' },
    { id: 'button', icon: 'adminfont-button', value: 'button', label: 'Button', category: 'advanced' },
    { id: 'divider', icon: 'adminfont-divider', value: 'divider', label: 'Divider', category: 'advanced' },
    { id: 'checkboxes', icon: 'adminfont-checkbox icon-form-checkboxes', value: 'checkboxes', label: 'Checkboxes', category: 'basic' },
    { id: 'multiselect', icon: 'adminfont-multi-select icon-form-multi-select', value: 'multiselect', label: 'Multi Select', category: 'basic' },
    { id: 'radio', icon: 'adminfont-radio icon-form-radio', value: 'radio', label: 'Radio', category: 'basic' },
    { id: 'dropdown', icon: 'adminfont-dropdown-checklist icon-form-dropdown', value: 'dropdown', label: 'Dropdown', category: 'basic' },
    { id: 'columns', icon: 'adminfont-blocks', value: 'columns', label: 'Columns', category: 'layout' },
    { id: 'section', icon: 'adminfont-form-section icon-form-section', value: 'section', label: 'Section', category: 'layout' },
    { id: 'recaptcha', icon: 'adminfont-captcha-automatic-code icon-form-recaptcha', value: 'recaptcha', label: 'reCaptcha v3', category: 'advanced' },
    { id: 'attachment', icon: 'adminfont-submission-message icon-form-attachment', value: 'attachment', label: 'Attachment', category: 'advanced' },
    { id: 'address', icon: 'adminfont-form-address icon-form-address', value: 'address', label: 'Address', category: 'advanced' },
];

// HELPER FUNCTIONS - Configuration
export const getBlockConfig = (type: BlockType): BlockConfig | undefined =>
    REGISTRATION_BLOCKS.find(block => block.value === type);

export const getBlocksByCategory = (category: BlockConfig['category']): BlockConfig[] =>
    REGISTRATION_BLOCKS.filter(block => block.category === category);

export const isContentBlock = (type: BlockType): boolean =>
    ['richtext', 'heading', 'image', 'button', 'divider'].includes(type);

export const isFormInputBlock = (type: BlockType): boolean =>
    ['text', 'email', 'number', 'textarea', 'datepicker', 'TimePicker', 'radio', 'dropdown', 'multiselect', 'checkboxes', 'attachment', 'address'].includes(type);

export const supportsOptions = (type: BlockType): boolean =>
    ['radio', 'dropdown', 'multiselect', 'checkboxes'].includes(type);

// DEFAULT VALUES & CONSTANTS
// Helper to generate unique IDs
const getNextId = (() => {
    let counter = Date.now();
    return () => ++counter;
})();

// Helper to generate unique names
const getUniqueName = () => Date.now().toString(36);

// Default options for selection blocks
const DEFAULT_OPTIONS: Option[] = [
    { id: '1', label: 'Manufacture', value: 'manufacture' },
    { id: '2', label: 'Trader', value: 'trader' },
    { id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
];

// Default address fields
const DEFAULT_ADDRESS_FIELDS: AddressField[] = [
    { id: getNextId() + 1, key: 'address_1', label: 'Address Line 1', type: 'text', placeholder: 'Address Line 1', required: true },
    { id: getNextId() + 2, key: 'address_2', label: 'Address Line 2', type: 'text', placeholder: 'Address Line 2' },
    { id: getNextId() + 3, key: 'city', label: 'City', type: 'text', placeholder: 'City', required: true },
    { id: getNextId() + 4, key: 'state', label: 'State', type: 'select', options: ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu'] },
    { id: getNextId() + 5, key: 'country', label: 'Country', type: 'select', options: ['India', 'USA', 'UK', 'Canada'] },
    { id: getNextId() + 6, key: 'postcode', label: 'Postal Code', type: 'text', placeholder: 'Postal Code', required: true },
];

// HELPER FUNCTIONS - Factory
// Get default label for a block type
const getDefaultLabel = (
    type: BlockType,
    isStore: boolean = false,
    fixedName?: string
): string => {
    if (type === 'title') return 'Demo Form';
    
    if (isStore && fixedName) {
        const storeLabelMap: Record<string, string> = {
            name: 'Enter your store name',
            description: 'Enter your store description',
            phone: 'Enter your store phone',
            paypal_email: 'Enter your store PayPal email',
            address: 'Enter your store address',
        };
        return storeLabelMap[fixedName] || `Enter your ${type}`;
    }
    
    if (['multiselect', 'radio', 'dropdown', 'checkboxes'].includes(type)) {
        return 'Nature of Business';
    }
    
    if (['richtext', 'heading', 'image', 'button', 'divider'].includes(type)) {
        const contentLabelMap: Record<string, string> = {
            richtext: 'Rich Text Content',
            heading: 'Heading',
            image: 'Image',
            button: 'Button',
            divider: 'Divider',
        };
        return contentLabelMap[type] || type;
    }
    
    if (type === 'address') return 'Address';
    
    return `Enter your ${type}`;
};

// Get default placeholder for a block type
const getDefaultPlaceholder = (type: BlockType): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
};

// FACTORY FUNCTIONS
// Create a new block with default values
export const createBlock = (
    type: BlockType,
    fixedName?: string,
    isStore: boolean = false,
    readonly: boolean = false
): Block => {
    const id = getNextId();
    const name = fixedName ?? `${type}-${getUniqueName()}`;
    const label = getDefaultLabel(type, isStore, fixedName);

    const baseBlock = {
        id,
        type,
        label,
        name,
        required: false,
        readonly,
    };

    // Basic text inputs
    if (['text', 'email', 'number'].includes(type)) {
        return {
            ...baseBlock,
            type: type as 'text' | 'email' | 'number',
            placeholder: getDefaultPlaceholder(type),
        };
    }

    // Textarea
    if (type === 'textarea') {
        return {
            ...baseBlock,
            type: 'textarea',
            placeholder: getDefaultPlaceholder(type),
            row: 4,
            column: 50,
        };
    }

    // Rich Text
    if (type === 'richtext') {
        return {
            ...baseBlock,
            type: 'richtext',
            html: '<p>Your rich text content here. Click to edit.</p>',
            style: { ...DEFAULT_BLOCK_STYLES },
        };
    }

    // Heading
    if (type === 'heading') {
        return {
            ...baseBlock,
            type: 'heading',
            text: 'Heading Text',
            level: 2,
            style: {
                ...DEFAULT_BLOCK_STYLES,
                fontSize: 24,
                fontWeight: 'bold',
            },
        };
    }

    // Image
    if (type === 'image') {
        return {
            ...baseBlock,
            type: 'image',
            src: '',
            alt: '',
            style: {
                ...DEFAULT_BLOCK_STYLES,
                align: 'center',
            },
        };
    }

    // Button
    if (type === 'button') {
        return {
            ...baseBlock,
            type: 'button',
            text: 'Click Here',
            url: '#',
            style: {
                backgroundColor: '#007bff',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 'bold',
                paddingTop: 10,
                paddingRight: 20,
                paddingBottom: 10,
                paddingLeft: 20,
                borderRadius: 5,
                align: 'center',
            },
        };
    }

    // Divider
    if (type === 'divider') {
        return {
            ...baseBlock,
            type: 'divider',
            style: {
                backgroundColor: '#cccccc',
                height: '1px',
                marginTop: 20,
                marginBottom: 20,
                width: '100%',
            },
        };
    }

    // Columns
    if (type === 'columns') {
        return {
            ...baseBlock,
            type: 'columns',
            label: 'Column Layout',
            layout: '2-50',
            columns: [[], []],
            style: { ...DEFAULT_BLOCK_STYLES },
        };
    }

    // Selection blocks (radio, dropdown, multiselect, checkboxes)
    if (['radio', 'dropdown', 'multiselect', 'checkboxes'].includes(type)) {
        return {
            ...baseBlock,
            type: type as 'radio' | 'dropdown' | 'multiselect' | 'checkboxes',
            options: DEFAULT_OPTIONS,
        };
    }

    // Date Picker
    if (type === 'datepicker') {
        return {
            ...baseBlock,
            type: 'datepicker',
            placeholder: 'Select date',
        };
    }

    // Time Picker
    if (type === 'TimePicker') {
        return {
            ...baseBlock,
            type: 'TimePicker',
            placeholder: 'Select time',
        };
    }

    // Attachment
    if (type === 'attachment') {
        return {
            ...baseBlock,
            type: 'attachment',
            filesize: 5,
        };
    }

    // Section
    if (type === 'section') {
        return {
            ...baseBlock,
            type: 'section',
            placeholder: 'Section heading',
        };
    }

    // Recaptcha
    if (type === 'recaptcha') {
        return {
            ...baseBlock,
            type: 'recaptcha',
            sitekey: '',
        };
    }

    // Address
    if (type === 'address') {
        return {
            ...baseBlock,
            type: 'address',
            fields: DEFAULT_ADDRESS_FIELDS,
            value: {},
        };
    }

    // Title
    if (type === 'title') {
        return {
            ...baseBlock,
            type: 'title',
            required: true,
            name: 'FORM_TITLE',
        };
    }

    // Default fallback
    return {
        ...baseBlock,
        type: 'text',
        placeholder: getDefaultPlaceholder('text'),
    } as Block;
};

// Get column count based on layout
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

// Normalize a block item (handles both existing blocks and new block types)
export const normalizeBlock = (item: any): Block => {
    // Already a real block (reorder case)
    if (item.type && item.id) {
        return item as Block;
    }
    
    // Dropped from sidebar - create new block
    return createBlock(item.value || item.type);
};

// UTILITY FUNCTIONS
// Get all available block types
export const getAvailableBlockTypes = (): BlockType[] => {
    return Array.from(new Set([
        ...REGISTRATION_BLOCKS.map(block => block.value),
        ...EMAIL_BLOCKS.map(block => block.value),
        ...STORE_BLOCKS.map(block => block.value)
    ]));
};

// Find block config by type
export const findBlockConfig = (type: BlockType): BlockConfig | undefined => {
    return [
        ...REGISTRATION_BLOCKS,
        ...EMAIL_BLOCKS,
        ...STORE_BLOCKS
    ].find(block => block.value === type);
};