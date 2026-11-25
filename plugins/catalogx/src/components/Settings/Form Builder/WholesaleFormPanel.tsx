/* global appLocalizer */
import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { FormPreview, useVuloFormPreview } from 'zyra';
import ShowProPopup from '../../Popup/Popup';

/**
 * Settings → Wholesale: VuloForm-powered form preview for Pro, same upgrade card Free already
 * sees elsewhere in CatalogX (`proSetting` fields) otherwise.
 */
const WholesaleFormPanel: React.FC = () => {
	const loadErrorMessage = __('The form could not be loaded.', 'catalogx');
	const wholesale = appLocalizer.vuloform_wholesale;

	// Hooks must run unconditionally -- call it with a 0 form id (a no-op fetch) when there's
	// nothing to preview yet (no license, or the field isn't localized for a free-tier site).
	const { data: embed, error } = useVuloFormPreview(
		appLocalizer.apiUrl,
		wholesale?.form_id ?? 0,
		Boolean(wholesale?.installed),
		loadErrorMessage
	);

	if (!appLocalizer.khali_dabba || !wholesale) {
		return (
			<ShowProPopup
				feature={{
					title: __('Wholesale form builder', 'catalogx'),
					description: __(
						'Build and customize the wholesale registration form with VuloForm.',
						'catalogx'
					),
					icon: 'wholesale',
				}}
			/>
		);
	}

	return (
		<FormPreview
			adminUrl={appLocalizer.url}
			installed={wholesale.installed}
			pluginUrl={wholesale.plugin_url}
			canActivate={wholesale.can_activate}
			formId={wholesale.form_id}
			embed={embed}
			error={error}
			companionTitle={__('Enable VuloForm', 'catalogx')}
			companionDesc={__(
				'This form is built with VuloForm. Activate the plugin to show it and edit it here.',
				'catalogx'
			)}
			activateLabel={__('Activate VuloForm', 'catalogx')}
			installLabel={__('Install VuloForm', 'catalogx')}
			editLabel={__('Edit form', 'catalogx')}
			noticeText={sprintf(
				/* translators: %s: VuloForm link. */
				__(
					'This form is editable in %s. Use Edit form to change its fields and settings. Changes show here after you save the form and reload this page.',
					'catalogx'
				),
				'<a href="https://wordpress.org/plugins/vuloform/" target="_blank" rel="noopener noreferrer"><strong>VuloForm</strong></a>'
			)}
		/>
	);
};

export default WholesaleFormPanel;
