/**
 * The `builderform-email` settings field (Settings → Email Customizer).
 *
 * zyra 1.0.65 stopped registering this field type, but still ships everything it is built from
 * (`EmailBuilder` and the legacy-block adapters). This registers the same field, with the same
 * saved shape `{ emailTemplates, activeEmailTemplateId }`, so existing saved templates load as-is. The email itself is rendered from the
 * saved blocks by CatalogX Pro's templates/emails/enquiry-email.php.
 *
 * Same component as MultiVendorX's EmailTemplateField.tsx; keep the two identical until zyra
 * registers this field again.
 */
import { useRef, useState } from 'react';
import { FIELD_REGISTRY } from '@zyra/core';
import type { FieldComponent } from '@zyra/core';
import {
	EmailBuilder,
	emailBlocksToLegacyEmailBlocks,
	legacyEmailBlocksToEmailBlocks,
} from '@zyra/builderform';
import type {
	EmailBlock,
	EmailTemplate,
	LegacyEmailBlock,
} from '@zyra/builderform';

interface SavedEmailTemplate {
	id: string;
	name: string;
	previewText?: string;
	blocks: LegacyEmailBlock[];
}

interface SavedEmailTemplates {
	emailTemplates?: SavedEmailTemplate[];
	activeEmailTemplateId?: string;
}

interface EmailTemplateFieldProps {
	field?: {
		emailTemplates?: SavedEmailTemplate[];
		defaultTemplateId?: string;
		/** Tags the "Insert a tag" menu offers, inserted as written, e.g. `{customer_name}`. */
		availablePlaceholder?: string[];
		/**
		 * Unit of the numbers in the saved block styles. EmailBuilder works in px; 'rem' is for a
		 * plugin whose email renderer writes numbers as rem (CatalogX Pro's EmailHTMLConverter).
		 */
		styleUnit?: 'px' | 'rem';
	};
	value?: SavedEmailTemplates;
	onChange: (value: SavedEmailTemplates) => void;
}

const PX_PER_REM = 16;

// Not lengths: a font weight, and a line height EmailBuilder reads as a multiplier.
const UNSCALED_STYLE_KEYS = ['fontWeight', 'lineHeight'];

/**
 * Rescales every numeric length in the blocks' styles, and their columns'.
 *
 * @param blocks Legacy email blocks.
 * @param factor Multiplier, e.g. 16 for rem → px.
 */
const scaleBlockStyles = (
	blocks: LegacyEmailBlock[],
	factor: number
): LegacyEmailBlock[] =>
	blocks.map((block) => ({
		...block,
		style: block.style
			? Object.fromEntries(
					Object.entries(block.style).map(([key, styleValue]) => [
						key,
						typeof styleValue === 'number' &&
						!UNSCALED_STYLE_KEYS.includes(key)
							? Math.round(styleValue * factor * 1000) / 1000
							: styleValue,
					])
				)
			: block.style,
		columns: block.columns?.map((column) =>
			scaleBlockStyles(column, factor)
		),
	}));

const EmailTemplateField = ({
	field,
	value,
	onChange,
}: EmailTemplateFieldProps) => {
	const saved = value || {};
	const toBuilderUnits = field?.styleUnit === 'rem' ? PX_PER_REM : 1;
	const toBuilderBlocks = (blocks: LegacyEmailBlock[] = []) =>
		legacyEmailBlocksToEmailBlocks(
			scaleBlockStyles(blocks, toBuilderUnits)
		);

	// The field's own templates are the base; anything saved overrides the template with its id.
	const [emailTemplates, setEmailTemplates] = useState<SavedEmailTemplate[]>(
		() => {
			if (field?.emailTemplates?.length) {
				return field.emailTemplates.map((template) => ({
					...template,
					...saved.emailTemplates?.find(
						(savedTemplate) => savedTemplate.id === template.id
					),
				}));
			}
			return saved.emailTemplates || [];
		}
	);

	const latestTemplates = useRef(emailTemplates);

	const [activeTemplateId, setActiveTemplateId] = useState(
		saved.activeEmailTemplateId ||
			field?.defaultTemplateId ||
			emailTemplates[0]?.id
	);

	const activeTemplate =
		emailTemplates.find((template) => template.id === activeTemplateId) ||
		emailTemplates[0];

	if (!activeTemplate) {
		return null;
	}

	// Without tags of its own, EmailBuilder offers its built-in ones.
	const mergeTags = field?.availablePlaceholder?.length
		? field.availablePlaceholder.map((token) => ({
				token,
				label: token.replace(/[{}[\]]/g, '').replace(/_/g, ' '),
			}))
		: undefined;

	const builderTemplates: EmailTemplate[] = emailTemplates.map(
		(template) => ({
			id: template.id,
			name: template.name,
			previewText: template.previewText,
			blocks: toBuilderBlocks(template.blocks),
		})
	);

	const saveActiveTemplateBlocks = (blocks: EmailBlock[]) => {
		// zyra 1.0.65's EmailBuilder calls onChange from inside its own state updater, i.e. while it renders;
		// updating this field (and the settings form) right there is "setState while rendering a different
		// component". Defer it until that render is done.
		queueMicrotask(() => {
			const legacyBlocks = scaleBlockStyles(
				emailBlocksToLegacyEmailBlocks(blocks),
				1 / toBuilderUnits
			);
			// Read from the ref: two changes in one tick each build on the one before.
			const updated = latestTemplates.current.map((template) =>
				template.id === activeTemplateId
					? { ...template, blocks: legacyBlocks }
					: template
			);
			latestTemplates.current = updated;
			setEmailTemplates(updated);
			onChange({
				emailTemplates: updated,
				activeEmailTemplateId: activeTemplateId,
			});
		});
	};

	const selectTemplate = (id: string) => {
		setActiveTemplateId(id);
		onChange({
			emailTemplates: latestTemplates.current,
			activeEmailTemplateId: id,
		});
	};

	return (
		<EmailBuilder
			key={activeTemplateId}
			value={toBuilderBlocks(activeTemplate.blocks)}
			onChange={saveActiveTemplateBlocks}
			templates={builderTemplates}
			activeTemplateId={activeTemplateId}
			onTemplateSelect={selectTemplate}
			mergeTags={mergeTags}
		/>
	);
};

const EmailTemplateFieldComponent: FieldComponent = {
	render: EmailTemplateField,
};

Object.assign(FIELD_REGISTRY, {
	'builderform-email': EmailTemplateFieldComponent,
});

export default EmailTemplateFieldComponent;
