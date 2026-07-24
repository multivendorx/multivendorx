import { __ } from '@wordpress/i18n';

export default {
	id: 'geo',
	priority: 3,
	headerTitle: __('GEO', 'vulopilot'),
	headerIcon: 'globe',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_geo_scanning',
			type: 'checkbox',
			look: 'toggle',
			label: __('Enable GEO scanning', 'vulopilot'),
			desc: __(
				'Turns every category "geo" scanner on or off — the 8 Generative Engine Optimization checks (author info, E-E-A-T signals, trust signals, citation opportunities, summary blocks, FAQ opportunities, chunking, semantic structure).',
				'vulopilot'
			),
			options: [
				{ key: 'enabled', label: '', value: 'enabled' },
			],
		},
	],
};
