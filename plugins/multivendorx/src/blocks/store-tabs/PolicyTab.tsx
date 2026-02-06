const PolicyTab = () => {
	const policies = StoreInfo.storeDetails || {};
	return (
		<div className="multivendorx-policies-accordion">
			<div className="accordion-item">
				<div className="accordion-header">
					Store Policy
				</div>
				<div className="accordion-body">
					<p>{policies['storePolicy']}</p>
				</div>
			</div>

			<div className="accordion-item">
				<div className="accordion-header">
					Shipping Policy
				</div>
				<div className="accordion-body">
					<p>{policies['shippingPolicy']}</p>
				</div>
			</div>

			<div className="accordion-item">
				<div className="accordion-header">
					Refund Policy
				</div>
				<div className="accordion-body">
					<p>{policies['refundPolicy']}</p>
				</div>
			</div>

			<div className="accordion-item">
				<div className="accordion-header">
					Cancellation / Return / Exchange Policy
				</div>
				<div className="accordion-body">
					<p>{policies['refundPolicy']}</p>
				</div>
			</div>
		</div>
	);
};

export default PolicyTab;
