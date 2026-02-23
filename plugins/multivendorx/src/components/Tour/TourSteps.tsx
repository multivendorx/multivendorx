import { __ } from '@wordpress/i18n';

export const getTourSteps = (appLocalizer: any) => [
	{
		selector: '.card-content',
		placement: 'auto',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>{__('Dashboard', 'multivendorx')}</h3>
				<h4>
					{__(
						'View and configure your disbursement settings here.',
						'multivendorx'
					)}
				</h4>

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
						{__('Next', 'multivendorx')}
					</button>

					<button className="admin-btn btn-purple" onClick={finishTour}>
						{__('End Tour', 'multivendorx')}
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
				<h3>{__('Store Configure', 'multivendorx')}</h3>
				<h4>
					{__(
						'View and configure your disbursement settings here.',
						'multivendorx'
					)}
				</h4>

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
						{__('Next', 'multivendorx')}
					</button>

					<button className="admin-btn btn-purple" onClick={finishTour}>
						{__('End Tour', 'multivendorx')}
					</button>
				</div>
			</div>
		),
	},
	{
		selector:
			'.form-group:has(.settings-form-label[for="commission_type"])',
		placement: 'right',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>{__('Marketplace commissions', 'multivendorx')}</h3>
				<h4>
					{__(
						'View and configure your disbursement settings here.',
						'multivendorx'
					)}
				</h4>

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
						{__('Next', 'multivendorx')}
					</button>

					<button className="admin-btn btn-purple" onClick={finishTour}>
						{__('End Tour', 'multivendorx')}
					</button>
				</div>
			</div>
		),
	},
	{
		selector:
			'.form-group:has(.settings-form-label[for="commission_per_store_order"])',
		placement: 'right',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>{__('Commission Value', 'multivendorx')}</h3>
				<h4>
					{__(
						'View and configure your disbursement settings here.',
						'multivendorx'
					)}
				</h4>

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
						{__('Next', 'multivendorx')}
					</button>

					<button className="admin-btn btn-purple" onClick={finishTour}>
						{__('End Tour', 'multivendorx')}
					</button>
				</div>
			</div>
		),
	},
	{
		selector:
			'.form-group:has(.settings-form-label[for="disbursement_order_status"])',
		placement: 'right',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>{__('Order Status', 'multivendorx')}</h3>
				<h4>
					{__(
						'View and configure your disbursement settings here.',
						'multivendorx'
					)}
				</h4>

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
						{__('Next', 'multivendorx')}
					</button>

					<button className="admin-btn btn-purple" onClick={finishTour}>
						{__('End Tour', 'multivendorx')}
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
				<h3>{__('Modules', 'multivendorx')}</h3>
				<h4>
					{__(
						'Here you can enable or disable marketplace modules.',
						'multivendorx'
					)}
				</h4>

				<div className="tour-footer">
					<button className="admin-btn btn-purple" onClick={finishTour}>
						{__('Finish Tour', 'multivendorx')}
					</button>
				</div>
			</div>
		),
	},
];