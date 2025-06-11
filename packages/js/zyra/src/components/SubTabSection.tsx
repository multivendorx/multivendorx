/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/SubTabSection.scss';

// Types
export interface MenuItem {
	id: string;
	name: string;
	icon: string;
	link?: string;
}

interface SubTabSectionProps {
	menuitem: MenuItem[];
	currentTab: MenuItem;
	setCurrentTab: (tab: MenuItem) => void;
	setting?: any;
}

const SubTabSection: React.FC<SubTabSectionProps> = ({
	menuitem,
	currentTab,
	setCurrentTab,
}) => {
	return (
		<div className="tab-section">
			{menuitem.map((menu) => (
				<div
					key={menu.id}
					className={`tab-section-menu ${menu.id === currentTab.id ? 'active' : ''} ${menu.id}-tab`}
					role="button"
					tabIndex={0}
					onClick={() => setCurrentTab(menu)}
				>
					<span className={`admin-font ${menu.icon}`}></span>
					{menu.name}
				</div>
			))}
		</div>
	);
};

export default SubTabSection;
