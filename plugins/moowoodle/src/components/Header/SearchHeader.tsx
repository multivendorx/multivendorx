/* global appLocalizer */
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { HeaderComponent } from '@zyra/components';
import MoowoodleLogo from '../../assets/images/moowoodle-logo.png';
import { buildSearchIndex, type SearchItem } from '../../searchIndex';

/**
 * The header of the MooWoodle admin page: brand, Free/Pro versions, a search box and the support menu. Results cover
 * the tabs, plus every Settings and Synchronization tab with its sections and fields. Every result is a tab of this
 * same admin page, so choosing one only changes the hash.
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
			tooltipName: __('Support', 'moowoodle'),
			tooltipPosition: 'bottom' as const,
			items: [
				{
					title: __('Manage Plan', 'moowoodle'),
					icon: 'person',
					link: 'https://dualcube.com/my-account/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle',
					targetBlank: true,
				},
				{
					title: __('Contact Support', 'moowoodle'),
					icon: 'user-network-icon',
					link: 'https://dualcube.com/contact-us/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle',
					targetBlank: true,
				},
			],
		},
	];

	return (
		<HeaderComponent
			brandImg={MoowoodleLogo}
			logoAlt={__('MooWoodle', 'moowoodle')}
			results={results}
			search={{
				placeholder: __('Search…', 'moowoodle'),
				options: [
					{ value: 'all', label: __('Everything', 'moowoodle') },
					{ value: 'pages', label: __('Pages', 'moowoodle') },
					{ value: 'settings', label: __('Settings', 'moowoodle') },
					{
						value: 'synchronization',
						label: __('Synchronization', 'moowoodle'),
					},
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
