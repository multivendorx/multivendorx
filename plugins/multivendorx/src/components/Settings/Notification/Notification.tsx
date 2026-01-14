import React, { useEffect, useMemo, useState } from 'react';
import './Notifications.scss';
import { CommonPopup, getApiLink, TextArea, BasicInput, AdminButton, FormGroupWrapper, FormGroup } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

// ------------------ RecipientBadge Component ------------------
interface Recipient {
	id: number;
	type: string;
	label: string;
	enabled: boolean;
	canDelete: boolean;
}

interface RecipientBadgeProps {
	recipient: Recipient;
}

const RecipientBadge: React.FC<RecipientBadgeProps> = ({
	recipient
}) => {
	let iconClass = 'adminfont-mail';
	let badgeClass = 'red';

	switch (recipient.label) {
		case 'Store':
			iconClass = 'adminfont-storefront';
			badgeClass = 'blue';
			break;
		case 'Admin':
			iconClass = 'adminfont-person';
			badgeClass = ' green';
			break;
		case 'Customer':
			iconClass = 'adminfont-user-circle';
			badgeClass = 'yellow';
			break;
		default:
			badgeClass = ' default-badge';
	}

	return (
		<>
			{recipient.enabled && (
				<div
					className={`admin-badge ${badgeClass}`}
					role="button"
					tabIndex={0}
				>
					<i className={iconClass}></i>
					<span>{recipient.label}</span>
				</div>
			)}
		</>
	);
};

