/* global appLocalizer */
import React, { useEffect, useMemo, useState } from 'react';
import './EventRules.scss';
import {
	getApiLink,
	FormGroupWrapper,
	FormGroup,
	BasicInputUI,
	ButtonInputUI,
	PopupUI,
	TextAreaUI,
	TableCard,
	Column,
	QueryProps,
	BlockBuilderUI,
	renderBlocksToHTML,
	htmlToBlocks,
	EmailsInputUI,
} from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { salesReport } from '../../../assets/template/emailTemplate/salesReport';

const RECIPIENT_CONFIG: Record<string, { icon: string; badge: string }> = {
	Store: { icon: 'storefront', badge: 'blue' },
	Admin: { icon: 'person', badge: ' green' },
	Customer: { icon: 'user-circle', badge: 'yellow' },
	default: { icon: 'mail', badge: ' default-badge' },
};

const CHANNEL_CONFIG: Record<
	string,
	{ icon: string; badge: string; label: string }
> = {
	mail: { icon: 'mail', badge: 'yellow', label: 'Mail' },
	sms: { icon: 'enquiry', badge: 'green', label: 'SMS' },
	system: { icon: 'notification', badge: 'blue', label: 'System' },
};

const DEFAULT_RECIPIENT_TYPES = ['Store', 'Admin', 'Customer'];

interface Recipient {
	id: number;
	type: string;
	label: string;
	enabled: boolean;
	canDelete: boolean;
}

interface RecipientBadgeProps {
	recipient: Recipient;
	onToggle?: () => void;
	onDelete?: () => void;
}

interface Notification {
	id: number;
	event: string;
	tag: string;
	category: string;
	description: string;
	icon: string;
	recipients: Recipient[];
	channels: {
		mail?: boolean;
		sms?: boolean;
		system?: boolean;
		[key: string]: boolean | undefined;
	};
}
interface FormData {
	id?: number;
	system_message?: string;
	sms_content?: string;
	email_subject?: string;
	email_body?: string;
	email_body_builder?: string;
	available_placeholder?: string[];
	[key: string]: string | number | boolean | undefined;
}

const apiRequest = (
	method: 'GET' | 'POST',
	path: string,
	data?: Record<string, unknown>,
	params?: Record<string, unknown>
) =>
	axios({
		method,
		url: getApiLink(appLocalizer, path),
		headers: { 'X-WP-Nonce': appLocalizer.nonce },
		data,
		params,
	});

const RecipientBadge: React.FC<RecipientBadgeProps> = ({ recipient }) => {
	if (!recipient.enabled) {
		return null;
	}
	const config = RECIPIENT_CONFIG[recipient.label] ?? RECIPIENT_CONFIG.default;
	return (
		<div className={`admin-badge ${config.badge}`} role="button" tabIndex={0}>
			<i className={`adminfont-${config.icon}`}></i>
			<span>{recipient.label}</span>
		</div>
	);
};

