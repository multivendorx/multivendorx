/* global appLocalizer */
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { HeaderComponent } from '@zyra/components';
import CatalogxLogo from '../../assets/images/catalogx-logo.png';
import { buildSearchIndex, type SearchItem } from '../../searchIndex';
import { ACCOUNT_URL, CONTACT_URL } from '../../services/links';

/**
 * The header of the CatalogX admin page: brand, Free/Pro versions, a search box and the support menu. Results cover
 * the pages, every Settings tab with its sections and fields, and every module. Every result is a tab of this same
 * admin page, so choosing one only changes the hash.
 */
export function SearchHeader() {
	const [results, setResults] = useState<SearchItem[]>([]);

	const handleQueryUpdate = ({
		searchValue,
		searchAction,
	}: {
		searchValue: string;
		searchAction?: string;
	}) => {
		const query = searchValue.trim().toLowerCase();

		if (!query) {
			setResults([]);
			return;
		}

		setResults(
			buildSearchIndex().filter((item) => {
				if (
					searchAction &&
					'all' !== searchAction &&
					item.category !== searchAction
				) {
					return false;
				}

				return (
					item.name.toLowerCase().includes(query) ||
					Boolean(item.desc?.toLowerCase().includes(query))
				);
			})
		);
	};

	const handleResultClick = (item: SearchItem) => {
		window.location.hash = item.link;
		setResults([]);
	};

	const utilityList = [
		{
			toggleIcon: 'admin-icon adminfont-user-circle',
			tooltipName: __('Support', 'catalogx'),
			tooltipPosition: 'bottom' as const,
			items: [
				{
					title: __('Manage Plan', 'catalogx'),
					icon: 'person',
					link: ACCOUNT_URL,
					targetBlank: true,
				},
				{
					title: __('Contact Support', 'catalogx'),
					icon: 'user-network-icon',
					link: CONTACT_URL,
					targetBlank: true,
				},
			],
		},
	];

	return (
		<HeaderComponent
			brandImg={CatalogxLogo}
			logoAlt={__('CatalogX', 'catalogx')}
			results={results}
			search={{
				placeholder: __('Search…', 'catalogx'),
				options: [
					{ value: 'all', label: __('Everything', 'catalogx') },
					{ value: 'pages', label: __('Pages', 'catalogx') },
					{ value: 'settings', label: __('Settings', 'catalogx') },
					{ value: 'modules', label: __('Modules', 'catalogx') },
				],
			}}
			onQueryUpdate={handleQueryUpdate}
			onResultClick={handleResultClick}
			free={appLocalizer.free_version}
			pro={appLocalizer.pro_data?.version || undefined}
			utilityList={utilityList}
			// Overridden by styles/design-system.scss: the scope picker fits its chosen label instead of a fixed width.
			searchSize={7}
		/>
	);
}

export default SearchHeader;