// ------------------ Notification Component ------------------
const Notification: React.FC = () => {
	// Keep notifications as an array to avoid null checks everywhere
	const [notifications, setNotifications] = useState<any[]>([]);
	const [systemTags, setSystemTags] = useState<string[]>([]);
	// openChannel holds 'mail' | 'sms' | 'system' | null
	const [openChannel, setOpenChannel] = useState<string | null>(null);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'notifications'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				events: true,
			},
		}).then((response) => {
			setNotifications(response.data || []);
		});
	}, []);

	const [addingRecipient, setAddingRecipient] = useState<number | null>(null);
	const [newRecipientValue, setNewRecipientValue] = useState('');
	const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
	const [editingNotification, setEditingNotification] = useState<
		number | null
	>(null);
	const [notificationId, setNotificationId] = useState<number | null>(null);
	const [formData, setFormData] = useState<Record<string, any>>({});

	// NEW: activeTag state
	const [activeTag, setActiveTag] = useState<string>('All');

	// ------------------ autosave effect (keeps almost same logic you had) ------------------
	useEffect(() => {
		if (!notifications || notificationId == null) {
			return;
		}

		const filtered = notifications.filter(
			(item) => item.id === notificationId
		);

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `notifications/${notificationId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				notifications: filtered,
			},
		}).then((response) => {
			if (response.data.success) {
				setEditingNotification(null);
			}
		});
	}, [notifications, notificationId]);

	const toggleRecipient = (notifId: number, recipientId: number) => {
		setNotifications((prev) =>
			prev.map((n) =>
				n.id === notifId
					? {
						...n,
						recipients: n.recipients.map((r: any) =>
							r.id === recipientId
								? { ...r, enabled: !r.enabled }
								: r
						),
					}
					: n
			)
		);
	};

	const deleteRecipient = (notifId: number, recipientId: number) => {
		setNotifications((prev) =>
			prev.map((n) =>
				n.id === notifId
					? {
						...n,
						recipients: n.recipients.filter(
							(r: any) => r.id !== recipientId
						),
					}
					: n
			)
		);
	};

	const addRecipient = (notifId: number | null) => {
		if (!newRecipientValue.trim() || notifId == null) {
			return;
		}
		setNotifications((prev) =>
			prev.map((n) => {
				if (n.id === notifId) {
					const maxId =
						n.recipients && n.recipients.length
							? Math.max(...n.recipients.map((r: any) => r.id))
							: 0;
					const newId = maxId + 1;
					return {
						...n,
						recipients: [
							...(n.recipients || []),
							{
								id: newId,
								type: 'extra',
								label: newRecipientValue,
								enabled: true,
								canDelete: true,
							},
						],
					};
				}
				return n;
			})
		);
		setNewRecipientValue('');
		setAddingRecipient(null);
	};

	const toggleChannel = (notifId: number, channel: string) => {
		setNotifications((prev) =>
			prev.map((n) =>
				n.id === notifId
					? {
						...n,
						channels: {
							...n.channels,
							[channel]: !n.channels[channel],
						},
					}
					: n
			)
		);
	};

	const openEditPannel = (notifId: number, channel: string) => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `notifications/${notifId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((response) => {
			const notifData = Array.isArray(response.data)
				? response.data[0]
				: response.data;
			setFormData(notifData || {});
		});

		setOpenChannel(channel);
	};

	useEffect(() => {
		if (formData.system_message) {
			const matches =
				(formData.system_message as string).match(/\[[^\]]+\]/g) || [];
			const uniqueTags = matches.filter(
				(tag, index) => matches.indexOf(tag) === index
			);

			setSystemTags(uniqueTags);
		} else {
			setSystemTags([]);
		}
	}, [formData.system_message]);

	const handleAutoSave = (
		id: number | null,
		data?: any
	) => {
		if (id == null) return;

		const payload = data ?? formData;

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `notifications/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				formData: payload,
			},
		}).then(() => {
			// setOpenChannel(null);
		});
	};

	const [cursorPos, setCursorPos] = useState({
		start: 0,
		end: 0,
		field: null,
	});

	const insertAtCursor = (tag) => {
		const { start, end, field } = cursorPos;
		if (!field) return;

		const value = formData[field] || '';
		const updated =
			value.slice(0, start) +
			tag +
			value.slice(end);

		const updatedFormData = {
			...formData,
			[field]: updated,
		};

		setFormData(updatedFormData);

		// Restore cursor position
		requestAnimationFrame(() => {
			const el = document.activeElement;
			if (el && el.setSelectionRange) {
				el.setSelectionRange(
					start + tag.length,
					start + tag.length
				);
			}
		});

		handleAutoSave(updatedFormData.id, updatedFormData);

	};

	// -------------- TAGS: auto-generate unique tags from notifications --------------
	const uniqueTags = useMemo(() => {
		const tags = Array.from(
			new Set((notifications || []).map((n) => n.tag).filter(Boolean))
		);
		return ['All', ...tags];
	}, [notifications]);

	// -------------- FILTERED NOTIFICATIONS based on activeTag --------------
	const filteredNotifications = useMemo(() => {
		if (!notifications) {
			return [];
		}
		if (activeTag === 'All') {
			return notifications;
		}
		return notifications.filter((n) => n.tag === activeTag);
	}, [notifications, activeTag]);

	const editNotification = notifications.find(
		(item) => item.id === notificationId
	);

	const defaultRecipients = editNotification?.recipients.filter((r) =>
		['Store', 'Admin', 'Customer'].includes(r.type)
	);

	const customRecipients = editNotification?.recipients.filter(
		(r) => !['Store', 'Admin', 'Customer'].includes(r.type)
	);

	// ------------------ Render ------------------
	return (
		<div className="notification-container tab-bg">
			{/* View Toggle */}
			<div className="toggle-setting-wrapper view-toggle">
				<div className="category-filter">
					{uniqueTags.map((tag) => (
						<div
							key={tag}
							className={`category-item ${activeTag === tag ? 'active' : ''
								}`}
							role="button"
							tabIndex={0}
							onClick={(e) => {
								e.stopPropagation();
								setActiveTag(tag);
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.stopPropagation();
									setActiveTag(tag);
								}
							}}
						>
							{tag}
						</div>
					))}
				</div>

				<div className="tabs-wrapper">
					{['list', 'grid'].map((mode) => (
						<div
							key={mode}
							role="button"
							tabIndex={0}
							onClick={() => setViewMode(mode as 'list' | 'grid')}
							onKeyDown={(e) =>
								e.key === 'Enter' &&
								setViewMode(mode as 'list' | 'grid')
							}
							className="toggle-option"
						>
							<input
								className="toggle-setting-form-input"
								type="radio"
								id={`${mode}-view`}
								name="view-mode"
								value={mode}
								checked={viewMode === mode}
								readOnly
							/>
							<label htmlFor={`${mode}-view`}>
								<i
									className={
										mode === 'list'
											? 'adminfont-editor-list-ul'
											: 'adminfont-module'
									}
								></i>
							</label>
						</div>
					))}
				</div>
			</div>

			{/* List View */}
			{viewMode === 'list' && (
				<div className="table-wrapper">
					<table className="admin-table">
						<thead className="admin-table-header">
							<tr className="header-row">
								<th className="header-col notificaton">
									Event
								</th>
								<th className="header-col">Recipients</th>
								<th className="header-col">System</th>
								<th className="header-col action">Action</th>
							</tr>
						</thead>
						<tbody className="admin-table-body">
							{filteredNotifications.map((notif: any) => (
								<tr
									className="admin-row"
									key={notif.id}
									onClick={() => {
										setEditingNotification(notif.id);
										setNotificationId(notif.id);
									}}
								>
									<td className="admin-column notificaton">
										<div className="table-row-custom">
											<div className="product-wrapper notification">
												<span
													className={`item-icon notification-icon adminfonts adminicon-${notif.id}`}
												></span>
												<div className="details">
													<div className="title">
														{notif.event}
														<span
															className={`admin-badge yellow ${notif.tag}`}
														>
															{notif.tag}{' '}
														</span>
														<span
															className={`admin-badge blue ${notif.category}`}
														>
															{' '}
															{
																notif.category
															}{' '}
														</span>
													</div>
													<div className="des">
														{notif.description}
													</div>
												</div>
											</div>
										</div>
									</td>
									<td className="admin-column">
										<div className="table-row-custom">
											<div className="recipients-list">
												{(notif.recipients || []).map(
													(r: any) => (
														<RecipientBadge
															key={r.id}
															recipient={r}
														// onToggle={() =>
														// 	toggleRecipient(
														// 		notif.id,
														// 		r.id
														// 	)
														// }
														// onDelete={
														// 	r.canDelete
														// 		? () =>
														// 				deleteRecipient(
														// 					notif.id,
														// 					r.id
														// 				)
														// 		: undefined
														// }
														/>
													)
												)}
											</div>
										</div>
									</td>
									<td className="admin-column">
										<div className="table-row-custom">
											<div className="system-column">
												{Object.entries(
													notif.channels || {}
												).map(
													([
														channel,
														enabled,
													]: any) => {
														let iconClass = '';
														let badgeClass =
															'admin-badge ';
														switch (channel) {
															case 'mail':
																iconClass =
																	'adminfont-mail';
																badgeClass +=
																	'yellow';
																break;
															case 'sms':
																iconClass =
																	'adminfont-enquiry';
																badgeClass +=
																	'green';
																break;
															case 'system':
																iconClass =
																	'adminfont-notification';
																badgeClass +=
																	'blue';
																break;
														}
														return (
															<>
																{enabled && (
																	<i
																		key={
																			channel
																		}
																		className={`${iconClass} ${badgeClass} ${!enabled
																			? 'disable'
																			: ''
																			}`}
																		onClick={(
																			e
																		) => {
																			e.stopPropagation();
																			setNotificationId(
																				notif.id
																			);
																			openEditPannel(
																				notif.id,
																				channel
																			);
																		}}
																	></i>
																)}
															</>
														);
													}
												)}
											</div>
										</div>
									</td>
									<td className="admin-column action">
										<div className="action-section">
											<div className="action-icons">
												<div className="inline-actions">
													<div className="inline-action-btn tooltip-wrapper">
														<i className="adminfont-edit"></i>
														<span className="tooltip-name">
															Edit
														</span>
													</div>
												</div>
											</div>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{openChannel && (
				<CommonPopup
					open={!!openChannel}
					onClose={() => setOpenChannel(null)}
					width="31.25rem"
					height="70%"
					header={{
						icon: 'cart',
						title: `${openChannel === 'system'
							? __('System Notification', 'multivendorx')
							: openChannel === 'sms'
								? __('SMS Message', 'multivendorx')
								: __('Email Message', 'multivendorx')
							} - ${editNotification?.event ?? ''}`,
					}}

					footer={
						<AdminButton
							buttons={[
								{
									icon: 'close',
									text: __('Cancel', 'multivendorx'),
									className: 'red',
									onClick: () => setOpenChannel(null),
								},
							]}
						/>
					}

				>
					<>
						<FormGroupWrapper>

							{openChannel === 'system' && (
								<FormGroup label={__('System Message', 'multivendorx')} htmlFor="system-message">
									<TextArea
										name="system_message"
										value={
											formData.system_message || ''
										}
										onClick={(e) =>
											setCursorPos({
												start: e.target.selectionStart,
												end: e.target.selectionEnd,
												field: 'system_message',
											})
										}
										onChange={(e) => {
											setFormData({
												...formData,
												system_message:
													e.target.value,
											});
										}}
										onBlur={() => {
											handleAutoSave(formData.id);
										}}
										onKeyDown={() => {
											handleAutoSave(formData.id);
										}}
									/>
								</FormGroup>
							)}
							{openChannel === 'sms' && (
								<FormGroup label={__('SMS Content', 'multivendorx')} htmlFor="sms-content">
									<TextArea
										name="sms_content"
										value={formData.sms_content || ''}
										onClick={(e) =>
											setCursorPos({
												start: e.target.selectionStart,
												end: e.target.selectionEnd,
												field: 'sms_content',
											})
										}
										onChange={(e) => {
											setFormData({
												...formData,
												sms_content: e.target.value,
											});
											handleAutoSave(formData.id);
										}}
										onBlur={() => {
											handleAutoSave(formData.id);
										}}
									/>
								</FormGroup>
							)}
							{openChannel === 'mail' && (
								<>
									<FormGroup cols={2} label={__('Email Subject', 'multivendorx')} htmlFor="email-subject">
										<BasicInput
											type="text"
											name="email_subject"
											value={formData.email_subject || ''}
											onChange={(e) => {
												setFormData({
													...formData,
													email_subject:
														e.target.value,
												});
												handleAutoSave(formData.id);
											}}
											onClick={(e) =>
												setCursorPos({
													start: e.target.selectionStart,
													end: e.target.selectionEnd,
													field: 'email_subject',
												})
											}
											onBlur={() => {
												handleAutoSave(formData.id);
											}}
										/>
									</FormGroup>
									<FormGroup cols={2} label={__('Email Body', 'multivendorx')} htmlFor="email-body">
										<TextArea
											name="email_body"
											value={formData.email_body || ''}
											onClick={(e) =>
												setCursorPos({
													start: e.target.selectionStart,
													end: e.target.selectionEnd,
													field: 'email_body',
												})
											}
											onChange={(e) => {
												setFormData({
													...formData,
													email_body: e.target.value,
												});
												handleAutoSave(formData.id);
											}}
											onBlur={() => {
												handleAutoSave(formData.id);
											}}
										/>
									</FormGroup>
								</>
							)}
							{systemTags?.length > 0 && (
								<div className="tag-list">
									{systemTags.map((tag, idx) => (
										<span
											key={idx}
											className="tag-item"
											onClick={() => insertAtCursor(tag)}
										>
											{tag}
										</span>
									))}
								</div>
							)}
						</FormGroupWrapper>
					</>
				</CommonPopup>
			)}

			{/* Edit Recipients Popup */}
			{editingNotification && (
				<CommonPopup
					open={!!editingNotification}
					onClose={() => setEditingNotification(null)}
					width="31.25rem"
					height="70%"
					header={{
						icon: 'notification',
						title: `${__('Settings', 'multivendorx')} - ${editNotification?.event ?? ''}`,
						description: editNotification?.description,
					}}

				>
					<div className="title">Delivery method</div>
					<div className="drawer-recipients">
						{Object.entries(
							notifications.find(
								(n) => n.id === editingNotification
							)?.channels || {}
						).map(([channel, enabled]: any) => {
							let label = '';
							switch (channel) {
								case 'mail':
									label = 'Mail';
									break;
								case 'sms':
									label = 'SMS';
									break;
								case 'system':
									label = 'System';
									break;
							}
							return (
								<>
									<div
										key={channel}
										className={`recipient ${!enabled ? 'disable' : ''
											}`}
									>
										<span className="icon">
											<i
												className={
													label === 'Mail'
														? 'adminfont-mail'
														: label === 'SMS'
															? 'adminfont-enquiry'
															: label ===
																'System'
																? 'adminfont-notification'
																: 'adminfont-mail'
												}
											></i>
										</span>
										<div className="details">
											<span>{label}</span>
										</div>
										<i
											onClick={() =>
												toggleChannel(
													editingNotification,
													channel
												)
											}
											className={
												enabled
													? 'adminfont-eye'
													: 'adminfont-eye-blocked'
											}
										></i>
									</div>
								</>
							);
						})}
					</div>

					<div className="title">Recipients</div>

					<div className="drawer-recipients">
						{defaultRecipients.map((r) => (
							<div
								key={r.id}
								className={`recipient ${r.enabled ? '' : 'disable'}`}
							>
								<span className="icon">
									<i
										className={
											r.label === 'Store'
												? 'adminfont-storefront'
												: r.label === 'Admin'
													? 'adminfont-person'
													: r.label === 'Customer'
														? 'adminfont-user-circle'
														: 'adminfont-mail'
										}
									></i>
								</span>

								<div className="details">
									<span>{r.label}</span>
								</div>

								<i
									onClick={() =>
										toggleRecipient(editingNotification, r.id)
									}
									className={
										r.enabled
											? 'adminfont-eye'
											: 'adminfont-eye-blocked'
									}
								></i>
							</div>
						))}
					</div>

					{customRecipients.length > 0 && (
						<>
							<div className="title">Custom Recipients</div>
							<div className="drawer-recipients">
								<>
									{customRecipients.map((r) => (
										<div
											key={r.id}
											className={`recipient ${r.enabled ? '' : 'disable'}`}
										>
											<span className="icon">
												<i className="adminfont-mail"></i>
											</span>

											<div className="details">
												<span>{r.label}</span>
											</div>

											<i
												className="delete-btn adminfont-delete"
												onClick={() =>
													deleteRecipient(
														editingNotification,
														r.id
													)
												}
											></i>
										</div>
									))}
								</>
							</div>
						</>
					)}


					<div className="drawer-add-recipient">
						<input
							type="text"
							className="basic-input"
							placeholder="Type the email address of the additional recipient you want to notify, then click ‘Add’. "
							value={newRecipientValue}
							onChange={(e) =>
								setNewRecipientValue(e.target.value)
							}
							onKeyPress={(e) =>
								e.key === 'Enter' &&
								addRecipient(editingNotification)
							}
						/>
						<button
							className="admin-btn btn-purple"
							onClick={() =>
								addRecipient(editingNotification)
							}
						>
							<i className="adminfont-plus"></i>
							Add
						</button>
					</div>
				</CommonPopup>
			)}

			{/* Grid View */}
			{viewMode === 'grid' && (
				<div className="notification-grid">
					{filteredNotifications.map((notif: any) => (
						<div key={notif.id} className="notification-card">
							<div className="card-body">
								<div className="title-wrapper">
									<i
										className={`notification-icon adminfonts ${notif.icon}`}
									></i>
									<div className="details">
										<div className="title">
											{notif.event}
										</div>
										<div className="description">
											{notif.description}
										</div>
									</div>
								</div>
								<div className="recipients-list">
									{(notif.recipients || []).map((r: any) => (
										<RecipientBadge
											key={r.id}
											recipient={r}
											onToggle={() =>
												toggleRecipient(notif.id, r.id)
											}
											onDelete={
												r.canDelete
													? () =>
														deleteRecipient(
															notif.id,
															r.id
														)
													: undefined
											}
										/>
									))}
								</div>
							</div>
							<div className="card-footer">
								<div className="system-column">
									{Object.entries(notif.channels || {}).map(
										([channel, enabled]: any) => {
											let iconClass = '';
											let badgeClass = 'admin-badge ';
											switch (channel) {
												case 'mail':
													iconClass = 'adminfont-mail';
													badgeClass += 'yellow';
													break;
												case 'sms':
													iconClass =
														'adminfont-enquiry';
													badgeClass += 'green';
													break;
												case 'system':
													iconClass =
														'adminfont-notification';
													badgeClass += 'blue';
													break;
											}
											return (
												<i
													key={channel}
													className={`${iconClass} ${badgeClass} ${!enabled
														? 'disable'
														: ''
														}`}
													onClick={(e) => {
														e.stopPropagation();
														toggleChannel(
															notif.id,
															channel
														);
													}}
												></i>
											);
										}
									)}
								</div>

								<div
									className="admin-btn btn-purple"
									onClick={() =>
										setEditingNotification(notif.id)
									}
								>
									Manage <i className="adminfont-edit"></i>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Notification;
