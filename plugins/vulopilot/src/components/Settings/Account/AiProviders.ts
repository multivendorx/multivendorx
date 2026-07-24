import { __ } from '@wordpress/i18n';

/**
 * Informational only — AI provider credentials live in the dedicated,
 * encrypted-at-rest `vulopilot_ai_provider_configs` table
 * (Repositories\AiProviderConfigRepository), not in this plugin's flat
 * settings option row, and there's no admin UI for managing that table
 * yet (ARCHITECTURE.md's "What's deliberately NOT here yet"). Rather than
 * fabricate an editable "default provider" setting with nothing real to
 * hook into, this tab is honest about what exists today.
 */
export default {
	id: 'ai-providers',
	priority: 1,
	headerTitle: __('AI Providers', 'vulopilot'),
	headerIcon: 'admin-generic',
	submitUrl: 'settings',
	modal: [
		{
			key: 'ai_providers_notice',
			type: 'notice',
			label: '',
			noticeType: 'info',
			message: __(
				'AI provider credentials are stored separately (encrypted at rest) and aren\'t managed from this Settings screen yet. See the AI Assistant page for usage history.',
				'vulopilot'
			),
		},
	],
};
