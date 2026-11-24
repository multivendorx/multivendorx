/* global appLocalizer */
import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { FormPreview } from 'zyra';
import ShowProPopup from '../../Popup/Popup';

/**
 * Settings → Wholesale: VuloForm-powered form preview for Pro, same upgrade card Free already
 * sees elsewhere in CatalogX (`proSetting` fields) otherwise.
 */
const WholesaleFormPanel: React.FC = () => {
	if (!appLocalizer.khali_dabba) {
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
			appLocalizer={appLocalizer}
			previewPath="vuloform-wholesale-preview"
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
			loadErrorMessage={__('The form could not be loaded.', 'catalogx')}
		/>
	);
};

export default WholesaleFormPanel;
