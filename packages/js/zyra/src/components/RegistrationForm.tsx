// External dependencies
import React, { useEffect, useRef, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal dependencies
import ButtonCustomizer from './ButtonCustomiser';
import Elements from './Elements';
import SettingMetaBox from './SettingMetaBox';
import MultipleOptions from './MultipleOption';
import AddressField, { AddressFormField } from './AddressField';
import TextArea from './TextArea';
import FileInput from './FileInput';
import '../styles/web/RegistrationForm.scss';
import BasicInput from './BasicInput';

// Types
export type FieldValue =
    | string
    | number
    | boolean
    | FieldValue[]
    | { [key: string]: FieldValue };

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

// Block interfaces
interface BlockStyle {
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
    textAlign?: 'left' | 'center' | 'right';
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

export interface FormField {
    id: number;
    type: string;
    label: string;
    required: boolean;
    name: string;
    placeholder?: string;
    options?: Option[];
    sitekey?: string;
    readonly?: boolean;
    charlimit?: number;
    row?: number;
    column?: number;
    filesize?: number;
    disabled?: boolean;
    parentId?: number;
    isStore?: boolean;
    fields?: Array<{
        id: string | number;
        key: string;
        label: string;
        type: 'text' | 'select';
        placeholder?: string;
        options?: string[];
        required?: boolean;
    }>;
    value?: Record<string, unknown>;
    html?: string;
    text?: string;
    level?: 1 | 2 | 3;
    src?: string;
    alt?: string;
    url?: string;
    style?: BlockStyle;
    layout?: '1' | '2-50' | '2-66' | '3' | '4';
    columns?: FormField[][];
}

interface ButtonSetting {
    button_text?: string;
    button_style?: string;
    button_color?: string;
    button_background?: string;
}

interface FormSetting {
    formfieldlist?: FormField[];
    butttonsetting?: ButtonSetting;
}

interface CustomFormProps {
    onChange: (data: {
        formfieldlist: FormField[];
        butttonsetting: ButtonSetting;
    }) => void;
    name: string;
    proSettingChange: () => boolean;
    formTitlePlaceholder?: string;
    setting: Record<string, FormSetting>;
}

// TextBlockView Component
const TextBlockView: React.FC<{
    block: { type: 'text'; html: string; style?: BlockStyle };
    onChange: (html: string) => void;
}> = ({ block, onChange }) => {
    const style = {
        backgroundColor: block.style?.backgroundColor,
        padding: block.style?.padding ||
            (block.style?.paddingTop || block.style?.paddingRight || block.style?.paddingBottom || block.style?.paddingLeft
                ? `${block.style?.paddingTop || 0}px ${block.style?.paddingRight || 0}px ${block.style?.paddingBottom || 0}px ${block.style?.paddingLeft || 0}px`
                : undefined),
        margin: block.style?.margin ||
            (block.style?.marginTop || block.style?.marginRight || block.style?.marginBottom || block.style?.marginLeft
                ? `${block.style?.marginTop || 0}px ${block.style?.marginRight || 0}px ${block.style?.marginBottom || 0}px ${block.style?.marginLeft || 0}px`
                : undefined),
        textAlign: block.style?.textAlign,
        fontSize: block.style?.fontSize,
        fontFamily: block.style?.fontFamily,
        color: block.style?.color,
        lineHeight: block.style?.lineHeight,
        fontWeight: block.style?.fontWeight,
        borderWidth: block.style?.borderWidth,
        borderColor: block.style?.borderColor,
        borderStyle: block.style?.borderStyle,
        borderRadius: block.style?.borderRadius,
        width: block.style?.width,
        height: block.style?.height,
        textDecoration: block.style?.textDecoration,
    };

    return (
        <div
            className="email-text"
            style={style}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onChange(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: block.html }}
        />
    );
};

// HeadingBlockView Component
const HeadingBlockView: React.FC<{
    block: { text: string; level: 1 | 2 | 3; style?: BlockStyle };
    onChange: (text: string) => void;
}> = ({ block, onChange }) => {
    const style = {
        backgroundColor: block.style?.backgroundColor,
        padding: block.style?.padding ||
            (block.style?.paddingTop || block.style?.paddingRight || block.style?.paddingBottom || block.style?.paddingLeft
                ? `${block.style?.paddingTop || 0}px ${block.style?.paddingRight || 0}px ${block.style?.paddingBottom || 0}px ${block.style?.paddingLeft || 0}px`
                : undefined),
        margin: block.style?.margin ||
            (block.style?.marginTop || block.style?.marginRight || block.style?.marginBottom || block.style?.marginLeft
                ? `${block.style?.marginTop || 0}px ${block.style?.marginRight || 0}px ${block.style?.marginBottom || 0}px ${block.style?.marginLeft || 0}px`
                : undefined),
        textAlign: block.style?.textAlign,
        fontSize: block.style?.fontSize,
        fontFamily: block.style?.fontFamily,
        color: block.style?.color,
        lineHeight: block.style?.lineHeight,
        fontWeight: block.style?.fontWeight,
        borderWidth: block.style?.borderWidth,
        borderColor: block.style?.borderColor,
        borderStyle: block.style?.borderStyle,
        borderRadius: block.style?.borderRadius,
        textDecoration: block.style?.textDecoration,
    };

    const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;

    return (
        <Tag
            className="email-heading"
            style={style}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onChange(e.currentTarget.textContent || '')}
        >
            {block.text}
        </Tag>
    );
};

