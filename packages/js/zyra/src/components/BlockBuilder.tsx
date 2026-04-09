// External Dependencies
import React from 'react';

// Internal Dependencies
import CanvasEditor from './CanvasEditor/CanvasEditor';
import { FieldComponent } from './fieldUtils';
import { Block } from './CanvasEditor/blockTypes';
import '../styles/web/BlockBuilder.scss';

interface BuilderValue {
    formfieldlist?: Block[];
    emailTemplates?: EmailTemplate[];
    activeEmailTemplateId?: string;
}

interface BlockBuilderProps {
    value?: BuilderValue;
    onChange: (data: BuilderValue) => void;
    field?: {
        key?: string;
        context?: 'form' | 'email';
        visibleGroups?: string[];
        defaultTemplateId?: string;
        emailTemplates?: EmailTemplate[];
    };
    setting?: Record<string, BuilderValue>;
    proSettingChange?: (...args: unknown[]) => boolean;
    name?: string;
}

const OPTION_PRESETS = [
    { id: '1', label: 'Manufacture', value: 'manufacture' },
    { id: '2', label: 'Trader', value: 'trader' },
    { id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
];

const REGISTRATION_BLOCK_GROUPS = [
    {
        id: 'registration',
        label: 'Blocks',
        icon: 'user',
        blocks: [
            {
                id: 'text',
                icon: 't-letter-bold',
                value: 'text',
                label: 'Enter the text',
                placeholder: 'Enter your text here',
            },
            {
                id: 'email',
                icon: 'unread',
                value: 'email',
                label: 'Email',
                placeholder: 'Enter your email here',
            },
            {
                id: 'textarea',
                icon: 'text',
                value: 'textarea',
                label: 'Enter your text',
                placeholder: 'Enter your message here',
            },
            {
                id: 'date',
                icon: 'calendar',
                value: 'date',
                label: 'Date Picker',
                placeholder: 'Select a date',
            },
            {
                id: 'time',
                icon: 'alarm ',
                value: 'time',
                label: 'Time Picker',
                placeholder: 'Select a time',
            },
            {
                id: 'checkboxes',
                icon: 'checkbox',
                value: 'checkboxes',
                label: 'Nature Of Business',
                options: OPTION_PRESETS,
            },
            {
                id: 'multi-select',
                icon: 'multi-select',
                value: 'multi-select',
                label: 'Multi Select',
                options: OPTION_PRESETS,
            },
            {
                id: 'radio',
                icon: 'radio icon-form-radio',
                value: 'radio',
                label: 'Radio',
                options: OPTION_PRESETS,
            },
            {
                id: 'dropdown',
                icon: 'dropdown-checklist',
                value: 'dropdown',
                label: 'Dropdown',
                options: OPTION_PRESETS,
            },
            {
                id: 'attachment',
                icon: 'submission-message ',
                value: 'attachment',
                label: 'Attachment',
            },
            { id: 'section', icon: 'form-section', value: 'section' },
            {
                id: 'recaptcha',
                icon: 'captcha-automatic-code',
                value: 'recaptcha',
                label: 'reCaptcha v3',
            },
        ],
    },
    {
        id: 'store',
        label: 'Store',
        icon: 'store',
        blocks: [
            {
                id: 'store-name',
                icon: 't-letter-bold',
                value: 'text',
                label: 'Store Name',
                fixedName: 'store-name',
                placeholder: 'Enter your store name',
            },
            {
                id: 'store-description',
                icon: 'text ',
                value: 'textarea',
                label: 'Store Desc',
                fixedName: 'store-description',
                placeholder: 'Enter your store description',
            },
            {
                id: 'store-phone',
                icon: 'form-phone',
                value: 'text',
                label: 'Store Phone',
                fixedName: 'store-phone',
                placeholder: 'Enter your store phone',
            },
            {
                id: 'store-paypal',
                icon: 'unread ',
                value: 'email',
                label: 'Store Paypal Email',
                fixedName: 'store-paypal',
                placeholder: 'Enter your PayPal email',
            },
            {
                id: 'store-address',
                icon: 'form-address ',
                value: 'address',
                label: 'Store Address',
                fixedName: 'store-address',
            },
        ],
    },
];

const EMAIL_BLOCK_GROUPS = [
    {
        id: 'email',
        label: 'Email Blocks',
        blocks: [
            {
                id: 'columns',
                icon: 'blocks',
                value: 'columns',
                label: 'Columns',
            },
            {
                id: 'heading',
                icon: 'form-textarea',
                value: 'heading',
                placeholder: 'Enter your heading here',
            },
            {
                id: 'richtext',
                icon: 't-letter-bold',
                value: 'richtext',
                placeholder: 'Enter your text content here',
            },
            { id: 'image', icon: 'image', value: 'image', label: 'Image' },
            {
                id: 'button',
                icon: 'button',
                value: 'button',
                placeholder: 'Click me',
            },
            {
                id: 'section',
                icon: 'section',
                value: 'section',
            },
        ],
    },
];

export interface EmailTemplate {
    id: string;
    name: string;
    previewText?: string;
    blocks: Block[];
}

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'default',
        name: 'Default Template',
        previewText: 'Start with a blank email template',
        blocks: [],
    },
];

