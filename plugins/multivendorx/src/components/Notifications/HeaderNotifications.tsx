import React, { useEffect, useState } from 'react';
import { Popover, getApiLink, Skeleton} from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

type NotificationItem = {
	id: number;
	icon?: string;
	title: string;
	message: string;
	time: string;
};

const HeaderNotifications: React.FC = () => {
	const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
	const [activeType, setActiveType] = useState<'notification' | 'activity'>('notification');
	const [isDropdownOpen, setIsDropdownOpen] = useState(true);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'notifications'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				header: true,
				type: activeType,
			},
		})
			.then((res) => setNotifications(res.data || []))
			.catch(() => setNotifications([]));
	}, [activeType]);

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

	const handleNotificationClick = (id: number) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `notifications/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { id, is_read: true },
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

		return notifications.map((item) => (
			<li key={item.id}>
				<div
					className="item"
					onClick={() => handleNotificationClick(item.id)}
				>
					{/* <div className="icon admin-badge green"> */}
						<i className={item.icon || 'adminfont-user-network-icon green'} />
					{/* </div> */}
					<div className="details">
						<span className="heading">{item.title}</span>
						<span className="message">{item.message}</span>
						<span className="time">{item.time}</span>
					</div>
					<i className="check-icon adminfont-check color-green"
						onClick={() => handleNotificationClick(item.id)}
					></i>
					<i
						className="check-icon adminfont-cross color-red"
						onClick={(e) => {
							e.stopPropagation();
							dismissNotification(item.id);
						}}
					/>
				</div>
			</li>
		));
	};

	return (
		<>
		{isDropdownOpen && (
			<Popover
				template="tab"
				width="24rem"
				toggleIcon="adminfont-notification"
				toggleContent={<span className="count">{notifications?.length ?? 0}</span>}
				onTabChange={(tabId) => {
					setActiveType(
						tabId === 'activities' ? 'activity' : 'notification'
					);
				}}
				header={
					<div className="title">
						{__('Notifications', 'multivendorx')}
						{notifications?.length > 0 && (
							<span className="admin-badge yellow">
								{notifications?.length} {__('New', 'multivendorx')}
							</span>
						)}
					</div>
				}
				tabs={[
					{
						id: 'notifications',
						label: __("Notifications", 'multivendorx'),
						icon: 'adminfont-notification',
						content: (
							
							<ul className="notification-list">
								{renderContent()}
							</ul>
						)
					},
					{
						id: 'activities',
						label: __("Activities", 'multivendorx'),
						icon: 'adminfont-activity',
						content: (
							<ul className="notification-list">
								{renderContent()}
							</ul>
						)
					},
				]}
				footer={
					<div className="footer">
						{activeType == 'notification' ? (

							<a
								href={`?page=multivendorx#&tab=notifications&subtab=notifications`}
								className="admin-btn btn-purple"
								onClick={() => setIsDropdownOpen(false)}
							>
								<i className="adminfont-eye"></i>
								{__('View all notifications', 'multivendorx')}
							</a>
						) : (
							<a
								href={`?page=multivendorx#&tab=notifications&subtab=activities`}
								className="admin-btn btn-purple"
								onClick={() => setIsDropdownOpen(false)}
							>
								<i className="adminfont-eye"></i>
								{__('View all activities', 'multivendorx')}
							</a>
						)}
					</div>
				}
			/>
		)}
		</>
	);
};
export default HeaderNotifications;