// ButtonBlockView Component
const ButtonBlockView: React.FC<{
    block: { text: string; url?: string; style?: BlockStyle };
    onChange: (text: string) => void;
}> = ({ block, onChange }) => {
    const buttonStyle = {
        backgroundColor: block.style?.backgroundColor || '#007bff',
        color: block.style?.color || '#ffffff',
        padding: block.style?.padding ||
            (block.style?.paddingTop || block.style?.paddingRight || block.style?.paddingBottom || block.style?.paddingLeft
                ? `${block.style?.paddingTop || 10}px ${block.style?.paddingRight || 20}px ${block.style?.paddingBottom || 10}px ${block.style?.paddingLeft || 20}px`
                : '10px 20px'),
        margin: block.style?.margin ||
            (block.style?.marginTop || block.style?.marginRight || block.style?.marginBottom || block.style?.marginLeft
                ? `${block.style?.marginTop || 0}px ${block.style?.marginRight || 0}px ${block.style?.marginBottom || 0}px ${block.style?.marginLeft || 0}px`
                : undefined),
        borderWidth: block.style?.borderWidth,
        borderColor: block.style?.borderColor,
        borderStyle: block.style?.borderStyle,
        borderRadius: block.style?.borderRadius || '5px',
        fontSize: block.style?.fontSize || '16px',
        fontFamily: block.style?.fontFamily || 'Arial',
        fontWeight: block.style?.fontWeight || 'bold',
        textAlign: 'center' as const,
        display: 'inline-block',
        textDecoration: block.style?.textDecoration || 'none',
        cursor: 'pointer',
    };

    const wrapperStyle = {
        textAlign: (block.style?.align || block.style?.textAlign || 'center') as 'left' | 'center' | 'right',
    };

    return (
        <div className="email-button-wrapper" style={wrapperStyle}>
            <a
                href={block.url || '#'}
                className="email-button"
                style={buttonStyle}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onChange(e.currentTarget.textContent || '')}
            >
                {block.text}
            </a>
        </div>
    );
};

// DividerBlockView Component
const DividerBlockView: React.FC<{
    block: { style?: BlockStyle };
}> = ({ block }) => {
    const style = {
        height: block.style?.height || '1px',
        backgroundColor: block.style?.backgroundColor || block.style?.color || '#cccccc',
        margin: block.style?.margin ||
            (block.style?.marginTop || block.style?.marginRight || block.style?.marginBottom || block.style?.marginLeft
                ? `${block.style?.marginTop || 20}px ${block.style?.marginRight || 0}px ${block.style?.marginBottom || 20}px ${block.style?.marginLeft || 0}px`
                : '20px 0'),
        padding: block.style?.padding,
        borderWidth: block.style?.borderWidth,
        borderColor: block.style?.borderColor,
        borderStyle: block.style?.borderStyle,
        borderRadius: block.style?.borderRadius,
        width: block.style?.width || '100%',
    };
    return <hr className="email-divider" style={style} />;
};

// ImageBlockView Component
const ImageBlockView: React.FC<{
    block: { src: string; alt?: string; style?: BlockStyle };
    onChange: (src: string) => void;
}> = ({ block, onChange }) => {
    const wrapperStyle = {
        backgroundColor: block.style?.backgroundColor,
        padding: block.style?.padding ||
            (block.style?.paddingTop || block.style?.paddingRight || block.style?.paddingBottom || block.style?.paddingLeft
                ? `${block.style?.paddingTop || 0}px ${block.style?.paddingRight || 0}px ${block.style?.paddingBottom || 0}px ${block.style?.paddingLeft || 0}px`
                : undefined),
        margin: block.style?.margin ||
            (block.style?.marginTop || block.style?.marginRight || block.style?.marginBottom || block.style?.marginLeft
                ? `${block.style?.marginTop || 0}px ${block.style?.marginRight || 0}px ${block.style?.marginBottom || 0}px ${block.style?.marginLeft || 0}px`
                : undefined),
        textAlign: (block.style?.align || 'center') as 'left' | 'center' | 'right',
    };

    const imageStyle = {
        borderWidth: block.style?.borderWidth,
        borderColor: block.style?.borderColor,
        borderStyle: block.style?.borderStyle,
        borderRadius: block.style?.borderRadius,
        width: block.style?.width || 'auto',
        height: block.style?.height || 'auto',
        maxWidth: '100%',
    };

    return (
        <div className="email-image" style={wrapperStyle}>
            {block.src ? (
                <img src={block.src} alt={block.alt || ''} style={imageStyle} />
            ) : (
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = URL.createObjectURL(file);
                        onChange(url);
                    }}
                />
            )}
        </div>
    );
};

// Helper function to get column count
const getColumnCount = (layout: '1' | '2-50' | '2-66' | '3' | '4') => {
    switch (layout) {
        case '1': return 1;
        case '2-50':
        case '2-66': return 2;
        case '3': return 3;
        case '4': return 4;
        default: return 2;
    }
};

