/* global appLocalizer */
import { __, _n, sprintf } from '@wordpress/i18n';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ToggleInput, ButtonInput, SelectInput, TextInput } from '@zyra/inputs';
import { getApiLink, useModules } from '@zyra/core';
import {
	CardComponent,
	FormGroupWrapperComponent,
	FormGroupComponent,
	SkeletonComponent,
	PopupComponent,
	ListComponent,
	NoticeManager,
	NavigatorComponent,
} from '@zyra/components';

import StoreSettings from './StoreSettings';
import PaymentSettings from './PaymentSettings';
import StoreSquad from './StoreStaff';
import PolicySettings from './PolicySettings';
import ShippingSettings from './ShippingSettings';
import StoreRegistration from './StoreRegistrationForm';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import Overview from './Overview';
import StoreTabLayout from './StoreTabLayout';
import type { SetupProgress } from './StoreTabLayout';
import '../ViewStore.scss';
import '../store-page.scss';
import { applyFilters } from '@wordpress/hooks';

/** A store's status as its pill reads it. */
const STATUS_LABELS: Record<string, string> = {
	active: __('Active', 'multivendorx'),
	pending: __('Pending', 'multivendorx'),
	rejected: __('Rejected', 'multivendorx'),
	suspended: __('Suspended', 'multivendorx'),
	permanently_rejected: __('Permanently rejected', 'multivendorx'),
	under_review: __('Under review', 'multivendorx'),
	deactivated: __('Deactivated', 'multivendorx'),
};

