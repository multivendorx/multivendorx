import React, { useEffect, useState } from 'react';
import { CommonPopup, getApiLink } from 'zyra';
import axios from 'axios';
import { Skeleton } from '@mui/material';
import { __ } from '@wordpress/i18n';

const HeaderNotifications = () => {
	const [notifications, setNotifications] = useState<[] | null>(null);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'notifications'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				header: true
			},
		})
			.then((response) => {
				setNotifications(response.data || []);
			})
			.catch(() => setNotifications([]));
	}, []);

	const dismissNotification = (id: number) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `notifications/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { id, is_dismissed: true },
		}).then(() => {
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		});
	};
	// console.log(notifications)

	const renderContent = () => {
		if (notifications === null) {
			return (
				<>
					<li>
						<div className="item">
							<Skeleton variant="text" width={400} height={70} />
						</div>
						<div className="item">
							<Skeleton variant="text" width={400} height={70} />
						</div>
						<div className="item">
							<Skeleton variant="text" width={400} height={70} />
						</div>
						<div className="item">
							<Skeleton variant="text" width={400} height={70} />
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
				<div className="item">
					<div className={`icon admin-badge green`}>
						<i
							className={
								item.icon || 'adminlib-user-network-icon'
							}
						></i>
					</div>
					<div className="details">
						<span className="heading">{item.title}</span>
						<span className="message">{item.message}</span>
						<span className="time">{item.time}</span>
					</div>
					<i className="check-icon adminlib-check"></i>
				</div>
			</li>
		));
	};

	return (
		<>
			<div className="dropdown notification">
				<div className="title">
					{__('Notifications', 'multivendorx')}
					{notifications && notifications.length > 0 && (
						<span className="admin-badge yellow">
							{notifications.length} {__('New', 'multivendorx')}
						</span>
					)}
				</div>
				<div className="notification">
					<ul>{renderContent()}</ul>
				</div>
				<div className="footer">
					<a
						href={`?page=multivendorx#&tab=notifications`}
						className="admin-btn btn-purple"
					>
						<i className="adminlib-eye"></i>
						{__('View all notifications', 'multivendorx')}
					</a>
				</div>
			</div>
		</>
	);
};
export default HeaderNotifications;
