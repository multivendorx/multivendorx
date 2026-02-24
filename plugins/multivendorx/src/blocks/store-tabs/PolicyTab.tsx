import { __ } from '@wordpress/i18n';
const PolicyTab = () => {
	const policies = StoreInfo.storeDetails || {};

	return (
		<div className="multivendorx-policies-accordion">
			<div className="accordion-item">
				<div className="accordion-header">
					{__('Store Policy', 'multivendorx')}
				</div>
				<div className="accordion-body">
					<p>{policies['storePolicy']}</p>
				</div>
			</div>

			<div className="accordion-item">
				<div className="accordion-header">
					{__('Shipping Policy', 'multivendorx')}
				</div>
				<div className="accordion-body">
					<p>{policies['shippingPolicy']}</p>
				</div>
			</div>

			<div className="accordion-item">
				<div className="accordion-header">
					{__('Refund Policy', 'multivendorx')}
				</div>
				<div className="accordion-body">
					<p>{policies['refundPolicy']}</p>
				</div>
			</div>

			<div className="accordion-item">
				<div className="accordion-header">
					{__(
						'Cancellation / Return / Exchange Policy',
						'multivendorx'
					)}
				</div>
				<div className="accordion-body">
					<p>{policies['refundPolicy']}</p>
				</div>
			</div>
		</div>
	);
};

export default PolicyTab;