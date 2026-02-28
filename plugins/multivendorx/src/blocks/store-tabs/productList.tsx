import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink, HeaderSearch } from 'zyra';

const ProductsTab: React.FC = () => {
	const [html, setHtml] = useState('');
	const [search, setSearch] = useState('');

	useEffect(() => {
		axios
			.get(getApiLink(StoreInfo, 'store-products'), {
				headers: { 'X-WP-Nonce': StoreInfo.nonce },
				params: {
					storeId: StoreInfo.storeDetails.storeId,
					search: search,
				},
			})
			.then((response) => {
				setHtml(response.data);
			})
			.catch((error) => {
				console.error('Error loading products:', error);
			});
	}, [search]);

	return (
		<div>
			<HeaderSearch
				variant="mini-search"
				search={{ placeholder: 'Search .....' }}
				onQueryUpdate={(e) => {
					setSearch(e.searchValue);
				}}
			/>
			<div dangerouslySetInnerHTML={{ __html: html }} />
		</div>
	);
};

export default ProductsTab;