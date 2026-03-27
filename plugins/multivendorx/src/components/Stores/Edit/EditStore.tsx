/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
	ChoiceToggleUI,
	getApiLink,
	useModules,
	FormGroupWrapper,
	FormGroup,
	Skeleton,
	ButtonInputUI,
	SelectInputUI,
	SettingsNavigator,
	PopupUI,
	useOutsideClick,
	ItemListUI,
	Container,
	NoticeManager,
	Column,
} from 'zyra';

import StoreSettings from './StoreSettings';
import PaymentSettings from './PaymentSettings';
import StoreSquad from './StoreStaff';
import PolicySettings from './PolicySettings';
import ShippingSettings from './ShippingSettings';
import StoreRegistration from './StoreRegistrationForm';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import Overview from './Overview';
import '../ViewStore.scss';
import { applyFilters } from '@wordpress/hooks';

const EditStore = () => {
	const [data, setData] = useState({});
	const [deleteModal, setDeleteModal] = useState(false);
	const [deleteOption, setDeleteOption] = useState('');
	const [editName, setEditName] = useState(false);
	const [editDesc, setEditDesc] = useState(false);
	const [selectedOwner, setSelectedOwner] = useState(null);
	const location = useLocation();
	const [prevName, setPrevName] = useState('');
	const [prevDesc, setPrevDesc] = useState('');
	const bannerRef = useRef<HTMLDivElement>(null);
	const logoRef = useRef<HTMLDivElement>(null);
	const storeRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (editName) {
			setPrevName(data?.name || '');
		}
		if (editDesc) {
			setPrevDesc(data?.description || '');
		}
	}, [editName, editDesc]);

	useOutsideClick(storeRef, () => {
		if (editName || editDesc) {
			autoSave({ name: data.name, description: data.description });
		}
		setEditName(false);
		setEditDesc(false);
	});

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
			url: getApiLink(appLocalizer, `store/${editId}`),
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
			url: getApiLink(appLocalizer, `store/${editId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setData(data);
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

			const updated = { ...data, [key]: attachment.url };
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
			url: getApiLink(appLocalizer, `store/${editId}`),
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
				id: 'application-details',
				headerTitle: __('Application Details', 'multivendorx'),
				headerDescription: __('Application', 'multivendorx'),
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
			tab.content.id === 'application-details'
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
				(tab) => tab.content.id === 'application-details'
			);
		}

		return updatedTabs;
	}, [settingContent, data?.status]);

	const [expanded, setExpanded] = useState(false);

	const words = data?.description?.split(' ') || [];
	const shouldTruncate = words.length > 50;
	const displayText = expanded
		? data?.description
		: words.slice(0, 50).join(' ');

	const getForm = useCallback(
		(tabId: string) => {
			switch (tabId) {
				case 'store-overview':
					return <Overview id={editId} storeData={data} />;
				case 'store':
					return (
						<StoreSettings
							id={editId}
							data={data}
							onUpdate={handleUpdateData}
						/>
					);
				case 'staff':
					return <StoreSquad id={editId} />;
				case 'payment':
					return <PaymentSettings id={editId} data={data} />;
				case 'shipping':
					return <ShippingSettings id={editId} data={data} />;
				case 'store-policy':
					return <PolicySettings id={editId} data={data} />;
				case 'application-details':
					return <StoreRegistration id={editId} />;
				case 'store-facilitator':
					return applyFilters(
						'add_facilitator_content',
						null,
						editId,
						data
					);
				default:
					return <div></div>;
			}
		},
		[editId, data, handleUpdateData]
	);
	const actionItems = [
		data.status === 'active' && {
			title: __('View Storefront', 'multivendorx'),
			icon: 'storefront',
			link: `${appLocalizer.store_page_url}${data.slug}`,
			targetBlank: true,
		},
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
			<SettingsNavigator
				settingContent={visibleTabs}
				currentSetting={currentTab}
				getForm={getForm}
				prepareUrl={prepareUrl}
				appLocalizer={appLocalizer}
				settingTitleSection={
					<>
						<Container general>
							<div className="store-header">
								<div
									className="banner"
									style={{
										background:
											data?.banner &&
											`url("${data.banner}")`,
									}}
								>
									{Object.keys(data).length === 0 ? (
										<Skeleton
											variant="rectangular"
											width="100%"
											height={200}
										/>
									) : !data.banner ? (
										<div className="default-img-1500x900" />
									) : null}

									<PopupUI
										position="menu-dropdown"
										tooltipName={__(
											'Banner',
											'multivendorx'
										)}
										toggleIcon="edit theme-background"
									>
										<ItemListUI
											items={[
												{
													id: 'upload',
													title: __(
														'Upload',
														'multivendorx'
													),
													icon: 'cloud-upload',
													action: (item, e) => {
														e?.stopPropagation();
														runUploader('banner');
													},
												},
												{
													id: 'delete',
													title: __(
														'Delete',
														'multivendorx'
													),
													icon: 'delete',
													className: 'delete',
													action: (item, e) => {
														e.stopPropagation();
														const updated = {
															...data,
															banner: '',
														};
														setData(updated);
														autoSave(updated);
													},
												},
											]}
										/>
									</PopupUI>
								</div>

								<div className="logo-wrapper">
									<div className="store-logo">
										{data?.image ? (
											<img src={data.image} alt="" />
										) : (
											<div className="placeholder-400x400" />
										)}
										<PopupUI
											position="menu-dropdown"
											tooltipName={__(
												'Logo',
												'multivendorx'
											)}
											toggleIcon="edit theme-background"
										>
											<ItemListUI
												items={[
													{
														id: 'upload',
														title: __(
															'Upload',
															'multivendorx'
														),
														icon: 'cloud-upload',
														action: (
															item,
															e
														) => {
															e?.stopPropagation();
															runUploader(
																'image'
															);
														},
													},
													{
														id: 'delete',
														title: __(
															'Delete',
															'multivendorx'
														),
														icon: 'delete',
														className: 'delete',
														action: (
															item,
															e
														) => {
															e?.stopPropagation();
															const updated =
															{
																...data,
																image: '',
															};
															setData(
																updated
															);
															autoSave(
																updated
															);
														},
													},
												]}
											/>
										</PopupUI>
									</div>

									<div className="tag-wrapper">
										{data.status === 'active' ? (
											<span className="status admin-badge green">
												{__(
													'Active',
													'multivendorx'
												)}
											</span>
										) : data.status ===
											'pending' ? (
											<span className="status admin-badge yellow">
												{__(
													'Pending',
													'multivendorx'
												)}
											</span>
										) : data.status ===
											'rejected' ? (
											<span className="status admin-badge red">
												{__(
													'Rejected',
													'multivendorx'
												)}
											</span>
										) : data.status ===
											'suspended' ? (
											<span className="status admin-badge blue">
												{__(
													'Suspended',
													'multivendorx'
												)}
											</span>
										) : data.status ===
											'permanently_rejected' ? (
											<span className="status admin-badge red">
												{__(
													'Permanently Rejected',
													'multivendorx'
												)}
											</span>
										) : data.status ===
											'under_review' ? (
											<span className="status admin-badge yellow">
												{__(
													'Under Review',
													'multivendorx'
												)}
											</span>
										) : data.status ===
											'deactivated' ? (
											<span className="status admin-badge red">
												{__(
													'Permanently Deactivated',
													'multivendorx'
												)}
											</span>
										) : (
											<Skeleton width={100} />
										)}

										{modules.includes(
											'marketplace-compliance'
										) && (
												<>
													<div className="admin-badge green">
														<i className="adminfont-store-inventory"></i>
														{__('Gold Plan', 'multivendorx')}
													</div>
													<div className="admin-badge blue">
														<i className="adminfont-geo-my-wp"></i>
														{__('On Vacation', 'multivendorx')}
													</div>
													<div className="admin-badge yellow">
														<i className="adminfont-staff-manager"></i>
														{__('Closed', 'multivendorx')}
													</div>
													<div className="admin-badge yellow">
														<i className="adminfont-staff-manager"></i>
														{__('Complained', 'multivendorx')}
													</div>
												</>
											)}
									</div>
								</div>
								<div className="details-wrapper">
									<div className="left-section">
										<div className="details">
											<div className="heading">
												<div
													className="name"
													ref={storeRef}
												>
													<div
														className="store-name"
														onClick={() =>
															setEditName(true)
														}
													>
														{editName ? (
															<input
																type="text"
																value={
																	data?.name || ''
																}
																onChange={(e) =>
																	setData({
																		...data,
																		name: e
																			.target
																			.value,
																	})
																}
																onBlur={() => {
																	if (
																		!data?.name?.trim()
																	) {
																		setData({
																			...data,
																			name: prevName,
																		});
																	}
																	setEditName(
																		false
																	);
																}}
																className="basic-input"
																autoFocus
															/>
														) : data?.name ? (
															data.name
														) : (
															<Skeleton width={150} />
														)}

														<span
															className={`edit-icon  ${editName
																? ''
																: 'admin-badge blue'
																}`}
															onClick={(e) => {
																e.stopPropagation();
																if (
																	editName &&
																	!data?.name?.trim()
																) {
																	setData({
																		...data,
																		name: prevName,
																	});
																}
																setEditName(
																	!editName
																);
															}}
														>
															<i
																className={
																	editName
																		? ''
																		: 'adminfont-edit'
																}
															></i>
														</span>
													</div>

												</div>
												<div className="storefront-link">
													<a href="#" className="link-item">
														<b>
															{__(
																'Storefront link',
																'multivendorx'
															)}
														</b>
													</a>
													{/* {appLocalizer.store_page_url} */}
													{data?.slug ? (
														<>
															{/* {data.slug}{' '} */}
															{data?.status !=
																'pending' &&
																data?.status !=
																'rejected' &&
																data?.status !=
																'permanently_rejected' && (
																	<span
																		className="edit-icon admin-badge blue"
																		onClick={() => {
																			navigate(
																				`?page=multivendorx#&tab=stores&edit/${data.id}/&subtab=store`,
																				{
																					state: {
																						highlightTarget:
																							'store-slug',
																					},
																				}
																			);

																			setTimeout(
																				() => {
																					navigate(
																						`?page=multivendorx#&tab=stores&edit/${data.id}/&subtab=store`,
																						{
																							replace: true,
																						}
																					);
																				},
																				500
																			);
																		}}
																	>
																		<i className="adminfont-edit"></i>
																	</span>
																)}
														</>
													) : (
														<Skeleton width={100} />
													)}
												</div>
											</div>

											<div
												className="des"
												onClick={() =>
													setEditDesc(true)
												}
											>
												{editDesc ? (
													<textarea
														value={
															data.description ||
															''
														}
														onChange={(e) =>
															setData({
																...data,
																description:
																	e.target
																		.value,
															})
														}
														onBlur={() => {
															if (
																!data?.description?.trim()
															) {
																setData({
																	...data,
																	description:
																		prevDesc,
																});
															}
															setEditDesc(false);
														}}
														className="textarea-input"
														autoFocus
													/>
												) : Object.keys(data).length ===
													0 ? (
													<Skeleton width={150} />
												) : data?.description ? (
													<div>
														<span>
															{displayText}
															{shouldTruncate &&
																!expanded
																? '...'
																: ''}
														</span>
														{shouldTruncate && (
															<button
																onClick={() =>
																	setExpanded(
																		!expanded
																	)
																}
																className="read-more-btn"
															>
																{expanded
																	? __(
																		'Read less',
																		'multivendorx'
																	)
																	: __(
																		'Read more',
																		'multivendorx'
																	)}
															</button>
														)}
													</div>
												) : (
													<span>
														{__(
															'Enter your description',
															'multivendorx'
														)}
													</span>
												)}

												<span
													className={`edit-icon ${editDesc
														? ''
														: 'admin-badge blue'
														}`}
													onClick={(e) => {
														e.stopPropagation();
														if (
															editDesc &&
															!data?.description?.trim()
														) {
															setData({
																...data,
																description:
																	prevDesc,
															});
														}
														setEditDesc(!editDesc);
													}}
												>
													<i
														className={
															editDesc
																? ''
																: 'adminfont-edit'
														}
													></i>
												</span>
											</div>

											<div className="contact-info">
												<div className="desc store-info">
													<i className="adminfont-form-phone"></i>
													Registered since 2020
												</div>
												<div className="desc store-info">
													<i className="adminfont-form-phone"></i>
													9874563135
												</div>
												<div className="desc store-info">
													<i className="adminfont-mail"></i>
													test@gmail.com
												</div>
											</div>

											<div className="desc store-info">
												<i className="adminfont-user-circle"></i>
												<b> Primary Owner: </b> Store1
											</div>
										</div>
									</div>
									<div className="right-section">
										{modules.includes(
											'store-review'
										) && (
												<div className="reviews-wrapper">
													{[...Array(5)].map(
														(_, i) => (
															<i
																key={i}
																className={`review adminfont-star${data.total_reviews >
																	0 &&
																	i <
																	Math.round(
																		data.overall_reviews
																	)
																	? ''
																	: '-o'
																	}`}
															></i>
														)
													)}

													<span>
														{data.total_reviews > 0
															? `${data.overall_reviews
															} (${data.total_reviews
															} ${data.total_reviews ===
																1
																? __(
																	'Review',
																	'multivendorx'
																)
																: __(
																	'Reviews',
																	'multivendorx'
																)
															})`
															: `(${__(
																'0 Review',
																'multivendorx'
															)})`}
													</span>
												</div>
											)}

										<div className="details-box">
											<div className="details">
												<div className="number"><i className="adminfont-single-product blue"></i> 15</div>
												<div className="desc">Products</div>
											</div>
											<div className="details">
												<div className="number"><i className="adminfont-order pink"></i> 15</div>
												<div className="desc">Orders</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</Container>
					</>
				}
				Link={Link}
				settingName={'Store'}
				action={
					<PopupUI
						position="menu-dropdown"
						toggleIcon="more-vertical"
					>
						<ItemListUI items={actionItems} />
					</PopupUI>
				}
			/>
			<PopupUI
				open={deleteModal}
				onClose={() => setDeleteModal(false)}
				width={37.5}
				height="50%"
				header={{
					icon: 'storefront',
					title: __('Manage store deletion', 'multivendorx'),
					description: __(
						'Choose the appropriate action to take when deleting this store.',
						'multivendorx'
					),
				}}
				footer={
					<ButtonInputUI
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
					<FormGroupWrapper>
						<FormGroup
							label={__('Deletion method', 'multivendorx')}
							htmlFor="deletion-method"
						>
							<ChoiceToggleUI
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
						</FormGroup>
						{deleteOption === 'set_store_owner' && (
							<FormGroup
								label={__(
									'Assign new store owner',
									'multivendorx'
								)}
							>
								<SelectInputUI
									name="new_owner"
									value={selectedOwner?.value}
									options={appLocalizer.store_owners}
									onChange={(val) => {
										if (val) {
											setSelectedOwner(val);
										}
									}}
								/>
							</FormGroup>
						)}
					</FormGroupWrapper>
				</>
			</PopupUI>
		</>
	);
};

export default EditStore;
