/**
 * FRONTEND ONLY — dynamic policy injection
 */
window.addEventListener('DOMContentLoaded', () => {
	if (
		!window.StoreInfo ||
		!StoreInfo.activeModules?.includes('store-policy')
	) {
		document
			.querySelectorAll('.multivendorx-store-policy-block')
			.forEach((block) => block.remove());
		return;
	}

	const policies = StoreInfo.storeDetails?.policies || {};

	const POLICY_KEY_MAP = {
		storePolicy: 'store_policy',
		shippingPolicy: 'shipping_policy',
		refundPolicy: 'refund_policy',
		cancellationPolicy: 'cancellation_policy',
	};

	document
		.querySelectorAll('.multivendorx-store-policy-block')
		.forEach((block) => {
			const items = block.querySelectorAll('.accordion-item');

			items.forEach((item) => {
				const key = item.dataset.policy;
				const value = policies[POLICY_KEY_MAP[key]];

				// If no policy data → remove item
				if (!key || !value) {
					item.remove();
					return;
				}

				const p = item.querySelector('.accordion-body p');

				if (p) {
					p.textContent = value;
				}
			});

			// If all items removed → remove whole block
			if (!block.querySelector('.accordion-item')) {
				block.remove();
			}
		});
});