export const BlockBuilderUI: React.FC<BlockBuilderProps> = ({
    value,
    onChange,
    field,
    setting = {},
    proSettingChange = () => false,
    name = field?.key,
}) => {
    const builderContext = field?.context || 'form';
    const isEmailBuilder = builderContext === 'email';

    /* ---------------------------
    EMAIL TEMPLATE STATE
    --------------------------- */

    const storedBuilderData = value || setting[name] || {};

    const [emailTemplates, setTemplates] = React.useState<EmailTemplate[]>(
        () => {
            if (!isEmailBuilder) {
                return [];
            }

            // Templates coming from field config (your TS file)
            if (field?.emailTemplates?.length) {
                return field.emailTemplates.map((t: EmailTemplate) => ({
                    ...t,
                    ...storedBuilderData.emailTemplates?.find(
                        (st: EmailTemplate) => st.id === t.id
                    ),
                }));
            }

            // Saved emailTemplates
            if (storedBuilderData.emailTemplates?.length) {
                return storedBuilderData.emailTemplates;
            }

            // Default fallback
            return DEFAULT_EMAIL_TEMPLATES;
        }
    );

    const [activeEmailTemplateId, setActiveTemplateId] = React.useState(
        storedBuilderData.activeEmailTemplateId ||
            field?.defaultTemplateId ||
            emailTemplates[0]?.id ||
            DEFAULT_EMAIL_TEMPLATES[0].id
    );

    const activeEmailTemplate = emailTemplates.find(
        (t) => t.id === activeEmailTemplateId
    );

    /* ---------------------------
    BLOCK CHANGE HANDLER
    --------------------------- */

    const handleBlocksChange = React.useCallback(
        (blocks: Block[]) => {
            if (!isEmailBuilder) {
                onChange({ formfieldlist: blocks });
                return;
            }

            setTemplates((prev) => {
                const updated = prev.map((t) =>
                    t.id === activeEmailTemplateId ? { ...t, blocks } : t
                );

                onChange({ emailTemplates: updated, activeEmailTemplateId });

                return updated;
            });
        },
        [isEmailBuilder, activeEmailTemplateId, onChange]
    );

    /* ---------------------------
    TEMPLATE SELECT
    --------------------------- */

    const handleTemplateSelect = React.useCallback((id: string) => {
        setActiveTemplateId(id);
    }, []);

    /* ---------------------------
    INITIAL BLOCKS
    --------------------------- */

    const initialBlocks = React.useMemo(() => {
        if (isEmailBuilder) {
            return activeEmailTemplate?.blocks || [];
        }

        if (Array.isArray(value?.formfieldlist)) {
            return value.formfieldlist;
        }
        if (Array.isArray(setting[name]?.formfieldlist)) {
            return setting[name].formfieldlist;
        }

        return [];
    }, [value, setting, name, isEmailBuilder, activeEmailTemplate]);

    const visibleGroups = field?.visibleGroups || ['registration'];

    /* ---------------------------
    RENDER
    --------------------------- */

    return (
        <CanvasEditor
            blocks={initialBlocks}
            onChange={handleBlocksChange}
            blockGroups={
                isEmailBuilder ? EMAIL_BLOCK_GROUPS : REGISTRATION_BLOCK_GROUPS
            }
            visibleGroups={visibleGroups}
            groupName={builderContext}
            proSettingChange={proSettingChange}
            context={builderContext}
            {...(isEmailBuilder && {
                templates: emailTemplates,
                activeTemplateId: activeEmailTemplateId,
                onTemplateSelect: handleTemplateSelect,
                showTemplatesTab: true,
            })}
        />
    );
};

/* ---------------------------------------------------
FIELD EXPORT
--------------------------------------------------- */

const BlockBuilder: FieldComponent = {
    render: BlockBuilderUI,
};

export default BlockBuilder;