const EventRules: React.FC = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [systemTags, setSystemTags] = useState<string[]>([]);
	const [openChannel, setOpenChannel] = useState<string | null>(null);
	const [newRecipientValue, setNewRecipientValue] = useState('');
	const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
	const [editingNotification, setEditingNotification] = useState<
		number | null
	>(null);
	const [notificationId, setNotificationId] = useState<number | null>(null);
	const [formData, setFormData] = useState<FormData>({});
	const [activeTag, setActiveTag] = useState<string>('All');
	const [cursorPos, setCursorPos] = useState<{
		start: number;
		end: number;
		field: string | null;
	}>({ start: 0, end: 0, field: null });
	const [isLoading, setIsLoading] = useState(true);
	const [useTemplate, setUseTemplate] = useState(false);

	// Fetch notifications on mount
	useEffect(() => {
		fetchNotifications({ paged: 1, per_page: 10 });
	}, []);

	// Autosave when notificationId changes (triggered by list-row click)
	useEffect(() => {
		if (!notifications || notificationId == null) {
			return;
		}
		const filtered = notifications.filter(
			(item) => item.id === notificationId
		);
		apiRequest('POST', `notifications/${notificationId}`, {
			notifications: filtered,
		}).then((response) => {
			if (response.data.success) {
				// setEditingNotification(null);
			}
		});
	}, [notificationId, notifications]);

	// Extract unique bracketed tags from system_message
	useEffect(() => {
		if (formData.system_message) {
			const matches =
				(formData.system_message as string).match(/\[[^\]]+\]/g) || [];
			setSystemTags(
				matches.filter((tag, index) => matches.indexOf(tag) === index)
			);
		} else {
			setSystemTags([]);
		}
	}, [formData.system_message]);

	// ------------------ Derived state ------------------
	const uniqueTags = useMemo(() => {
		const tags = Array.from(
			new Set(notifications.map((n) => n.tag).filter(Boolean))
		);
		return ['All', ...tags];
	}, [notifications]);

	const filteredNotifications = useMemo(() => {
		if (activeTag === 'All') {
			return notifications;
		}
		return notifications.filter((n) => n.tag === activeTag);
	}, [notifications, activeTag]);

	const editNotification = notifications.find(
		(item) => item.id === notificationId
	);
	const defaultRecipients = editNotification?.recipients.filter(
		(r: Recipient) => DEFAULT_RECIPIENT_TYPES.includes(r.type)
	);

	// Fetch notifications function for TableCard
	const fetchNotifications = (query: QueryProps) => {
		setIsLoading(true);

		apiRequest('GET', 'notifications', undefined, {
			page: query.paged || 1,
			per_page: query.per_page || 10,
			search: query.searchValue || '',
			tag:
				query.categoryFilter === 'All'
					? ''
					: query.categoryFilter || '',
			events: true,
		})
			.then((response) => {
				const items = response.data || [];
				setNotifications(items);

				setIsLoading(false);
			})
			.catch((error) => {
				setIsLoading(false);
				console.error(error);
			});
	};

	const updateNotification = (
		id: number,
		updater: (n: Notification) => Notification
	) =>
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? updater(n) : n))
		);

	const toggleRecipient = (notifId: number, recipientId: number) =>
		updateNotification(notifId, (n) => ({
			...n,
			recipients: n.recipients.map((r) =>
				r.id === recipientId ? { ...r, enabled: !r.enabled } : r
			),
		}));

	const deleteRecipient = (notifId: number, recipientId: number) =>
		updateNotification(notifId, (n) => ({
			...n,
			recipients: n.recipients.filter((r) => r.id !== recipientId),
		}));

	const toggleChannel = (notifId: number, channel: string) =>
		updateNotification(notifId, (n) => ({
			...n,
			channels: { ...n.channels, [channel]: !n.channels[channel] },
		}));

	const openEditPannel = (notifId: number, channel: string) => {
		apiRequest('GET', `notifications/${notifId}`).then((response) => {
			const notifData = Array.isArray(response.data)
				? response.data[0]
				: response.data;
			setFormData(notifData || {});
		});
		setOpenChannel(channel);
	};

	const handleAutoSave = (id: number | null, data?: FormData) => {
		if (id == null) {
			return;
		}
		apiRequest('POST', `notifications/${id}`, {
			formData: data ?? formData,
		});
	};

	const handleEmailSave = async (id, data) => {
		await apiRequest('POST', `notifications/${id}`, {
			formData: {
				id: data.id,
				email_subject: data.email_subject,
				email_body: data.email_body,
				// email_body_builder: data.email_body_builder,
				sms_content: data.sms_content,
				system_message: data.system_message,
				available_placeholder: data.available_placeholder,
			},
		});
	};

	const trackCursor = (
		e: React.MouseEvent<HTMLTextAreaElement | HTMLInputElement>,
		field: string
	) => {
		const target = e.target as HTMLTextAreaElement | HTMLInputElement;
		setCursorPos({
			start: target.selectionStart ?? 0,
			end: target.selectionEnd ?? 0,
			field,
		});
	};

	const insertAtCursor = (tag: string) => {
		const { start, end, field } = cursorPos;
		if (!field) {
			return;
		}
		const value = formData[field] || '';
		const updated = value.slice(0, start) + tag + value.slice(end);
		const updatedFormData = { ...formData, [field]: updated };
		setFormData(updatedFormData);
		requestAnimationFrame(() => {
			const el = document.activeElement as HTMLTextAreaElement | null;
			if (el?.setSelectionRange) {
				el.setSelectionRange(start + tag.length, start + tag.length);
			}
		});
		handleAutoSave(updatedFormData.id, updatedFormData);
	};
	const headers = {
		event: {
			label: __('Event', 'multivendorx'),
			width: '55%',
			render: (row: Notification) => (
				<div className="notification-details">
					<span className={`notification-icon ${row.icon}`}></span>
					<div className="details">
						<div className="title">
							{row.event}
							{row.tag && (
								<span
									className={`admin-badge yellow ${row.tag}`}
								>
									{row.tag}
								</span>
							)}
							{row.category && (
								<span
									className={`admin-badge blue ${row.category}`}
								>
									{row.category}
								</span>
							)}
						</div>
						<div className="des">{row.description}</div>
					</div>
				</div>
			),
		},
		recipients: {
			label: __('Recipients', 'multivendorx'),
			width: '15%',
			render: (row: Notification) => (
				<div className="recipients-list">
					{(row.recipients || []).map((recipient: Recipient) => (
						<>
							<RecipientBadge
								key={recipient.id}
								recipient={recipient}
							/>
						</>
					))}
				</div>
			),
		},
		system: {
			label: __('System', 'multivendorx'),
			width: '10%',
			render: (row: Notification) => (
				<div className="system-column">
					{Object.entries(row.channels || {}).map(
						([channel, enabled]: [string, boolean]) => {
							const cfg = CHANNEL_CONFIG[channel];
							if (!cfg || !enabled) {
								return null;
							}
							return (
								<i
									key={channel}
									className={`adminfont-${cfg.icon} admin-badge ${cfg.badge}`}
									onClick={(e) => {
										e.stopPropagation();
										setNotificationId(row.id);
										openEditPannel(row.id, channel);
									}}
								/>
							);
						}
					)}
				</div>
			),
		},
		action: {
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Edit', 'multivendorx'),
					icon: 'edit',
					onClick: (row: Notification) => {
						setEditingNotification(row.id);
						setNotificationId(row.id);
					},
				},
			],
		},
	};

	return (
		<div
			className="notification-container module-container tab-bg"
			data-variant="default"
		>
			{/* View Toggle + Category Filter */}
			<div className="choice-toggle-wrapper view-toggle">
				<div className="category-filter">
					{uniqueTags.map((tag) => (
						<div
							key={tag}
							className={`category-item ${activeTag === tag ? 'active' : ''}`}
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
					{(['list', 'grid'] as const).map((mode) => (
						<div
							key={mode}
							role="button"
							tabIndex={0}
							onClick={() => setViewMode(mode)}
							onKeyDown={(e) =>
								e.key === 'Enter' && setViewMode(mode)
							}
							className="toggle-option"
						>
							<input
								className="choice-toggle-form-input"
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
											? 'adminfont-editor-list'
											: 'adminfont-module'
									}
								></i>
							</label>
						</div>
					))}
				</div>
			</div>

			{viewMode === 'list' && (
				<Column>
					<TableCard
						headers={headers}
						rows={filteredNotifications}
						showMenu={false}
						isLoading={isLoading}
						onQueryUpdate={fetchNotifications}
						format={appLocalizer.date_format}
						onRowClick={(row: Notification) => {
							setEditingNotification(row.id);
							setNotificationId(row.id);
						}}
					/>
				</Column>
			)}

			{openChannel && (
				<PopupUI
					open={!!openChannel}
					onClose={() => setOpenChannel(null)}
					width="90%"
					height="90%"
					header={{
						icon: 'notification',
						title: `${
							openChannel === 'system'
								? __('System Notification', 'multivendorx')
								: openChannel === 'sms'
									? __('SMS Message', 'multivendorx')
									: __('Email Message', 'multivendorx')
						} - ${editNotification?.event ?? ''}`,
					}}
				>
					<>
						{openChannel === 'system' && (
							<BlockBuilderUI
								key={formData.id}
								name="system_message_builder"
								value={(() => {
									try {
										if (
											formData.email_body &&
											!useTemplate
										) {
											return {
												emailTemplates: [
													{
														id: 'store-registration',
														blocks: htmlToBlocks(
															formData.email_body
														),
													},
												],
												activeEmailTemplateId:
													'store-registration',
											};
										}
										return {
											emailTemplates: [salesReport],
											activeEmailTemplateId:
												'store-registration',
										};
									} catch (e) {
										console.error('Builder load error:', e);

										return {
											emailTemplates: [salesReport],
											activeEmailTemplateId:
												'store-registration',
										};
									}
								})()}
								onChange={(data) => {
									const activeTemplate =
										data.emailTemplates?.find(
											(t) =>
												t.id ===
												data.activeEmailTemplateId
										);

									const blocks = activeTemplate?.blocks || [];

									// generate HTML
									const html = renderBlocksToHTML(blocks);

									const updatedForm = {
										...formData,

										// SAVE HTML
										email_body: html,
									};

									if (!updatedForm.id) {
										return;
									}

									setFormData(updatedForm);
									handleEmailSave(
										updatedForm.id,
										updatedForm
									);
								}}
								field={{
									key: 'email_body_builder',
									context: 'email',
									visibleGroups: ['email'],
									emailTemplates: [salesReport],
									availablePlaceholder:
										formData.available_placeholders
											? formData.available_placeholders
													.split(',')
													.map((item) =>
														item
															.replace(
																/[\[\]]/g,
																''
															)
															.trim()
													)
													.filter(Boolean)
											: [],
								}}
								onTemplateSelect={(id) => {
									setUseTemplate(true); // 🔥 force template mode
								}}
							/>
						)}
						<FormGroupWrapper>
							{openChannel === 'sms' && (
								<FormGroup
									label={__('SMS Content', 'multivendorx')}
									htmlFor="sms-content"
								>
									<TextAreaUI
										name="sms_content"
										value={formData.sms_content || ''}
										onClick={(e) =>
											trackCursor(e, 'sms_content')
										}
										onChange={(value) => {
											// sms: onChange DOES autosave
											setFormData({
												...formData,
												sms_content: value,
											});
											handleAutoSave(formData.id);
										}}
										onBlur={() =>
											handleAutoSave(formData.id)
										}
									/>
								</FormGroup>
							)}
							{openChannel === 'mail' && (
								<>
									<FormGroup
										cols={6}
										label={__(
											'Email Subject',
											'multivendorx'
										)}
										htmlFor="email-subject"
									>
										<BasicInputUI
											name="email_subject"
											value={formData.email_subject || ''}
											onClick={(e) =>
												trackCursor(e, 'email_subject')
											}
											onChange={(value) => {
												setFormData({
													...formData,
													email_subject: value,
												});
												handleAutoSave(formData.id);
											}}
											onBlur={() =>
												handleAutoSave(formData.id)
											}
										/>
									</FormGroup>
									<FormGroup
										cols={6}
										label={__('Email Body', 'multivendorx')}
										htmlFor="email-body"
									>
										<TextAreaUI
											name="email_body"
											value={formData.email_body || ''}
											onClick={(e) =>
												trackCursor(e, 'email_body')
											}
											onChange={(value) => {
												setFormData({
													...formData,
													email_body: value,
												});
												handleAutoSave(formData.id);
											}}
											onBlur={() =>
												handleAutoSave(formData.id)
											}
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
				</PopupUI>
			)}

			{editingNotification && (
				<PopupUI
					open={!!editingNotification}
					onClose={() => setEditingNotification(null)}
					width={32.25}
					height="60%"
					header={{
						icon: 'notification',
						title: `${__('Settings', 'multivendorx')} - ${editNotification?.event ?? ''}`,
						description: editNotification?.description,
					}}
				>
					<FormGroupWrapper>
						<FormGroup
							label={__('Delivery method', 'multivendorx')}
						>
							<div className="buttons-wrapper left">
								{Object.entries(
									notifications.find(
										(n) => n.id === editingNotification
									)?.channels || {}
								).map(([channel, enabled]) => {
									const cfg = CHANNEL_CONFIG[channel];
									if (!cfg) {
										return null;
									}
									return (
										<div
											key={channel}
											className={`admin-badge ${enabled ? 'purple' : ''}`}
										>
											<i className={cfg.icon}></i>
											<span>{cfg.label}</span>
											<i
												onClick={() =>
													toggleChannel(
														editingNotification,
														channel
													)
												}
												className={`icon ${enabled ? 'adminfont-eye' : 'adminfont-eye-blocked'}`}
											/>
										</div>
									);
								})}
							</div>
						</FormGroup>
						<FormGroup label={__('Recipients', 'multivendorx')}>
							<div className="buttons-wrapper left">
								{defaultRecipients?.map((r: Recipient) => {
									const { icon } =
										RECIPIENT_CONFIG[r.label] ??
										RECIPIENT_CONFIG.default;
									return (
										<div
											key={r.id}
											className={`admin-badge ${r.enabled ? 'purple' : ''}`}
										>
											<i className={icon}></i>
											<span>{r.label}</span>
											<i
												onClick={() =>
													toggleRecipient(
														editingNotification,
														r.id
													)
												}
												className={`icon ${r.enabled ? 'adminfont-eye' : 'adminfont-eye-blocked'}`}
											/>
										</div>
									);
								})}
							</div>
						</FormGroup>
						<FormGroup
							label={__('Additional Recipients', 'multivendorx')}
						>
							<EmailsInputUI
								mode="multiple"
								value={
									newRecipientValue
										? newRecipientValue
												.split(',')
												.filter(Boolean)
										: []
								}
								placeholder={__(
									'Type email addresses and press Enter to add...',
									'multivendorx'
								)}
								enablePrimary={false}
								onChange={(emails) => {
									setNewRecipientValue(emails.join(','));
									if (editingNotification) {
										const currentNotif = notifications.find(
											(n) => n.id === editingNotification
										);
										if (currentNotif) {
											const defaultRecipientsOnly =
												currentNotif.recipients.filter(
													(r) =>
														DEFAULT_RECIPIENT_TYPES.includes(
															r.type
														)
												);
											const newRecipients = emails.map(
												(email, index) => ({
													id:
														Math.max(
															...defaultRecipientsOnly.map(
																(r) => r.id
															),
															0
														) +
														index +
														1,
													type: 'extra',
													label: email,
													enabled: true,
													canDelete: true,
												})
											);
											updateNotification(
												editingNotification,
												(n) => ({
													...n,
													recipients: [
														...defaultRecipientsOnly,
														...newRecipients,
													],
												})
											);
										}
									}
								}}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</PopupUI>
			)}

			{viewMode === 'grid' && (
				<div className="module-option-row">
					{filteredNotifications.map((notif) => (
						<div
							key={notif.id}
							className="module-list-item notification-card"
						>
							<div className="module-body">
								<div className="module-header">
									<div className="icon">
										<i
											className={`notification-icon adminfonts ${notif.icon}`}
										/>
									</div>
								</div>
								<div className="module-details">
									<div className="meta-name">
										{notif.event}
									</div>
									<div className="tag-wrapper">
										{(notif.recipients || []).map((r) => (
											<RecipientBadge
												key={r.id}
												recipient={r}
												onToggle={() =>
													toggleRecipient(
														notif.id,
														r.id
													)
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
									<div className="meta-description">
										{notif.description}
									</div>
								</div>
							</div>
							<div className="footer-wrapper">
								<div className="module-footer">
									<div className="system-column">
										{Object.entries(
											notif.channels || {}
										).map(([channel, enabled]) => {
											const cfg = CHANNEL_CONFIG[channel];
											if (!cfg) {
												return null;
											}
											return (
												<i
													key={channel}
													className={`adminfont-${cfg.icon} admin-badge ${cfg.badge} ${!enabled ? 'disable' : ''}`}
													onClick={(e) => {
														e.stopPropagation();
														toggleChannel(
															notif.id,
															channel
														);
													}}
												/>
											);
										})}
									</div>
									<ButtonInputUI
										buttons={[
											{
												icon: 'edit',
												text: 'Manage',
												color: 'purple',
												onClick: () => {
													setEditingNotification(
														notif.id
													);
													setNotificationId(notif.id);
												},
											},
										]}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default EventRules;
