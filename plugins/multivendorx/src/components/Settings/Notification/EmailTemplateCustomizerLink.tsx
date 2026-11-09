/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import { CardComponent, ModuleGuardComponent } from '@zyra/components';

/**
 * Settings > Notification > Email Template Customizer. The email builder runs inside VuloMail, so this
 * tab opens the marketplace's email template in it (the standalone "Email Template Customizer" row).
 */
const EmailTemplateCustomizerLink = () => (
	<CardComponent>
		<ModuleGuardComponent
			icon="mail"
			iconColor="purple"
			title={__('Customise your marketplace emails in VuloMail', 'multivendorx')}
			desc={__(
				'The email template editor now lives in VuloMail. Open it to edit the marketplace email template; every event email is edited there too.',
				'multivendorx'
			)}
			buttonText={__('Open the email editor', 'multivendorx')}
			buttonLink={`${appLocalizer.admin_url}admin.php?page=vulomail#&tab=email-templates&source=multivendorx&template=0`}
		/>
	</CardComponent>
);

export default EmailTemplateCustomizerLink;
