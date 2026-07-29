import { __ } from '@wordpress/i18n';

/**
 * Backed by `Utill::SETTINGS_DEFAULTS`'s Email section — unlike most of
 * this tab set, every field here is genuinely read by
 * Notifications\OrderEmails on every send: `send_order_confirmation_email`/
 * `send_status_update_email` gate whether each email fires at all, and
 * `notification_from_email` (when set) becomes the `From:` header.
 */
export default {
	id: 'email',
	priority: 1,
	headerTitle: __( 'Email', 'vulocart' ),
	headerIcon: 'mail',
	submitUrl: 'settings',
	modal: [
		{
			key: 'send_order_confirmation_email',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Send order confirmation email', 'vulocart' ),
			desc: __(
				'Emails the buyer right after they place an order.',
				'vulocart'
			),
			options: [
				{ key: 'send_order_confirmation_email', label: '', value: 'send_order_confirmation_email' },
			],
		},
		{
			key: 'send_status_update_email',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Send order status update email', 'vulocart' ),
			desc: __(
				'Emails the buyer whenever an admin changes their order\'s status.',
				'vulocart'
			),
			options: [
				{ key: 'send_status_update_email', label: '', value: 'send_status_update_email' },
			],
		},
		{
			key: 'notification_from_email',
			type: 'email',
			label: __( 'From address', 'vulocart' ),
			placeholder: __( 'orders@yourstore.com', 'vulocart' ),
			desc: __(
				'Address order emails are sent from. Leave blank to use your site\'s default mail sender.',
				'vulocart'
			),
		},
	],
};
