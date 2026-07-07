/* global appLocalizer */
import {
	useModules,
	Container,
	Column,
	ComponentStatusView,
	SettingsNavigator,
} from 'zyra';
import '../AdminDashboard/AdminDashboard.scss';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { applyFilters } from '@wordpress/hooks';
import { useLocation, Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

if (!window.multivendorxCustomerStore) {
	window.multivendorxCustomerStore = {
		counts: {},
		listeners: [],
		setCount(id, count) {
			if (this.counts[id] === count) {
				return;
			}
			this.counts[id] = count;
			this.listeners.forEach((fn) => fn(this.counts));
		},
		subscribe(fn) {
			this.listeners.push(fn);
			return () => {
				this.listeners = this.listeners.filter((l) => l !== fn);
			};
		},
	};
}

const CustomersFeedback = () => {
	const [counts, setCounts] = useState<Record<string, number>>({});

	useEffect(() => {
		const store = window.multivendorxCustomerStore;

		// initial
		setCounts({ ...store.counts });

		// subscribe
		return store.subscribe((newCounts) => {
			setCounts({ ...newCounts });
		});
	}, []);

	useEffect(() => {
		const store = window.multivendorxCustomerStore;

		let apiConfigs: any[] = [];

		apiConfigs = applyFilters(
			'multivendorx_customer_api_configs',
			apiConfigs,
			{ appLocalizer }
		);

		// execute all APIs
		apiConfigs.forEach((config: any) => {
			axios({
				method: config.method || 'GET',
				url: config.url,
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: config.params || {},
			}).then((res) => {
				const count = config.transform
					? config.transform(res)
					: Number(res.headers[config.header || 'x-wp-total']) || 0;

				store.setCount(config.id, count);
			});
		});
	}, []);

	const { modules } = useModules();
	const location = new URLSearchParams(useLocation().hash.substring(1));

	const settingContent = applyFilters(
		'multivendorx_customers_tab',
		[]
	).filter((tab) => !tab.module || modules.includes(tab.module));

	const settingContentWithCounts = settingContent.map((tab) => ({
		...tab,
		content: {
			...tab.content,
			count: counts[tab.content.id] || 0,
		},
	}));

	const getForm = (tabId: string) => {
		return (
			applyFilters('multivendorx_customers_tab_content', null, {
				tabId,
			}) || <div />
		);
	};
	return (
		<>
			{settingContent.length > 0 ? (
				<SettingsNavigator
					settingContent={settingContentWithCounts}
					currentSetting={location.get('subtab') as string}
					getForm={getForm}
					prepareUrl={(subTab: string) =>
						`?page=multivendorx#&tab=customers&subtab=${subTab}`
					}
					appLocalizer={appLocalizer}
					Link={Link}
					variant={'compact'}
					menuIcon={true}
					headerIcon="customer-service"
					headerTitle={__('Customer Support', 'multivendorx')}
					headerDescription={__(
						'Manage store reviews, support requests, financial transactions, and reported issues.',
						'multivendorx'
					)}
				/>
			) : (
				<Container general>
					<Column>
						<ComponentStatusView
							title={__(
								'Looks like customer support isn’t set up yet!',
								'multivendorx'
							)}
							desc={__(
								'Turn on a support module to start assisting your customers.',
								'multivendorx'
							)}
							buttonText={__('Enable Now', 'multivendorx')}
							buttonLink={`${appLocalizer.admin_dashboard_url}#&tab=modules&module=customer-queries`}
						/>
					</Column>
				</Container>
			)}
		</>
	);
};

export default CustomersFeedback;
