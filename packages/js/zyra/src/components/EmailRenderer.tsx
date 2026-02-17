// External Dependencies
import React from 'react';

// Internal Dependencies
import CanvasEditor from './CanvasEditor/CanvasEditor';
import { FieldComponent } from './types';
import { Block } from './CanvasEditor/blockTypes';
import '../styles/web/RegistrationForm.scss';

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
        { id: 'heading', icon: 'form-textarea', value: 'heading', label: 'Heading', fixedName: 'email-heading', placeholder: 'Enter your heading here' },
        { id: 'richtext', icon: 't-letter-bold', value: 'richtext', label: 'Text', fixedName: 'email-text', placeholder: '<p>Enter your text content here</p>' },
        { id: 'image', icon: 'image', value: 'image', label: 'Image', fixedName: 'email-image', placeholder: '' },
        { id: 'button', icon: 'button', value: 'button', label: 'Button', fixedName: 'email-button', placeholder: 'Click me' },
        { id: 'divider', icon: 'divider', value: 'divider', label: 'Divider', fixedName: 'email-divider' },
        { id: 'columns', icon: 'blocks', value: 'columns', label: 'Columns', fixedName: 'email-columns' },
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
        // Immediately save when template changes
        const updatedTemplates = templates.map(t => 
            t.id === id ? { ...t, blocks: t.blocks || [] } : t
        );
        onChange({ templates: updatedTemplates, activeTemplateId: id });
    }, [templates, onChange]);

    const handleBlocksChange = React.useCallback((updatedBlocks: Block[]) => {
        setTemplates(prev => {
            const updated = prev.map(t => 
                t.id === activeTemplateId ? { ...t, blocks: updatedBlocks } : t
            );
            // Trigger onChange immediately with the updated templates
            onChange({ templates: updated, activeTemplateId });
            return updated;
        });
    }, [activeTemplateId, onChange]);

    // Also save when templates change (for reordering, etc)
    React.useEffect(() => {
        // Skip if it's the initial load
        const isInitialLoad = !savedData.templates && templates === DEFAULT_TEMPLATES;
        if (!isInitialLoad) {
            onChange({ templates, activeTemplateId });
        }
    }, [templates, activeTemplateId]);

    if (!activeTemplate) {
        return <div className="email-template-error"><p>No active template found</p></div>;
    }

    return (
        <CanvasEditor
            blocks={activeTemplate.blocks || []}
            onChange={handleBlocksChange}
            blockGroups={EMAIL_BLOCK_GROUPS}
            visibleGroups={['email']}
            templates={templates}
            activeTemplateId={activeTemplateId}
            onTemplateSelect={handleTemplateSelect}
            showTemplatesTab={true}
            groupName="email"
            proSettingChange={proSettingChange}
            context="email"
        />
    );
};

const EmailTemplate: FieldComponent = {
    render: EmailTemplateUI,
    validate: (field, value) => field.required && !value ? `${field.label} is required` : null,
};

export default EmailTemplate;