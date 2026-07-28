import { __ } from '@wordpress/i18n';

/**
 * Only `id`/`priority`/`headerTitle`/`headerIcon` are actually used —
 * NavigatorComponent reads these to list the tab and route to it, but
 * Settings.tsx's GetForm() special-cases `currentTab === 'ai-providers'`
 * to render AiProvidersPanel.tsx instead of InputRenderer (the same
 * escape hatch 'import-export' already uses), so `modal` below is never
 * read. AI provider credentials live in their own encrypted-at-rest
 * `vulopilot_ai_provider_configs` table (Repositories\AiProviderConfigRepository),
 * not this plugin's flat settings option row, which is why this tab can't
 * just be a normal InputRenderer-driven field list like its siblings.
 */
export default {
	id: 'ai-providers',
	priority: 1,
	headerTitle: __('AI Providers', 'vulopilot'),
	headerIcon: 'admin-generic',
	submitUrl: 'settings',
	modal: [],
};
