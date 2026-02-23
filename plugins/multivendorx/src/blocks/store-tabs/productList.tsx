import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink } from 'zyra';

const ProductsTab: React.FC = () => {
	const [html, setHtml] = useState('');

	useEffect(() => {
		axios
			.get(getApiLink(StoreInfo, 'store-products'), {
				headers: { 'X-WP-Nonce': StoreInfo.nonce },
				params: {
					storeId: StoreInfo.storeDetails.storeId,
				},
			})
			.then((response) => {
				setHtml(response.data);
			})
			.catch((error) => {
				console.error('Error loading products:', error);
			});
	}, []);

	return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default ProductsTab;