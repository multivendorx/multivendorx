// External Dependencies
import React from 'react';

// Internal Dependencies
import { LeftPanel, Block } from './block';
import CanvasEditor from './CanvasEditor';
import { FieldComponent } from './types';

export interface EmailTemplate {
    id: string;
    name: string;
    previewText?: string;
    blocks: Block[];
}

interface EmailTemplateProps {
    field: any;
    value: any;
    onChange: (value: any) => void;
    canAccess: boolean;
    appLocalizer: any;
    setting?: Record<string, any>;
    name?: string;
    proSettingChange?: () => boolean;
}

const EMAIL_BLOCK_GROUPS = [{
    id: 'email',
    label: 'Email Blocks',
    blocks: [
        { id: 'heading', icon: 'adminfont-form-textarea', value: 'heading', label: 'Heading', fixedName: 'email-heading', placeholder: 'Enter your heading here' },
        { id: 'richtext', icon: 'adminfont-t-letter-bold', value: 'richtext', label: 'Text', fixedName: 'email-text', placeholder: '<p>Enter your text content here</p>' },
        { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image', fixedName: 'email-image', placeholder: '' },
        { id: 'button', icon: 'adminfont-button', value: 'button', label: 'Button', fixedName: 'email-button', placeholder: 'Click me' },
        { id: 'divider', icon: 'adminfont-divider', value: 'divider', label: 'Divider', fixedName: 'email-divider' },
        { id: 'columns', icon: 'adminfont-blocks', value: 'columns', label: 'Columns', fixedName: 'email-columns' },
    ]
}];

const DEFAULT_TEMPLATES: EmailTemplate[] = [{
    id: 'default',
    name: 'Default Template',
    previewText: 'Start with a blank email template',
    blocks: [],
}];

export const EmailTemplateUI: React.FC<EmailTemplateProps> = ({
    field, value, onChange, proSettingChange = () => false,
    name = field?.key || 'email-template', setting = {},
}) => {
    const savedData = value || setting[name] || {};
    
    const [templates, setTemplates] = React.useState<EmailTemplate[]>(() => {
        if (field?.templates?.length) {
            return field.templates.map(t => ({ 
                ...t, 
                ...savedData.templates?.find((st: EmailTemplate) => st.id === t.id) 
            }));
        }
        if (savedData.templates?.length) {
            return savedData.templates;
        }
        return DEFAULT_TEMPLATES;
    });
    
    const [activeTemplateId, setActiveTemplateId] = React.useState<string>(
        savedData.activeTemplateId || field?.defaultTemplateId || templates[0]?.id || DEFAULT_TEMPLATES[0].id
    );
    
    const activeTemplate = templates.find(t => t.id === activeTemplateId);

    const handleTemplateSelect = React.useCallback((id: string) => {
        setActiveTemplateId(id);
    }, []);

    const handleBlocksChange = React.useCallback((blocks: Block[]) => {
        setTemplates(prev => 
            prev.map(t => t.id === activeTemplateId ? { ...t, blocks } : t)
        );
    }, [activeTemplateId]);

    // Trigger onChange when templates or activeTemplateId change
    React.useEffect(() => {
        onChange({ templates, activeTemplateId });
    }, [templates, activeTemplateId, onChange]);

    if (!activeTemplate) {
        return <div className="email-template-error"><p>No active template found</p></div>;
    }

    return (
        <div className="registration-from-wrapper email-builder">
            <LeftPanel
                blockGroups={EMAIL_BLOCK_GROUPS}
                templates={templates}
                activeTemplateId={activeTemplateId}
                onTemplateSelect={handleTemplateSelect}
                groupName="email" 
                showTemplatesTab 
                visibleGroups={['email']} 
            />

            <CanvasEditor
                blocks={activeTemplate.blocks}
                onChange={handleBlocksChange}
                groupName="email"
                proSettingChange={proSettingChange}
                context="email"
                blockGroups={EMAIL_BLOCK_GROUPS}
                canvasClassName="registration-form-main-section email-canvas"
            />
        </div>
    );
};

const EmailTemplate: FieldComponent = {
    render: EmailTemplateUI,
    validate: (field, value) => field.required && !value ? `${field.label} is required` : null,
};

export default EmailTemplate;