import { __ } from '@wordpress/i18n';

export default {
	id: 'modules',
	priority: 12,
	headerTitle: __('Modules', 'catalogx'),
	headerDescription: __(
		'Turn on only the features your store uses. A module’s settings and pages appear once it is on; turning it off hides them again.',
		'catalogx'
	),
	// Modules.tsx draws its own header (as VuloCart's Modules tab does), so the settings tab header is skipped.
	hideSettingHeader: true,
	headerIcon: 'module',
	submitUrl: 'settings',
	modal: [],
};