// Default values for input options
const DEFAULT_OPTIONS: Option[] = [
    { id: '1', label: 'Manufacture', value: 'manufacture' },
    { id: '2', label: 'Trader', value: 'trader' },
    { id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
];

const DEFAULT_PLACEHOLDER = (type: string): string => `${type}`;

const DEFAULT_LABEL_SIMPLE = (
    type: string,
    isStore: boolean = false,
    name: string = ''
): string => {
    const cleanType = String(type || '')
        .trim()
        .toLowerCase();
    if (isStore) {
        const storeLabelMap: Record<string, string> = {
            name: 'Enter your store name',
            description: 'Enter your store description',
            phone: 'Enter your store phone',
            paypal_email: 'Enter your store PayPal email',
            address: 'Enter your store address',
        };
        return storeLabelMap[name];
    }

    return `Enter your ${cleanType}`;
};

const DEFAULT_LABEL_SELECT = 'Nature of Business';
const DEFAULT_FORM_TITLE = 'Demo Form';

// Example select options
const selectOptions: SelectOption[] = [
    {
        icon: 'adminfont-t-letter-bold icon-form-textbox',
        value: 'text',
        label: 'Textbox',
    },
    { icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Email' },
    {
        icon: 'adminfont-text icon-form-textarea',
        value: 'textarea',
        label: 'Textarea',
    },
    {
        icon: 'adminfont-text icon-form-textarea',
        value: 'richtext',
        label: 'Rich Text Block',
    },
    {
        icon: 'adminfont-form-textarea',
        value: 'heading',
        label: 'Heading',
    },
    {
        icon: 'adminfont-image',
        value: 'image',
        label: 'Image',
    },
    {
        icon: 'adminfont-button',
        value: 'button',
        label: 'Button',
    },
    {
        icon: 'adminfont-divider',
        value: 'divider',
        label: 'Divider',
    },
    {
        icon: 'adminfont-checkbox icon-form-checkboxes',
        value: 'checkboxes',
        label: 'Checkboxes',
    },
    {
        icon: 'adminfont-multi-select icon-form-multi-select',
        value: 'multiselect',
        label: 'Multi Select',
    },
    { icon: 'adminfont-radio icon-form-radio', value: 'radio', label: 'Radio' },
    {
        icon: 'adminfont-dropdown-checklist icon-form-dropdown',
        value: 'dropdown',
        label: 'Dropdown',
    },
    {
        icon: 'adminfont-captcha-automatic-code icon-form-recaptcha',
        value: 'recaptcha',
        label: 'reCaptcha v3',
    },
    {
        icon: 'adminfont-submission-message icon-form-attachment',
        value: 'attachment',
        label: 'Attachment',
    },
    {
        icon: 'adminfont-form-section icon-form-section',
        value: 'section',
        label: 'Section',
    },
    {
        icon: 'adminfont-calendar icon-form-store-description',
        value: 'datepicker',
        label: 'Date Picker',
    },
    {
        icon: 'adminfont-alarm icon-form-address',
        value: 'TimePicker',
        label: 'Time Picker',
    },
    {
        icon: 'adminfont-blocks',
        value: 'columns',
        label: 'Columns',
    },
];

const selectOptionsStore: SelectOption[] = [
    {
        icon: 'adminfont-t-letter-bold icon-form-textbox',
        value: 'text',
        label: 'Store Name',
        name: 'name',
    },
    {
        icon: 'adminfont-text icon-form-textarea',
        value: 'textarea',
        label: 'Store Desc',
        name: 'description',
    },
    {
        icon: 'adminfont-t-letter-bold icon-form-textbox',
        value: 'text',
        label: 'Store Phone',
        name: 'phone',
    },
    {
        icon: 'adminfont-unread icon-form-email',
        value: 'email',
        label: 'Store Paypal Email',
        name: 'paypal_email',
    },
    {
        icon: 'adminfont-divider icon-form-address',
        value: 'address',
        label: 'Store Address',
        name: 'address',
    },
];

// Component
const CustomForm: React.FC<CustomFormProps> = ({
    onChange,
    name,
    proSettingChange,
    setting,
    formTitlePlaceholder,
}) => {
    const formSetting = setting[name] || {};
    const settingHasChanged = useRef(false);
    const firstTimeRender = useRef(true);

    const [formFieldList, setFormFieldList] = useState<FormField[]>(() => {
        const inputList = formSetting.formfieldlist || [];
        if (!Array.isArray(inputList) || inputList.length <= 0) {
            return [
                {
                    id: 1,
                    type: 'title',
                    label: DEFAULT_FORM_TITLE,
                    required: true,
                    name: 'FORM_TITLE',
                },
            ];
        }
        return inputList;
    });

    const [buttonSetting, setButtonSetting] = useState<ButtonSetting>(
        formSetting.butttonsetting || {}
    );
    const [opendInput, setOpendInput] = useState<FormField | null>(null);
    const [randMaxId, setRendMaxId] = useState<number>(0);
    const [activeColumnField, setActiveColumnField] = useState<{
        parentId: number;
        columnIndex: number;
    } | null>(null);

    useEffect(() => {
        setRendMaxId(
            formFieldList.reduce(
                (maxId, field) => Math.max(maxId, field.id),
                0
            ) + 1
        );
    }, [formFieldList]);

    useEffect(() => {
        if (settingHasChanged.current) {
            settingHasChanged.current = false;
            onChange({
                formfieldlist: formFieldList,
                butttonsetting: buttonSetting,
            });
        }
    }, [buttonSetting, formFieldList]);

    const getUniqueName = () => Date.now().toString(36);

    const getNewFormField = (
        type = 'text',
        fixedName?: string,
        isStore: boolean = false
    ): FormField => {
        const newFormField: FormField = {
            id: randMaxId ?? 0,
            type,
            label: '',
            required: false,
            name: fixedName ?? `${type}-${getUniqueName()}`,
        };

        if (
            ['multiselect', 'radio', 'dropdown', 'checkboxes'].includes(
                type
            )
        ) {
            newFormField.label = DEFAULT_LABEL_SELECT;
            newFormField.options = DEFAULT_OPTIONS;
        } else if (type === 'title') {
            newFormField.label = DEFAULT_FORM_TITLE;
        } else if (type === 'richtext') {
            newFormField.label = 'Rich Text Content';
            newFormField.html = '<p>Your rich text content here. Click to edit.</p>';
            newFormField.style = {
                backgroundColor: '#ffffff',
                color: '#000000',
                fontSize: 16,
                lineHeight: 1.5,
                paddingTop: 10,
                paddingRight: 10,
                paddingBottom: 10,
                paddingLeft: 10,
            };
        } else if (type === 'heading') {
            newFormField.label = 'Heading';
            newFormField.text = 'Heading Text';
            newFormField.level = 2;
            newFormField.style = {
                backgroundColor: '#ffffff',
                color: '#000000',
                fontSize: 24,
                lineHeight: 1.5,
                fontWeight: 'bold',
                paddingTop: 10,
                paddingRight: 10,
                paddingBottom: 10,
                paddingLeft: 10,
            };
        } else if (type === 'image') {
            newFormField.label = 'Image';
            newFormField.src = '';
            newFormField.alt = '';
            newFormField.style = {
                backgroundColor: '#ffffff',
                paddingTop: 10,
                paddingRight: 10,
                paddingBottom: 10,
                paddingLeft: 10,
                align: 'center',
            };
        } else if (type === 'button') {
            newFormField.label = 'Button';
            newFormField.text = 'Click Here';
            newFormField.url = '#';
            newFormField.style = {
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
            };
        } else if (type === 'divider') {
            newFormField.label = 'Divider';
            newFormField.style = {
                backgroundColor: '#cccccc',
                height: '1px',
                marginTop: 20,
                marginBottom: 20,
                width: '100%',
            };
        } else if (type === 'columns') {
            newFormField.label = 'Column Layout';
            newFormField.layout = '2-50';
            newFormField.columns = [[], []];
            newFormField.style = {
                backgroundColor: '#ffffff',
                paddingTop: 10,
                paddingRight: 10,
                paddingBottom: 10,
                paddingLeft: 10,
            };
        } else if (type === 'address') {
            newFormField.label = 'Address';
            newFormField.fields = [
                {
                    id: randMaxId + 1,
                    key: 'address_1',
                    label: 'Address Line 1',
                    type: 'text',
                    placeholder: 'Address Line 1',
                    required: true,
                },
                {
                    id: randMaxId + 2,
                    key: 'address_2',
                    label: 'Address Line 2',
                    type: 'text',
                    placeholder: 'Address Line 2',
                },
                {
                    id: randMaxId + 3,
                    key: 'city',
                    label: 'City',
                    type: 'text',
                    placeholder: 'City',
                    required: true,
                },
                {
                    id: randMaxId + 4,
                    key: 'state',
                    label: 'State',
                    type: 'select',
                    options: [
                        'Karnataka',
                        'Maharashtra',
                        'Delhi',
                        'Tamil Nadu'
                    ],
                },
                {
                    id: randMaxId + 5,
                    key: 'country',
                    label: 'Country',
                    type: 'select',
                    options: [
                        'India',
                        'USA',
                        'UK',
                        'Canada'
                    ],
                },
                {
                    id: randMaxId + 6,
                    key: 'postcode',
                    label: 'Postal Code',
                    type: 'text',
                    placeholder: 'Postal Code',
                    required: true,
                },
            ];
            newFormField.value = {};
        } else {
            newFormField.label = DEFAULT_LABEL_SIMPLE(
                type,
                isStore,
                fixedName
            );
            newFormField.placeholder = DEFAULT_PLACEHOLDER(type);
        }

        setRendMaxId((prev) => (prev ?? 0) + 1);
        return newFormField;
    };

    const appendNewFormField = (
        index: number,
        type = 'text',
        fixedName?: string,
        readonly = false,
        isStore = false
    ) => {
        if (proSettingChange()) {
            return;
        }

        if (activeColumnField) {
            const newField: FormField = getNewFormField(type, fixedName, isStore);
            if (readonly) {
                newField.readonly = true;
            }

            const newFormFieldList = [...formFieldList];
            const parentIndex = newFormFieldList.findIndex(
                (field) => field.id === activeColumnField.parentId
            );

            if (parentIndex >= 0 && newFormFieldList[parentIndex].columns) {
                const updatedParent = { ...newFormFieldList[parentIndex] };
                const updatedColumns = [...(updatedParent.columns || [])];
                updatedColumns[activeColumnField.columnIndex] = [
                    ...(updatedColumns[activeColumnField.columnIndex] || []),
                    newField,
                ];
                updatedParent.columns = updatedColumns;
                newFormFieldList[parentIndex] = updatedParent;

                settingHasChanged.current = true;
                setFormFieldList(newFormFieldList);
                setOpendInput(newField);
                return newField;
            }
        }

        const newField: FormField = getNewFormField(type, fixedName, isStore);
        if (readonly) {
            newField.readonly = true;
        }

        const currentIndex = opendInput
            ? formFieldList.findIndex((field) => field.id === opendInput.id)
            : -1;
        const insertIndex =
            currentIndex !== -1 ? currentIndex + 1 : formFieldList.length;
        const newFormFieldList = [
            ...formFieldList.slice(0, insertIndex),
            newField,
            ...formFieldList.slice(insertIndex),
        ];

        settingHasChanged.current = true;
        setFormFieldList(newFormFieldList);
        setOpendInput(newField);
        setActiveColumnField(null);
        return newField;
    };

    const deleteParticularFormField = (index: number) => {
        if (proSettingChange()) {
            return;
        }
        const newFormFieldList = formFieldList.filter(
            (_, i) => i !== index
        );
        settingHasChanged.current = true;
        setFormFieldList(newFormFieldList);
        if (opendInput?.id === formFieldList[index].id) {
            setOpendInput(null);
        }
    };

    const deleteColumnField = (parentId: number, columnIndex: number, fieldId: number) => {
        if (proSettingChange()) {
            return;
        }

        const newFormFieldList = [...formFieldList];
        const parentIndex = newFormFieldList.findIndex(
            (field) => field.id === parentId
        );

        if (parentIndex >= 0 && newFormFieldList[parentIndex].columns) {
            const updatedParent = { ...newFormFieldList[parentIndex] };
            const updatedColumns = [...(updatedParent.columns || [])];
            updatedColumns[columnIndex] = updatedColumns[columnIndex].filter(
                (field) => field.id !== fieldId
            );
            updatedParent.columns = updatedColumns;
            newFormFieldList[parentIndex] = updatedParent;

            settingHasChanged.current = true;
            setFormFieldList(newFormFieldList);
            if (opendInput?.id === fieldId) {
                setOpendInput(null);
            }
        }
    };

    const handleFormFieldChange = (
        index: number,
        key: string,
        value: FieldValue,
        parentId: number = -1,
        columnIndex: number = -1
    ) => {
        if (proSettingChange()) {
            return;
        }

        const newFormFieldList = [...formFieldList];

        if (parentId !== -1 && columnIndex !== -1) {
            const parentIndex = newFormFieldList.findIndex(
                (field) => field.id === parentId
            );

            if (parentIndex >= 0 && newFormFieldList[parentIndex].columns) {
                const updatedParent = { ...newFormFieldList[parentIndex] };
                const updatedColumns = [...(updatedParent.columns || [])];
                const columnFields = [...updatedColumns[columnIndex]];
                
                const fieldIndex = columnFields.findIndex(
                    (field) => field.id === index
                );

                if (fieldIndex >= 0) {
                    const updatedField = { ...columnFields[fieldIndex] };
                    
                    if (key === 'style') {
                        updatedField.style = {
                            ...(updatedField.style || {}),
                            ...(value as BlockStyle)
                        };
                    } else {
                        updatedField[key as keyof FormField] = value as any;
                    }
                    
                    columnFields[fieldIndex] = updatedField;
                    updatedColumns[columnIndex] = columnFields;
                    updatedParent.columns = updatedColumns;
                    newFormFieldList[parentIndex] = updatedParent;

                    setFormFieldList(newFormFieldList);
                    settingHasChanged.current = true;

                    if (opendInput?.id === index) {
                        setOpendInput({ ...updatedField });
                    }
                }
                return;
            }
        }

        if (parentId !== -1 && columnIndex === -1) {
            const parentIndex = newFormFieldList.findIndex(
                (field) => field.id === parentId
            );
            if (parentIndex >= 0) {
                const parentField = { ...newFormFieldList[parentIndex] };
                parentField.fields = parentField.fields?.map((field) =>
                    field.id === index ? { ...field, [key]: value } : field
                );

                parentField.value = parentField.value || {};
                const changedSubField = parentField.fields?.find(
                    (field) => field.id === index
                );
                if (changedSubField?.key) {
                    parentField.value[changedSubField.key] = value;
                }

                newFormFieldList[parentIndex] = parentField;
                setFormFieldList(newFormFieldList);
                settingHasChanged.current = true;

                if (opendInput?.id === index) {
                    setOpendInput({ ...opendInput, [key]: value });
                }

                return;
            }
        }

        const updatedField = { ...newFormFieldList[index] };
        
        if (key === 'style') {
            updatedField.style = {
                ...(updatedField.style || {}),
                ...(value as BlockStyle)
            };
        } else {
            updatedField[key as keyof FormField] = value as any;
        }
        
        newFormFieldList[index] = updatedField;
        setFormFieldList(newFormFieldList);
        settingHasChanged.current = true;

        if (opendInput?.id === updatedField.id) {
            setOpendInput(updatedField);
        }
    };

    const handleFormFieldTypeChange = (index: number, newType: string) => {
        if (proSettingChange()) {
            return;
        }
        const selectedFormField = formFieldList[index];
        if (selectedFormField.type === newType) {
            return;
        }

        const newFormField = getNewFormField(newType);
        newFormField.id = selectedFormField.id;

        if (selectedFormField.readonly) {
            newFormField.readonly = true;
        }

        const newFormFieldList = [...formFieldList];
        newFormFieldList[index] = newFormField;
        settingHasChanged.current = true;
        setFormFieldList(newFormFieldList);
        setOpendInput(newFormField);
    };

    const handleColumnLayoutChange = (parentId: number, newLayout: '1' | '2-50' | '2-66' | '3' | '4') => {
        const newFormFieldList = [...formFieldList];
        const parentIndex = newFormFieldList.findIndex(
            (field) => field.id === parentId
        );

        if (parentIndex >= 0) {
            const updatedParent = { ...newFormFieldList[parentIndex] };
            const count = getColumnCount(newLayout);
            const newColumns = Array.from({ length: count }, (_, i) =>
                updatedParent.columns?.[i] || []
            );

            updatedParent.layout = newLayout;
            updatedParent.columns = newColumns;
            newFormFieldList[parentIndex] = updatedParent;

            settingHasChanged.current = true;
            setFormFieldList(newFormFieldList);
            if (opendInput?.id === parentId) {
                setOpendInput(updatedParent);
            }
        }
    };

    const renderColumnBlock = (formField: FormField, parentIndex: number) => {
        const style = {
            backgroundColor: formField.style?.backgroundColor,
            padding: formField.style?.padding ||
                (formField.style?.paddingTop || formField.style?.paddingRight || formField.style?.paddingBottom || formField.style?.paddingLeft
                    ? `${formField.style?.paddingTop || 0}px ${formField.style?.paddingRight || 0}px ${formField.style?.paddingBottom || 0}px ${formField.style?.paddingLeft || 0}px`
                    : undefined),
            borderWidth: formField.style?.borderWidth,
            borderColor: formField.style?.borderColor,
            borderStyle: formField.style?.borderStyle,
            borderRadius: formField.style?.borderRadius,
        };

        return (
            <div
                className={`email-columns layout-${formField.layout || '2-50'}`}
                style={style}
            >
                {(formField.columns || []).map((column, colIndex) => (
                    <div 
                        key={colIndex} 
                        className="email-column-wrapper"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveColumnField({
                                parentId: formField.id,
                                columnIndex: colIndex,
                            });
                            setOpendInput(formField);
                        }}
                    >
                        <div 
                            className="column-icon"
                            style={{
                                background: activeColumnField?.parentId === formField.id && 
                                           activeColumnField?.columnIndex === colIndex 
                                    ? '#007bff' 
                                    : '#ccc',
                                color: activeColumnField?.parentId === formField.id && 
                                       activeColumnField?.columnIndex === colIndex 
                                    ? '#fff' 
                                    : '#666',
                            }}
                        >
                            <i className="adminfont-plus"></i>
                        </div>

                        <div className="email-column">
                            {column.map((childField) => (
                                <div
                                    key={childField.id}
                                    className={`form-field ${
                                        opendInput?.id === childField.id ? 'active' : ''
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpendInput(childField);
                                        setActiveColumnField(null);
                                    }}
                                >
                                    {opendInput?.id === childField.id && (
                                        <section className="meta-menu">
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteColumnField(
                                                        formField.id,
                                                        colIndex,
                                                        childField.id
                                                    );
                                                }}
                                                className="admin-badge red"
                                            >
                                                <i className="admin-font adminfont-delete"></i>
                                            </span>
                                        </section>
                                    )}

                                    <section className="form-field-container-wrapper">
                                        {renderFieldContent(childField, formField.id, colIndex)}
                                    </section>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderFieldContent = (formField: FormField, parentId: number = -1, columnIndex: number = -1) => {
        if (['text', 'email', 'number'].includes(formField.type)) {
            return (
                <>
                    <p>{formField.label}</p>
                    <BasicInput
                        type={formField.type}
                        placeholder={formField.placeholder || formField.type}
                        value={''}
                        onChange={() => {}}
                    />
                </>
            );
        }

        if (formField.type === 'richtext') {
            return (
                <TextBlockView
                    block={{
                        type: 'text',
                        html: formField.html || '<p>Your text here</p>',
                        style: formField.style,
                    }}
                    onChange={(html) => {
                        if (parentId !== -1 && columnIndex !== -1) {
                            handleFormFieldChange(formField.id, 'html', html, parentId, columnIndex);
                        } else {
                            const idx = formFieldList.findIndex(
                                (f) => f.id === formField.id
                            );
                            if (idx >= 0) {
                                handleFormFieldChange(idx, 'html', html);
                            }
                        }
                    }}
                />
            );
        }

        if (formField.type === 'heading') {
            return (
                <HeadingBlockView
                    block={{
                        text: formField.text || 'Heading',
                        level: formField.level || 2,
                        style: formField.style,
                    }}
                    onChange={(text) => {
                        if (parentId !== -1 && columnIndex !== -1) {
                            handleFormFieldChange(formField.id, 'text', text, parentId, columnIndex);
                        } else {
                            const idx = formFieldList.findIndex(
                                (f) => f.id === formField.id
                            );
                            if (idx >= 0) {
                                handleFormFieldChange(idx, 'text', text);
                            }
                        }
                    }}
                />
            );
        }

        if (formField.type === 'button') {
            return (
                <ButtonBlockView
                    block={{
                        text: formField.text || 'Click Here',
                        url: formField.url,
                        style: formField.style,
                    }}
                    onChange={(text) => {
                        if (parentId !== -1 && columnIndex !== -1) {
                            handleFormFieldChange(formField.id, 'text', text, parentId, columnIndex);
                        } else {
                            const idx = formFieldList.findIndex(
                                (f) => f.id === formField.id
                            );
                            if (idx >= 0) {
                                handleFormFieldChange(idx, 'text', text);
                            }
                        }
                    }}
                />
            );
        }

        if (formField.type === 'divider') {
            return (
                <DividerBlockView
                    block={{
                        style: formField.style,
                    }}
                />
            );
        }

        if (formField.type === 'image') {
            return (
                <ImageBlockView
                    block={{
                        src: formField.src || '',
                        alt: formField.alt,
                        style: formField.style,
                    }}
                    onChange={(src) => {
                        if (parentId !== -1 && columnIndex !== -1) {
                            handleFormFieldChange(formField.id, 'src', src, parentId, columnIndex);
                        } else {
                            const idx = formFieldList.findIndex(
                                (f) => f.id === formField.id
                            );
                            if (idx >= 0) {
                                handleFormFieldChange(idx, 'src', src);
                            }
                        }
                    }}
                />
            );
        }

        if (['radio', 'dropdown', 'multiselect', 'checkboxes'].includes(formField.type)) {
            return (
                <MultipleOptions
                    formField={formField}
                    type={
                        formField.type as
                        | 'radio'
                        | 'checkboxes'
                        | 'dropdown'
                        | 'multiselect'
                    }
                    selected={false}
                />
            );
        }

        if (formField.type === 'datepicker') {
            return (
                <>
                    <p>{formField.label}</p>
                    <BasicInput
                        type="date"
                        placeholder={formField.placeholder || formField.type}
                        value={''}
                        onChange={() => {}}
                    />
                </>
            );
        }

        if (formField.type === 'TimePicker') {
            return (
                <>
                    <p>{formField.label}</p>
                    <BasicInput
                        type="time"
                        placeholder={formField.placeholder || formField.type}
                        value={''}
                        onChange={() => {}}
                    />
                </>
            );
        }

        if (formField.type === 'attachment') {
            return (
                <>
                    <p>{formField.label}</p>
                    <FileInput
                        value={''}
                        inputClass="form-input"
                        name="image"
                        type="hidden"
                        imageWidth={75}
                        imageHeight={75}
                    />
                </>
            );
        }

        if (formField.type === 'section') {
            return (
                <BasicInput
                    type="text"
                    value={formField.label}
                    placeholder={formField.placeholder || formField.type}
                    onChange={() => {}}
                />
            );
        }

        if (formField.type === 'textarea') {
            return (
                <>
                    <p>{formField.label}</p>
                    <TextArea name="content" />
                </>
            );
        }

        if (formField.type === 'recaptcha') {
            return (
                <div
                    className={`main-input-wrapper ${!formField.sitekey ? 'recaptcha' : ''}`}
                >
                    {formField.sitekey
                        ? 'reCAPTCHA has been successfully added to the form.'
                        : 'reCAPTCHA is not configured.'}
                </div>
            );
        }

        if (formField.type === 'address') {
            return (
                <AddressField
                    formField={formField as AddressFormField}
                    opendInput={opendInput}
                    setOpendInput={setOpendInput}
                />
            );
        }

        if (formField.type === 'divider') {
            return (
                <div className="divider-field">
                    <hr />
                    <span>{formField.label}</span>
                </div>
            );
        }

        return null;
    };

    const activeTab = 'blocks';
    const tabs = [
        {
            id: 'blocks',
            label: 'Blocks',
            content: (
                <>
                    <Elements
                        label="General"
                        selectOptions={selectOptions}
                        onClick={(type) => {
                            const newInput = appendNewFormField(
                                formFieldList.length - 1,
                                type
                            );
                            if (newInput && type !== 'columns') {
                                setOpendInput(newInput);
                            }
                        }}
                    />
                    <Elements
                        label="Let's get your store ready!"
                        selectOptions={selectOptionsStore}
                        onClick={(type) => {
                            const option = selectOptionsStore.find(
                                (o) => o.value === type
                            );
                            const fixedName = option?.name;
                            appendNewFormField(
                                formFieldList.length - 1,
                                type,
                                fixedName,
                                true,
                                true
                            );
                            setOpendInput(null);
                        }}
                    />
                </>
            ),
        },
    ];

    return (
        <div className="registration-from-wrapper">
            <div className="elements-wrapper">
                <div className="tab-contend">
                    {tabs.map(
                        (tab) =>
                            activeTab === tab.id && (
                                <div key={tab.id} className="tab-panel">
                                    {tab.content}
                                </div>
                            )
                    )}
                </div>
            </div>

            <div className="registration-form-main-section">
                <div
                    className={`form-heading ${formFieldList[0]?.disabled ? 'disable' : ''
                    }`}
                >
                    <BasicInput
                        type= "text"
                        placeholder={formTitlePlaceholder}
                        value={formFieldList[0]?.label}
                        onChange={(e) => {
                            if (!formFieldList[0]?.disabled) {
                                handleFormFieldChange(
                                    0,
                                    'label',
                                    e.target.value
                                );
                            }
                        }}
                    />
                    <i
                        className={`adminfont-${formFieldList[0]?.disabled ? 'eye-blocked' : 'eye'
                        }`}
                        title={
                            formFieldList[0]?.disabled
                                ? 'Show Title'
                                : 'Hide Title'
                        }
                        onClick={() => {
                            const newDisabled = !formFieldList[0]?.disabled;
                            handleFormFieldChange(0, 'disabled', newDisabled);
                        }}
                    ></i>
                </div>

                <ReactSortable
                    list={formFieldList}
                    setList={(newList) => {
                        if (firstTimeRender.current) {
                            firstTimeRender.current = false;
                            return;
                        }
                        if (proSettingChange()) {
                            return;
                        }
                        settingHasChanged.current = true;
                        setFormFieldList(newList);
                    }}
                    handle=".drag-handle"
                >
                    {formFieldList.map((formField, index) => {
                        if (index === 0) {
                            return (
                                <div
                                    key={index}
                                    style={{ display: 'none' }}
                                ></div>
                            );
                        }
                        return (
                            <main
                                key={formField.id}
                                className={`form-field 
                                                ${opendInput?.id ===
                                        formField.id
                                        ? 'active drag-handle'
                                        : ''
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpendInput(formField);
                                    setActiveColumnField(null);
                                }}
                            >
                                {opendInput?.id === formField.id && (
                                    <section className="meta-menu">
                                        <span
                                            onClick={() => {
                                                const index =
                                                    formFieldList.findIndex(
                                                        (field) =>
                                                            field.id ===
                                                            opendInput.id
                                                    );
                                                if (index >= 0) {
                                                    deleteParticularFormField(
                                                        index
                                                    );
                                                }
                                                setOpendInput(null);
                                            }}
                                            className="admin-badge red"
                                        >
                                            <i className="admin-font adminfont-delete"></i>
                                        </span>
                                    </section>
                                )}
                                <section className={`form-field-container-wrapper`}>
                                    {formField.type === 'columns' ? (
                                        renderColumnBlock(formField, index)
                                    ) : (
                                        renderFieldContent(formField)
                                    )}
                                </section>
                            </main>
                        );
                    })}
                </ReactSortable>

                <ButtonCustomizer
                    text={
                        (buttonSetting.button_text &&
                            buttonSetting.button_text) ||
                        'Submit'
                    }
                    setting={buttonSetting}
                    onChange={(key, value, isRestoreDefaults = false) => {
                        if (proSettingChange()) {
                            return;
                        }
                        settingHasChanged.current = true;
                        const previousSetting = buttonSetting || {};
                        if (isRestoreDefaults) {
                            setButtonSetting(value as ButtonSetting);
                        } else {
                            setButtonSetting({
                                ...previousSetting,
                                [key]: value,
                            });
                        }
                    }}
                />
            </div>

            <div className="registration-edit-form-wrapper">
                {opendInput && (
                    <>
                        <div className="registration-edit-form">
                            {opendInput.readonly ? (
                                <SettingMetaBox
                                    formField={opendInput}
                                    opened={{ click: true }}
                                    metaType="setting-meta"
                                    inputTypeList={[]}
                                    onChange={(key, value) => {
                                        if (
                                            key !== 'label' &&
                                            key !== 'placeholder' &&
                                            key !== 'disabled'
                                        ) {
                                            return;
                                        }

                                        if (opendInput?.parentId) {
                                            handleFormFieldChange(
                                                opendInput.id,
                                                key,
                                                value,
                                                opendInput.parentId
                                            );
                                        } else {
                                            const index =
                                                formFieldList.findIndex(
                                                    (field) =>
                                                        field.id === opendInput.id
                                                );
                                            if (index >= 0) {
                                                handleFormFieldChange(
                                                    index,
                                                    key,
                                                    value
                                                );
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <SettingMetaBox
                                    formField={opendInput}
                                    opened={{ click: true }}
                                    onChange={(key, value) => {
                                        let parentId = -1;
                                        let columnIndex = -1;
                                        
                                        formFieldList.forEach((field) => {
                                            if (field.columns) {
                                                field.columns.forEach((column, colIdx) => {
                                                    const foundField = column.find(f => f.id === opendInput.id);
                                                    if (foundField) {
                                                        parentId = field.id;
                                                        columnIndex = colIdx;
                                                    }
                                                });
                                            }
                                        });

                                        if (key === 'layout' && opendInput.type === 'columns') {
                                            handleColumnLayoutChange(
                                                opendInput.id,
                                                value as '1' | '2-50' | '2-66' | '3' | '4'
                                            );
                                        } else if (parentId !== -1 && columnIndex !== -1) {
                                            handleFormFieldChange(
                                                opendInput.id,
                                                key,
                                                value,
                                                parentId,
                                                columnIndex
                                            );
                                        } else {
                                            const index = formFieldList.findIndex(
                                                (field) => field.id === opendInput.id
                                            );
                                            if (index >= 0) {
                                                handleFormFieldChange(
                                                    index,
                                                    key,
                                                    value
                                                );
                                            }
                                        }
                                    }}
                                    onTypeChange={(newType) => {
                                        const index = formFieldList.findIndex(
                                            (field) => field.id === opendInput.id
                                        );
                                        if (index >= 0) {
                                            handleFormFieldTypeChange(
                                                index,
                                                newType
                                            );
                                        }
                                    }}
                                    inputTypeList={selectOptions}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CustomForm;
