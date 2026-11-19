/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import PreviewFrame from './PreviewFrame';
import ShowProPopup from '../Popup/Popup';

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

	return <PreviewFrame previewPath="vuloform-wholesale-preview" />;
};

export default WholesaleFormPanel;
