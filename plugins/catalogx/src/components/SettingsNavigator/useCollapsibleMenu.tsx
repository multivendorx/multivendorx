/**
 * Lets the settings menu collapse to its icons, so wide editors (the email template builder)
 * get the room. The toggle sits at the foot of the menu, like WordPress's own "Collapse Menu",
 * and the choice is remembered in this browser.
 */
import { useState } from 'react';
import { __ } from '@wordpress/i18n';

const STORAGE_KEY = 'catalogx_settings_menu_collapsed';

const readCollapsed = (): boolean => {
	try {
		return '1' === window.localStorage.getItem(STORAGE_KEY);
	} catch {
		return false;
	}
};

/**
 * @return The class for the settings wrapper while collapsed, and the toggle to render in the menu.
 */
const useCollapsibleMenu = () => {
	const [collapsed, setCollapsed] = useState(readCollapsed);

	const toggleCollapsed = () => {
		const next = !collapsed;
		setCollapsed(next);
		try {
			window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
		} catch {
			// Storage blocked: the menu still toggles, it just isn't remembered.
		}
	};

	const label = collapsed
		? __('Expand menu', 'catalogx')
		: __('Collapse menu', 'catalogx');

	const menuToggle = (
		<button
			type="button"
			className="settings-menu-toggle"
			onClick={toggleCollapsed}
			aria-expanded={!collapsed}
			aria-label={label}
			title={label}
		>
			<i className="adminfont-left-sidebar" aria-hidden="true" />
			<span className="settings-menu-toggle-label">{label}</span>
		</button>
	);

	return {
		menuClassName: collapsed ? 'is-menu-collapsed' : '',
		menuToggle,
	};
};

export default useCollapsibleMenu;