const EditStore = () => {
	const [data, setData] = useState({});
	const [deleteModal, setDeleteModal] = useState(false);
	const [deleteOption, setDeleteOption] = useState('');
	const [orderCount, setOrderCount] = useState(0);
	const [productCount, setProductCount] = useState(0);
	const [selectedOwner, setSelectedOwner] = useState(null);
	// What the forms saved since the store loaded, for the setup checklist (kept apart from `data`, which feeds the
	// forms their initial values).
	const [setupProgress, setSetupProgress] = useState<SetupProgress>({});
	const reportProgress = useCallback(
		(saved: SetupProgress) =>
			setSetupProgress((previous) => ({ ...previous, ...saved })),
		[]
	);
	const location = useLocation();
	// Name and description save when typing pauses, like every settings field (no Save button).
	const profileSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const hash = location.hash.replace(/^#/, '');

	const editParts = hash.match(/edit\/(\d+)/);
	const editId = editParts ? editParts[1] : null;

	const hashParams = new URLSearchParams(hash);
	const currentTab = hashParams.get('subtab');
	const prepareUrl = (tabId: string) =>
		`?page=multivendorx#&tab=stores&edit/${editId}/&subtab=${tabId}`;
	const navigate = useNavigate();
	const { modules } = useModules();

	const autoSave = (updatedData: { [key: string]: string }) => {
		if (!editId) {
			return;
		}

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `stores/${editId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				NoticeManager.add({
					title: __('Great!', 'multivendorx'),
					message: __('Store saved successfully!', 'multivendorx'),
					type: 'success',
					position: 'float',
				});
			}
		});
	};

	useEffect(() => {
		if (!editId) {
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `stores/${editId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setData(data);
		});
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					per_page: 1,
					meta_key: 'multivendorx_store_id',
					meta_value: editId,
				},
			})
			.then((response) => {
				setOrderCount(Number(response.headers['x-wp-total']) || 0);
			})
			.catch((err) => {
				console.error(err);
			});
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					per_page: 1,
					meta_key: 'multivendorx_store_id',
					meta_value: editId,
				},
			})
			.then((response) => {
				setProductCount(Number(response.headers['x-wp-total']) || 0);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [editId]);

	const runUploader = (key: string) => {
		const frame = wp.media({
			title: 'Select or Upload Image',
			button: { text: 'Use this image' },
			multiple: false,
		});

		frame.on('select', function () {
			const attachment = frame.state().get('selection').first().toJSON();

			const updated = {
				...data,
				[key]: attachment.url,
			};
			setData(updated);
			autoSave(updated);
		});

		frame.open();
	};

	const handleStoreDelete = () => {
		if (
			data?.status === 'active' ||
			data?.status === 'under_review' ||
			data?.status === 'suspended' ||
			data?.status === 'deactivated'
		) {
			setDeleteModal(true);
		} else {
			deleteStoreApiCall('direct');
		}
	};

	const deleteStoreApiCall = (option) => {
		const payload = {
			delete: true,
			deleteOption: option,
		};

		// If changing store owner, get selected value from ref
		if (option === 'set_store_owner' && selectedOwner) {
			payload.new_owner_id = selectedOwner.value;
		}

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `stores/${editId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: payload,
		}).then((res) => {
			if (res.data.success) {
				setDeleteModal(false);
				navigate(`?page=multivendorx#&tab=stores`);
			}
		});
	};

	const settingContent = [
		{
			type: 'file',
			content: {
				id: 'store-overview',
				headerTitle: __('Overview', 'multivendorx'),
				headerDescription: __('Store Information', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'credit-card',
			},
		},
		{
			type: 'file',
			content: {
				id: 'store',
				headerTitle: __('General', 'multivendorx'),
				headerDescription: __('Store Information', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'credit-card',
			},
		},
		{
			type: 'file',
			content: {
				id: 'payment',
				headerTitle: __('Payment', 'multivendorx'),
				headerDescription: __('Payment Methods', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'credit-card',
			},
		},
		{
			type: 'file',
			content: {
				id: 'staff',
				headerTitle: __('Staff', 'multivendorx'),
				headerDescription: __('Store Staff', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'credit-card',
			},
		},
		{
			type: 'file',
			module: 'store-shipping',
			content: {
				id: 'shipping',
				headerTitle: __('Shipping', 'multivendorx'),
				headerDescription: __('Store Shipping', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'credit-card',
			},
		},
		{
			type: 'file',
			module: 'store-policy',
			content: {
				id: 'store-policy',
				headerTitle: __('Policy', 'multivendorx'),
				headerDescription: __('Store Policy', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'credit-card',
			},
		},
		{
			type: 'file',
			content: {
				id: 'compliance-records',
				headerTitle: __('Compliance & records', 'multivendorx'),
				headerDescription: __('Compliance & records', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'credit-card',
			},
		},
		{
			type: 'file',
			module: 'facilitator',
			content: {
				id: 'store-facilitator',
				headerTitle: __('Facilitator', 'multivendorx'),
				headerDescription: __('Facilitator', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'credit-card',
			},
		},
	].filter((setting) => !setting.module || modules.includes(setting.module));
	const handleUpdateData = useCallback((updatedFields) => {
		setData((prev) => ({ ...prev, ...updatedFields }));
	}, []);

	const visibleTabs = useMemo(() => {
		const updatedTabs = settingContent.map((tab) =>
			tab.content.id === 'compliance-records'
				? {
						...tab,
						content: {
							...tab.content,
							name:
								data?.status === 'pending' ||
								data?.status === 'rejected' ||
								data?.status === 'permanently_rejected'
									? // data?.status === 'active'
										'Application Details'
									: 'Archive Data',
						},
					}
				: tab
		);

		if (
			data?.status === 'pending' ||
			data?.status === 'rejected' ||
			data?.status === 'permanently_rejected'
		) {
			return updatedTabs.filter(
				(tab) => tab.content.id === 'compliance-records'
			);
		}

		return updatedTabs;
	}, [settingContent, data?.status]);

	/** Name or description changed in the Store profile card: shown at once, saved once typing pauses. */
	const updateProfileText = (key: 'name' | 'description', value: string) => {
		setData((previous) => ({ ...previous, [key]: value }));
		if (profileSaveTimer.current) {
			clearTimeout(profileSaveTimer.current);
		}
		profileSaveTimer.current = setTimeout(() => {
			if ('name' === key && !value.trim()) {
				return; // A store keeps a name: an emptied field isn't saved.
			}
			autoSave({ [key]: value });
		}, 800);
	};

	const removeImage = (key: 'image' | 'banner') => {
		const updated = { ...data, [key]: '' };
		setData(updated);
		autoSave(updated);
	};

	/** One image row of the Store profile card: a preview, then Upload/Replace and Remove. */
	const imageRow = (key: 'image' | 'banner', label: string, help: string) => (
		<FormGroupComponent label={label} desc={help}>
			<div className={`mvx-upload-row is-${key}`}>
				<span className="mvx-upload-preview">
					{data?.[key] ? (
						<img src={data[key]} alt="" />
					) : (
						<i className="adminfont-image" aria-hidden="true" />
					)}
				</span>
				<span className="mvx-upload-state">
					{data?.[key]
						? __('Uploaded', 'multivendorx')
						: __('None', 'multivendorx')}
				</span>
				<span className="mvx-upload-actions">
					<button
						type="button"
						className="admin-btn btn-purple"
						onClick={() => runUploader(key)}
					>
						{data?.[key]
							? __('Replace', 'multivendorx')
							: __('Upload', 'multivendorx')}
					</button>
					{data?.[key] && (
						<button
							type="button"
							className="mvx-store-more is-danger"
							onClick={() => removeImage(key)}
						>
							{__('Remove', 'multivendorx')}
						</button>
					)}
				</span>
			</div>
		</FormGroupComponent>
	);

	// General → Store profile: what customers see first. Edited here, not by clicking the header.
	const profileCard = (
		<CardComponent
			id="store-profile"
			title={__('Store profile', 'multivendorx')}
			desc={__(
				'The name, description and images customers see on the storefront.',
				'multivendorx'
			)}
		>
			<FormGroupWrapperComponent>
				<FormGroupComponent
					label={__('Store name', 'multivendorx')}
					htmlFor="store-name"
				>
					<TextInput
						name="store-name"
						value={data?.name || ''}
						onChange={(value: string) =>
							updateProfileText('name', value)
						}
					/>
				</FormGroupComponent>
				<FormGroupComponent
					label={__('Description', 'multivendorx')}
					desc={__(
						'A sentence or two about what the store sells.',
						'multivendorx'
					)}
					htmlFor="store-description"
				>
					<textarea
						id="store-description"
						className="textarea-input"
						rows={3}
						value={data?.description || ''}
						onChange={(event) =>
							updateProfileText('description', event.target.value)
						}
					/>
				</FormGroupComponent>
				{imageRow(
					'image',
					__('Logo', 'multivendorx'),
					__('Square, at least 200 × 200 px.', 'multivendorx')
				)}
				{imageRow(
					'banner',
					__('Banner', 'multivendorx'),
					__(
						'The wide image across the top of the storefront, e.g. 1500 × 900 px.',
						'multivendorx'
					)
				)}
			</FormGroupWrapperComponent>
		</CardComponent>
	);

	const renderTab = (tabId: string) => {
		switch (tabId) {
			case 'store-overview':
				return (
					<Overview
						id={editId}
						storeData={data}
						onUpdate={handleUpdateData}
					/>
				);
			case 'store':
				return (
					<StoreSettings
						id={editId}
						data={data}
						onUpdate={handleUpdateData}
						profileCard={profileCard}
						onProgress={reportProgress}
					/>
				);
			case 'staff':
				return <StoreSquad id={editId} />;
			case 'payment':
				return (
					<PaymentSettings
						id={editId}
						data={data}
						onProgress={reportProgress}
					/>
				);
			case 'shipping':
				return <ShippingSettings id={editId} data={data} />;
			case 'store-policy':
				return <PolicySettings id={editId} data={data} />;
			case 'compliance-records':
				return <StoreRegistration id={editId} />;
			case 'store-facilitator':
				return applyFilters(
					'multivendorx_add_facilitator_content',
					null,
					editId,
					data
				);
			default:
				return <div></div>;
		}
	};

	// Every tab but the Overview (which has its own side column) gets the sections and setup checklist at its right.
	const getForm = (tabId: string) =>
		'store-overview' === tabId ? (
			renderTab(tabId)
		) : (
			<StoreTabLayout
				tabId={tabId}
				data={data}
				progress={setupProgress}
				openTab={(next) => navigate(prepareUrl(next))}
			>
				{renderTab(tabId)}
			</StoreTabLayout>
		);
	const joinedAt = data?.create_time
		? new Date(data.create_time.replace(' ', 'T'))
		: null;

	/** "Today", "3 days ago", "2 months ago": how long the store has been on the marketplace. */
	const sinceJoined = (() => {
		if (!joinedAt || Number.isNaN(joinedAt.getTime())) {
			return '';
		}
		const days = Math.max(
			0,
			Math.floor((Date.now() - joinedAt.getTime()) / 86400000)
		);
		if (days < 1) {
			return __('Today', 'multivendorx');
		}
		if (days < 31) {
			return sprintf(
				/* translators: %s: number of days. */
				_n('%s day ago', '%s days ago', days, 'multivendorx'),
				days
			);
		}
		const months = Math.floor(days / 30.44);
		if (months < 12) {
			return sprintf(
				/* translators: %s: number of months. */
				_n('%s month ago', '%s months ago', months, 'multivendorx'),
				months
			);
		}
		const years = Math.floor(months / 12);
		return sprintf(
			/* translators: %s: number of years. */
			_n('%s year ago', '%s years ago', years, 'multivendorx'),
			years
		);
	})();

	/** The store's figures at the header's right: a count and what it counts; a figure with a list behind it opens it. */
	const heroFigures: {
		key: string;
		/** An icon beside the label, so each figure is told apart at a glance (the rating has its star instead). */
		icon?: string;
		value: ReactNode;
		label: string;
		href?: string;
		onClick?: () => void;
	}[] = [
		{
			key: 'products',
			icon: 'single-product',
			value: productCount.toLocaleString(),
			label: _n('Product', 'Products', productCount, 'multivendorx'),
			href: data?.id
				? `${appLocalizer.admin_url}edit.php?post_type=product&multivendorx_store_id=${data.id}`
				: undefined,
		},
		{
			key: 'orders',
			icon: 'cart',
			value: orderCount.toLocaleString(),
			label: _n('Order', 'Orders', orderCount, 'multivendorx'),
			onClick: () =>
				navigate('?page=multivendorx#&tab=reports&subtab=store-orders'),
		},
		...(modules.includes('store-review')
			? [
					{
						key: 'rating',
						value:
							data?.total_reviews > 0 ? (
								<>
									<i
										className="adminfont-star"
										aria-hidden="true"
									/>
									{Number(data.overall_reviews).toFixed(1)}
								</>
							) : (
								'—'
							),
						label:
							data?.total_reviews > 0
								? sprintf(
										/* translators: %s: number of reviews. */
										_n(
											'%s review',
											'%s reviews',
											data.total_reviews,
											'multivendorx'
										),
										data.total_reviews
									)
								: __('No reviews yet', 'multivendorx'),
					},
				]
			: []),
	];

	const actionItems = [
		data.status != 'pending' && {
			title: __('Manage status', 'multivendorx'),
			icon: 'form-multi-select',
			action: () => {
				navigate(
					`?page=multivendorx#&tab=stores&edit/${data.id}/&subtab=store`,
					{
						state: { highlightTarget: 'store-status' },
					}
				);

				setTimeout(() => {
					navigate(
						`?page=multivendorx#&tab=stores&edit/${data.id}/&subtab=store`,
						{ replace: true }
					);
				}, 5000);
			},
		},
		data.status != 'pending' && {
			title: __('Products', 'multivendorx'),
			icon: 'single-product',
			link: `${appLocalizer.admin_url}edit.php?post_type=product&multivendorx_store_id=${data.id}`,
		},
		data.status != 'pending' && {
			title: __('Orders', 'multivendorx'),
			icon: 'order',
			action: () => {
				navigate(`?page=multivendorx#&tab=reports&subtab=store-orders`);
			},
		},
		{
			title: __('Delete store', 'multivendorx'),
			icon: 'delete',
			className: 'delete',
			action: () => {
				handleStoreDelete();
			},
		},
	].filter(Boolean);
	return (
		<>
			<NavigatorComponent
				settingContent={visibleTabs}
				currentSetting={currentTab}
				getForm={getForm}
				prepareUrl={prepareUrl}
				appLocalizer={appLocalizer}
				className="without-border mvx-store-page"
				settingTitleSection={
					<>
						{/* The page's own breadcrumb: back to the store list, then this store. */}
						<nav
							className="mvx-store-breadcrumb"
							aria-label={__('Breadcrumb', 'multivendorx')}
						>
							<a href="?page=multivendorx#&tab=stores">
								{__('Stores', 'multivendorx')}
							</a>
							<span aria-hidden="true">/</span>
							<span aria-current="page">
								{data?.name || __('Store', 'multivendorx')}
							</span>
						</nav>
						{/* The store at a glance: who it is, its state, the actions, and its key figures. Its name,
						    description and images are edited under General → Store profile. */}
						<header className="mvx-store-hero">
							{/* The store's cover: its banner, or a brand gradient until it has one. */}
							<div
								className={`mvx-store-cover${data?.banner ? '' : ' is-empty'}`}
								style={
									data?.banner
										? {
												backgroundImage: `url("${data.banner}")`,
											}
										: undefined
								}
							>
								<button
									type="button"
									className="mvx-store-cover-edit"
									onClick={() => runUploader('banner')}
								>
									<i
										className="adminfont-image"
										aria-hidden="true"
									/>
									{data?.banner
										? __('Change cover', 'multivendorx')
										: __('Add cover', 'multivendorx')}
								</button>
							</div>
							<div className="mvx-store-hero-main">
								<span className="mvx-store-hero-logo">
									{data?.image ? (
										<img src={data.image} alt="" />
									) : (
										<span aria-hidden="true">
											{(data?.name || '?')
												.charAt(0)
												.toUpperCase()}
										</span>
									)}
									<button
										type="button"
										className="mvx-store-logo-edit"
										onClick={() => runUploader('image')}
										aria-label={
											data?.image
												? __(
														'Change logo',
														'multivendorx'
													)
												: __('Add logo', 'multivendorx')
										}
										title={
											data?.image
												? __(
														'Change logo',
														'multivendorx'
													)
												: __('Add logo', 'multivendorx')
										}
									>
										<i
											className="adminfont-edit"
											aria-hidden="true"
										/>
									</button>
								</span>
								<div className="mvx-store-hero-text">
									<div className="mvx-store-hero-title">
										<h1>
											{data?.name || (
												<SkeletonComponent width={12} />
											)}
										</h1>
										{data?.status && (
											<span
												className={`mvx-status-pill is-${data.status.replace(/_/g, '-')}`}
											>
												{STATUS_LABELS[data.status] ??
													data.status}
											</span>
										)}
									</div>
									{data?.description && (
										<p className="mvx-store-hero-desc">
											{data.description}
										</p>
									)}
									<ul className="mvx-store-hero-meta">
										{data?.slug && (
											<li>
												<i
													className="adminfont-storefront"
													aria-hidden="true"
												/>
												<a
													href={`${appLocalizer.store_page_url}${data.slug}`}
													target="_blank"
													rel="noopener noreferrer"
												>
													{`${appLocalizer.store_page_url}${data.slug}`.replace(
														/^https?:\/\//,
														''
													)}
												</a>
											</li>
										)}
										{data?.store_email?.primary && (
											<li>
												<i
													className="adminfont-mail"
													aria-hidden="true"
												/>
												{data.store_email.primary}
											</li>
										)}
										{/* A phone object can arrive with empty fields: show it only with a number. */}
										{data?.phone?.phone && (
											<li>
												<i
													className="adminfont-form-phone"
													aria-hidden="true"
												/>
												{[
													data.phone.country_code,
													data.phone.phone,
												]
													.filter(Boolean)
													.join(' ')}
											</li>
										)}
										{data?.primary_owner_info
											?.display_name && (
											<li>
												<i
													className="adminfont-person"
													aria-hidden="true"
												/>
												<span>
													{__(
														'Owned by',
														'multivendorx'
													)}{' '}
													<button
														type="button"
														className="mvx-store-hero-link"
														onClick={() =>
															navigate(
																prepareUrl(
																	'staff'
																)
															)
														}
													>
														{
															data
																.primary_owner_info
																.display_name
														}
													</button>
												</span>
											</li>
										)}
										{joinedAt && sinceJoined && (
											<li title={sinceJoined}>
												<i
													className="adminfont-calendar"
													aria-hidden="true"
												/>
												{sprintf(
													/* translators: %s: the date the store joined, e.g. "Nov 19, 2026". */
													__(
														'Member since %s',
														'multivendorx'
													),
													joinedAt.toLocaleDateString(
														undefined,
														{
															month: 'short',
															day: 'numeric',
															year: 'numeric',
														}
													)
												)}
											</li>
										)}
									</ul>
								</div>
								<div className="mvx-store-hero-side">
									<div className="mvx-store-hero-actions">
										{data?.status === 'active' &&
											data?.slug && (
												<a
													className="admin-btn btn-purple"
													href={`${appLocalizer.store_page_url}${data.slug}`}
													target="_blank"
													rel="noopener noreferrer"
												>
													<i
														className="adminfont-external"
														aria-hidden="true"
													/>
													{__(
														'View storefront',
														'multivendorx'
													)}
												</a>
											)}
										<PopupComponent
											position="menu-dropdown"
											toggleIcon="more-vertical"
											tooltipName={__(
												'More actions',
												'multivendorx'
											)}
											tooltipPosition="bottom-right"
										>
											<ListComponent
												items={actionItems}
											/>
										</PopupComponent>
									</div>
									{/* The figures under the actions, as on a profile: big numbers, what they count, hairlines between. */}
									<ul className="mvx-store-hero-figures">
										{heroFigures.map((figure) => {
											const inner = (
												<>
													<span className="mvx-figure-value">
														{figure.value}
													</span>
													<span className="mvx-figure-label">
														{figure.icon && (
															<i
																className={`adminfont-${figure.icon}`}
																aria-hidden="true"
															/>
														)}
														{figure.label}
													</span>
												</>
											);
											return (
												<li key={figure.key}>
													{figure.href && (
														<a
															className="mvx-figure is-link"
															href={figure.href}
														>
															{inner}
														</a>
													)}
													{!figure.href &&
														figure.onClick && (
															<button
																type="button"
																className="mvx-figure is-link"
																onClick={
																	figure.onClick
																}
															>
																{inner}
															</button>
														)}
													{!figure.href &&
														!figure.onClick && (
															<div className="mvx-figure">
																{inner}
															</div>
														)}
												</li>
											);
										})}
									</ul>
								</div>
							</div>
						</header>
					</>
				}
				Link={Link}
				settingName={'Store'}
			/>
			<PopupComponent
				open={deleteModal}
				onClose={() => setDeleteModal(false)}
				width={37.5}
				height="50%"
				className="popup-drawer"
				header={{
					icon: 'storefront',
					title: __('Manage store deletion', 'multivendorx'),
					description: __(
						'Choose the appropriate action to take when deleting this store.',
						'multivendorx'
					),
				}}
				footer={
					<ButtonInput
						buttons={[
							{
								icon: 'close',
								text: __('Cancel', 'multivendorx'),
								color: 'red',
								onClick: () => setDeleteModal(false),
							},
							{
								icon: 'delete',
								text: __('Delete', 'multivendorx'),
								color: 'red-bg',
								onClick: () => {
									if (deleteOption) {
										deleteStoreApiCall(deleteOption);
									}
								},
							},
						]}
					/>
				}
			>
				<>
					<FormGroupWrapperComponent>
						<FormGroupComponent
							label={__('Deletion method', 'multivendorx')}
							htmlFor="deletion-method"
						>
							<ToggleInput
								options={[
									{
										value: 'set_store_owner',
										key: 'set_store_owner',
										label: __(
											'Change store owner',
											'multivendorx'
										),
									},
									{
										value: 'product_assign_admin',
										key: 'product_assign_admin',
										label: __(
											'Assign product to Admin',
											'multivendorx'
										),
									},
									{
										value: 'permanent_delete',
										key: 'permanent_delete',
										label: __(
											'Permanently Delete',
											'multivendorx'
										),
									},
								]}
								value={deleteOption}
								onChange={(value) => {
									setDeleteOption(value);
									setSelectedOwner(null);
								}}
							/>
						</FormGroupComponent>
						{deleteOption === 'set_store_owner' && (
							<FormGroupComponent
								label={__(
									'Assign new store owner',
									'multivendorx'
								)}
							>
								<SelectInput
									name="new_owner"
									value={selectedOwner?.value}
									options={appLocalizer.store_owners}
									onChange={(val) => {
										if (val) {
											setSelectedOwner(val);
										}
									}}
								/>
							</FormGroupComponent>
						)}
					</FormGroupWrapperComponent>
				</>
			</PopupComponent>
		</>
	);
};

export default EditStore;
