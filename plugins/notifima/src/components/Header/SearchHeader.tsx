/* global appLocalizer */
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { HeaderComponent } from '@zyra/components';
import BrandLogo from '../../assets/images/brand-logo.png';
import { buildSearchIndex, type SearchItem } from '../../searchIndex';
import {
	ACCOUNT_URL,
	CONSULTATION_URL,
	CONTACT_URL,
	DOCS_URL,
} from '../../services/links';

/**
 * The header of the Notifima admin page: brand, Free/Pro versions, a search box and the support menu. Results cover
 * the tabs, plus every Settings tab with its sections and fields. Every result is a tab of this same admin page, so
 * choosing one only changes the hash.
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

	// zyra types the clicked result as its own, narrower SearchItem; only `link` is read here.
	const handleResultClick = (item: Pick<SearchItem, 'link'>) => {
		window.location.hash = item.link;
		setResults([]);
	};

	const utilityList = [
		{
			toggleIcon: 'admin-icon adminfont-user-circle',
			tooltipName: __('Support', 'notifima'),
			tooltipPosition: 'bottom' as const,
			items: [
				{
					title: __('Documentation', 'notifima'),
					icon: 'knowledgebase',
					link: DOCS_URL,
					targetBlank: true,
				},
				{
					title: __('Book a consultation', 'notifima'),
					icon: 'customer-support',
					link: CONSULTATION_URL,
					targetBlank: true,
				},
				{
					title: __('Contact Support', 'notifima'),
					icon: 'user-network-icon',
					link: CONTACT_URL,
					targetBlank: true,
				},
				...(appLocalizer.khali_dabba
					? [
							{
								title: __('Manage Plan', 'notifima'),
								icon: 'person',
								link: ACCOUNT_URL,
								targetBlank: true,
							},
						]
					: []),
			],
		},
	];

	return (
		<HeaderComponent
			brandImg={BrandLogo}
			logoAlt={__('Notifima', 'notifima')}
			results={results}
			search={{
				placeholder: __('Search…', 'notifima'),
				options: [
					{ value: 'all', label: __('Everything', 'notifima') },
					{ value: 'pages', label: __('Pages', 'notifima') },
					{ value: 'settings', label: __('Settings', 'notifima') },
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
