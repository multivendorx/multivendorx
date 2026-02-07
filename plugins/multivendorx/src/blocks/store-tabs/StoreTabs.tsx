import React, { useState, useMemo } from 'react';
import ProductsTab from './productList';
import ReviewsTab from './StoreReview';
import PolicyTab from './PolicyTab';

interface StoreTab {
	key: string;
	label: string;
	Component: React.FC;
	requiredModule?: string;
}

const ALL_TABS: StoreTab[] = [
	{
		key: 'products',
		label: 'Products',
		Component: ProductsTab,
	},
	{
		key: 'reviews',
		label: 'Reviews',
		Component: ReviewsTab,
		requiredModule: 'store-review',
	},
	{
		key: 'policy',
		label: 'Policy',
		Component: PolicyTab,
		requiredModule: 'store-policy',
	},
];

const StoreTabs: React.FC = () => {
	const activeModules: string[] = StoreInfo?.activeModules || [];
	const availableTabs = useMemo(
		() =>
			ALL_TABS.filter(
				(tab) =>
					!tab.requiredModule ||
					activeModules.includes(tab.requiredModule)
			),
		[activeModules]
	);

	// fallback if active tab is not available
	const [activeTab, setActiveTab] = useState(
		availableTabs[0]?.key || ''
	);

	if (!availableTabs.length) {
		return null;
	}

	return (
		<div className="woocommerce">
			<div className="product">
				<div className="woocommerce-tabs wc-tabs-wrapper">
					<ul className="tabs wc-tabs" role="tablist">
						{availableTabs.map((tab) => (
							<li
								key={tab.key}
								className={activeTab === tab.key ? 'active' : ''}
							>
								<a
									href={`#tab-${tab.key}`}
									onClick={(e) => {
										e.preventDefault();
										setActiveTab(tab.key);
									}}
								>
									{tab.label}
								</a>
							</li>
						))}
					</ul>

					{availableTabs.map((tab) => (
						<div
							key={tab.key}
							id={`tab-${tab.key}`}
							className="panel entry-content wc-tab"
							style={{
								display:
									activeTab === tab.key ? 'block' : 'none',
							}}
						>
							<tab.Component />
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default StoreTabs;
