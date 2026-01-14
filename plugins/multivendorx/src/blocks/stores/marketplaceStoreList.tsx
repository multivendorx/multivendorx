import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink } from 'zyra';

interface StoreRow {
	id: number;
	store_name: string;
	image?: string;
	phone?: string;
	address_1?: string;
}

interface StoresListProps {
	perPage?: number;
}

const MarketplaceStoreList: React.FC<StoresListProps> = ({
	perPage = 12,
}) => {
	const [stores, setStores] = useState<StoreRow[]>([]);
	const storesList = (window as any).storesList;

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(storesList, 'store'),
			headers: { 'X-WP-Nonce': storesList.nonce },
			params: {
				filters: {
					limit: perPage,
					offset: 0,
				},
			},
		})
			.then((response) => {
				setStores(response.data.stores || []);
			})
			.catch((error) => {
				console.error('Error fetching stores:', error);
			});
	}, [perPage]);

	return (
		<div className="marketplace-store-list">
			{stores.map((store) => (
				<div key={store.id} className="store-card">
					{store.image && (
						<img
							src={store.image}
							alt={store.store_name}
							className="store-image"
						/>
					)}

					<h2 className="store-name">{store.store_name}</h2>

					{store.phone && (
						<div className="store-phone">📞 {store.phone}</div>
					)}

					{store.address_1 && (
						<div className="store-address">📍 {store.address_1}</div>
					)}
				</div>
			))}
		</div>
	);
};

export default MarketplaceStoreList;
