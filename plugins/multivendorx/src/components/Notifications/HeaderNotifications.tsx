/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { ComponentStatusView, getApiLink, ItemListUI } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

type NotificationItem = {
	id: number;
	icon?: string;
	title: string;
	message: string;
	value: string;
};

const NotificationTabContent: React.FC<{
	type: 'notification' | 'activity';
}> = ({ type }) => {
	const [items, setItems] = useState<NotificationItem[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'notifications'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { header: true, type },
		})
			.then((res) => {
				setItems(res.data || []);
				setLoading(false);
			})
			.catch(() => {
				setItems([]);
				setLoading(false);
			});
	}, [type]);

	const dismissItem = (id: number) => {
		axios
			.post(
				getApiLink(appLocalizer, `notifications/${id}`),
				{
					id,
					is_dismissed: true,
				},
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() =>
				setItems((prev) => prev?.filter((i) => i.id !== id) || [])
			);
	};

	const markRead = (id: number) => {
		axios
			.post(
				getApiLink(appLocalizer, `notifications/${id}`),
				{
					id,
					is_read: true,
				},
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() =>
				setItems((prev) => prev?.filter((i) => i.id !== id) || [])
			);
	};

	if (items.length === 0) {
		return (
			<ComponentStatusView
				title={__('No notifications', 'multivendorx')}
			/>
		);
	}

	return (
		<ItemListUI
			className="notification"
			loading={loading}
			items={items.map((item) => ({
				id: item.id,
				title: item.title,
				desc: item.message,
				icon: item.icon,
				value: item.value,
				onApprove: (item) => {
					markRead(item.id);
				},
				onReject: (item) => {
					dismissItem(item.id);
				},
			}))}
		/>
	);
};

export default NotificationTabContent;
