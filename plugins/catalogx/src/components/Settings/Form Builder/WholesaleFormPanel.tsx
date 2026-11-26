/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { FormPreview, useVuloFormPreview } from 'zyra';
import ShowProPopup from '../../Popup/Popup';
import { vuloFormPreviewLabels } from '../../../services/vuloFormPreviewLabels';

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
			{...vuloFormPreviewLabels()}
		/>
	);
};

export default WholesaleFormPanel;
