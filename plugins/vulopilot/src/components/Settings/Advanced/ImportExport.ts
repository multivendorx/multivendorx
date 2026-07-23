import { __ } from '@wordpress/i18n';

/**
 * `modal` is deliberately empty — Settings.tsx's own GetForm() special-cases
 * this tab id and renders a hand-built ImportExportPanel instead of
 * InputRenderer (same "special component" escape hatch the free
 * multivendorx plugin's Settings.tsx uses for StoreStatus/Invoice/etc.).
 * File download/upload and a destructive reset don't fit InputRenderer's
 * per-field auto-save model, so this tab only needs to exist for
 * NavigatorComponent's sidebar link + header — the actual UI lives
 * elsewhere.
 */
export default {
	id: 'import-export',
	priority: 2,
	headerTitle: __('Import / Export', 'vulopilot'),
	headerIcon: 'download',
	submitUrl: 'settings',
	modal: [],
};
