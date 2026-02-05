import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockType('multivendorx/store-policy', {
	edit: () => {
		return (
			<div className="multivendorx-store-policy">
				<h2>{__('Store Policy', 'multivendorx')}</h2>

				<div className="policy-item">
					<h4>{__('Store Policy', 'multivendorx')}</h4>
					<p>{__('Store policy description goes here.', 'multivendorx')}</p>
				</div>

				<div className="policy-item">
					<h4>{__('Shipping Policy', 'multivendorx')}</h4>
					<p>{__('Shipping policy description goes here.', 'multivendorx')}</p>
				</div>

				<div className="policy-item">
					<h4>{__('Refund Policy', 'multivendorx')}</h4>
					<p>{__('Refund policy description goes here.', 'multivendorx')}</p>
				</div>

				<div className="policy-item">
					<h4>{__('Cancellation Policy', 'multivendorx')}</h4>
					<p>{__('Cancellation policy description goes here.', 'multivendorx')}</p>
				</div>
			</div>
		);
	},

	save: () => {
		return (
			<div className="multivendorx-store-policy">
				<h2>Store Policy</h2>

				<div className="policy-item" data-policy="storePolicy"></div>
				<div className="policy-item" data-policy="shippingPolicy"></div>
				<div className="policy-item" data-policy="refundPolicy"></div>
				<div className="policy-item" data-policy="cancellationPolicy"></div>
			</div>
		);
	}
});

document.addEventListener('DOMContentLoaded', () => {
	const policies = StoreInfo?.storeDetails || {};

	const titles = {
		storePolicy: 'Store Policy',
		shippingPolicy: 'Shipping Policy',
		refundPolicy: 'Refund Policy',
		cancellationPolicy: 'Cancellation Policy',
	};

	document
		.querySelectorAll('.multivendorx-store-policy .policy-item')
		.forEach((el) => {
			const key = el.dataset.policy;
			const value = policies[key];

			if (!value) return;

			el.innerHTML = `
				<h4>${titles[key] || ''}</h4>
				<p>${value}</p>
			`;
		});
});
