export const getTourSteps = (appLocalizer: any) => [
	{
		selector: '.card-content',
		placement: 'auto',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>Dashboard</h3>
				<h4>View and configure your disbursement settings here.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={() =>
							navigateTo(
								`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=general`,
								1
							)
						}
					>
						Next
					</button>

					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						End Tour
					</button>
				</div>
			</div>
		),
	},
	{
		selector: '.form-group:has(.settings-form-label[for="approve_store"])',
		placement: 'right',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>Store Configure</h3>
				<h4>View and configure your disbursement settings here.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={() =>
							navigateTo(
								`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
								2
							)
						}
					>
						Next
					</button>

					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						End Tour
					</button>
				</div>
			</div>
		),
	},
	{
		selector: '.form-group:has(.settings-form-label[for="commission_type"])',
		placement: 'right',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>Marketplace commissions</h3>
				<h4>View and configure your disbursement settings here.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={() =>
							navigateTo(
								`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
								3
							)
						}
					>
						Next
					</button>

					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						End Tour
					</button>
				</div>
			</div>
		),
	},
	{
		selector: '.form-group:has(.settings-form-label[for="commission_per_store_order"])',
		placement: 'right',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>commission value</h3>
				<h4>View and configure your disbursement settings here.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={() =>
							navigateTo(
								`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=disbursement`,
								4
							)
						}
					>
						Next
					</button>

					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						End Tour
					</button>
				</div>
			</div>
		),
	},
	{
		selector: '.form-group:has(.settings-form-label[for="disbursement_order_status"])',
		placement: 'right',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>order status</h3>
				<h4>View and configure your disbursement settings here.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={() =>
							navigateTo(
								`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`,
								5
							)
						}
					>
						Next
					</button>

					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						End Tour
					</button>
				</div>
			</div>
		),
	},
	{
		selector: '[data-tour="appointment-showcase-tour"]',
		placement: 'auto',
		content: ({ finishTour }: any) => (
			<div className="tour-box">
				<h3>Modules</h3>
				<h4>Here you can enable or disable marketplace modules.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						Finish Tour
					</button>
				</div>
			</div>
		),
	},
];
