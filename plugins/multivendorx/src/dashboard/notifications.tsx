import React, { useEffect, useState } from 'react';
import {getApiLink, Skeleton } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

type NotificationsProps = {
    type?: 'notification' | 'activity';
};

const Notifications : React.FC<NotificationsProps> = ({ type }) => {
	const [notifications, setNotifications] = useState<[] | null>(null);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'notifications'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				header: true,
				store_id: appLocalizer.store_id,
				type: type
			},
		}).then((response) => {
			setNotifications(response.data || []);
		});
	}, []);

	const handleNotificationClick = (id: number) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `notifications/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { 
				id, 
				is_read: true,
				store_id: appLocalizer.store_id,
			},
		}).then(() => {
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		});
	};

	const dismissNotification = (id: number) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `notifications/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { 
				id, 
				is_dismissed: true,
				store_id: appLocalizer.store_id,
			},
		}).then(() => {
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		});
	};

	const renderContent = () => {
		if (notifications === null) {
			return (
				<>
					<li>
						<div className="item">
							<Skeleton width={400} height={70} />
						</div>
						<div className="item">
							<Skeleton width={400} height={70} />
						</div>
						<div className="item">
							<Skeleton width={400} height={70} />
						</div>
						<div className="item">
							<Skeleton width={400} height={70} />
						</div>
					</li>
				</>
			);
		}

		if (notifications.length === 0) {
			return (
				<li>
					<div className="item no-notifications">
						<span>{__('No notifications', 'multivendorx')}</span>
					</div>
				</li>
			);
		}

		return notifications.map((item, idx) => (
			<li key={idx}>
				<div className="item"
					onClick={() => handleNotificationClick(item.id)}
				>
					<div className={`icon admin-badge admin-color${item.id}`} >
						<i
							className={
								item.icon || 'adminfont-user-network-icon'
							}
						></i>
					</div>
					<div className="details">
						<span className="heading">{item.title}</span>
						<span className="message">{item.message}</span>
						<span className="time">{item.time}</span>
					</div>
					<i className="check-icon adminfont-check color-green"></i>
					<i className="check-icon adminfont-cross color-red"  
						onClick={(e) => {
							e.stopPropagation();
							dismissNotification(item.id)
						}}></i>
				</div>
			</li>
		));
	};

	const subtab = type === 'notification' ? 'notifications' : 'activity';

	const baseUrl = appLocalizer.site_url.replace(/\/$/, '');

	const url = appLocalizer.permalink_structure
		? `${baseUrl}/${appLocalizer.dashboard_slug}/view-notifications/#subtab=${subtab}`
		: `${baseUrl}/?page_id=${appLocalizer.dashboard_page_id}&segment=view-notifications#subtab=${subtab}`;


	return (
		<>
			<div className="dropdown-menu notification">
				<div className="title">
					{__('Notifications', 'multivendorx')}
					{notifications && notifications.length > 0 && (
						<span className="admin-badge green">
							{notifications.length} {__('New', 'multivendorx')}
						</span>
					)}
				</div>
				<div className="notification">
					<ul>{renderContent()}</ul>
				</div>
				<div className="footer">
					<a
						href={url}
						className="admin-btn btn-purple"
						onClick={(e) => e.stopPropagation()}
					>
						<i className="adminfont-eye"></i>
						{type === 'notification'
							? __('View all notifications', 'multivendorx')
							: __('View all activities', 'multivendorx')}
					</a>

				</div>
			</div>
		</>
	);
};
export default Notifications;
