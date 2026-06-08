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
        blockGroups?: unknown[];
        emailTemplates?: EmailTemplate[];
        availablePlaceholder?: string[];
    };
    setting?: Record<string, BuilderValue>;
    proSettingChange?: (...args: unknown[]) => boolean;
    name?: string;
}

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

    const handleTemplateSelect = React.useCallback(
        (id: string) => {
            if (isEmailBuilder && field?.emailTemplates) {
                const originalTemplate = field.emailTemplates.find(
                    (t: EmailTemplate) => t.id === id
                );
                if (originalTemplate) {
                    // Update local state
                    setTemplates((prev) =>
                        prev.map((t) =>
                            t.id === id
                                ? { ...t, blocks: originalTemplate.blocks }
                                : t
                        )
                    );
                    // Update parent state
                    onChange({
                        emailTemplates: emailTemplates.map((t) =>
                            t.id === id
                                ? { ...t, blocks: originalTemplate.blocks }
                                : t
                        ),
                        activeEmailTemplateId: id,
                    });
                }
            }
            setActiveTemplateId(id);
        },
        [isEmailBuilder, field?.emailTemplates, emailTemplates, onChange]
    );

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
            key={activeEmailTemplateId}
            blocks={initialBlocks}
            onChange={handleBlocksChange}
            blockGroups={field?.blockGroups || []}
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
            availablePlaceholder={field?.availablePlaceholder}
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
