import { __ } from '@wordpress/i18n';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
	ToggleSetting,
	getApiLink,
	SelectInput,
	Tabs,
	CommonPopup,
	useModules,
	SuccessNotice,
	FormGroupWrapper,
	FormGroup,
	AdminButton,
	Popover,
	Skeleton
} from 'zyra';

import StoreSettings from './storeSettings';
import PaymentSettings from './paymentSettings';
import StoreSquad from './storeStaff';
import PolicySettings from './policySettings';
import ShippingSettings from './shippingSettings';
import StoreRegistration from './storeRegistrationForm';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import Overview from './overview';
import '../viewStore.scss';
import { applyFilters } from '@wordpress/hooks';

const EditStore = () => {
	const [data, setData] = useState<any>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [bannerMenu, setBannerMenu] = useState(false);
	const [logoMenu, setLogoMenu] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const [deleteOption, setDeleteOption] = useState('');
	const [editName, setEditName] = useState(false);
	const [editDesc, setEditDesc] = useState(false);
	const [selectedOwner, setSelectedOwner] = useState<any>(null);
	const location = useLocation();
	const [prevName, setPrevName] = useState('');
	const [prevDesc, setPrevDesc] = useState('');

	useEffect(() => {
		if (editName) {
			setPrevName(data?.name || '');
		}
		if (editDesc) {
			setPrevDesc(data?.description || '');
		}
	}, [editName, editDesc]);

	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;

			// If clicked inside name or desc editing area, ignore
			if (target.closest('.store-name') || target.closest('.des')) {
				return;
			}

			if (editName || editDesc) {
				autoSave({ name: data.name, description: data.description });
			}

			setEditName(false);
			setEditDesc(false);
		};

		document.addEventListener('click', handleOutsideClick);
		return () => document.removeEventListener('click', handleOutsideClick);
	}, [data]);

	// Close dropdown on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				(event.target as HTMLElement).closest('.edit-section') ||
				(event.target as HTMLElement).closest('.edit-wrapper')
			) {
				return;
			}
			setBannerMenu(false);
			setLogoMenu(false);
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

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
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${editId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg('Store saved successfully!');
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
			const currentTab =
				data?.status === 'pending' || data?.status === 'rejected'
					? 'application-details'
					: 'store-overview';
		});
	}, [editId]);

	const runUploader = (key: string) => {
		const frame = (window as any).wp.media({
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

	const deleteStoreApiCall = (option: any) => {
		const payload: any = {
			delete: true,
			deleteOption: option,
		};

		// If changing store owner, get selected value from ref
		if (option === 'set_store_owner' && selectedOwner) {
			payload.new_owner_id = selectedOwner.value;
		}

		axios({
			method: 'PUT',
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

	const tabData = [
		{
			type: 'file',
			content: {
				id: 'store-overview',
				name: 'Overview',
				desc: 'Store Info',
				hideTabHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
		{
			type: 'file',
			content: {
				id: 'store',
				name: 'General',
				desc: 'Store Info',
				hideTabHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
		{
			type: 'file',
			content: {
				id: 'payment',
				name: 'Payment',
				desc: 'Payment Methods',
				hideTabHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
		{
			type: 'file',
			content: {
				id: 'staff',
				name: 'Staff',
				desc: 'Store staff',
				hideTabHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
		{
			type: 'file',
			module: 'store-shipping',
			content: {
				id: 'shipping',
				name: 'Shipping',
				desc: 'Store Shipping',
				hideTabHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
		{
			type: 'file',
			module: 'store-policy',
			content: {
				id: 'store-policy',
				name: 'Policy',
				desc: 'Policy',
				hideTabHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
		{
			type: 'file',
			content: {
				id: 'application-details',
				name: 'Application Details',
				desc: 'Application',
				hideTabHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
		{
			type: 'file',
			module: 'facilitator',
			content: {
				id: 'store-facilitator',
				name: 'Facilitator',
				desc: 'Facilitator',
				hideTabHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
	].filter((tab) => !tab.module || modules.includes(tab.module));

	const handleUpdateData = useCallback((updatedFields: any) => {
		setData((prev) => ({ ...prev, ...updatedFields }));
	}, []);

	const visibleTabs = useMemo(() => {
		const updatedTabs = tabData.map((tab) =>
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
	}, [tabData, data?.status]);

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
					// return <Facilitator id={editId} data={data} />;
					const output = applyFilters(
						'add_facilitator_content',
						null,
						editId,
						data
					);

					return output;
				default:
					return <div></div>;
			}
		},
		[editId, data, handleUpdateData]
	);
	const actionItems = [
		data.status === 'active' && {
			title: __('View Storefront', 'multivendorx'),
			icon: 'adminfont-storefront',
			link: `${appLocalizer.store_page_url}${data.slug}`,
			targetBlank: true,
		},
		data.status != 'pending' && {
			title: __('Manage status', 'multivendorx'),
			icon: 'adminfont-form-multi-select',
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
			icon: 'adminfont-single-product',
			link: `${appLocalizer.admin_url}edit.php?post_type=product&multivendorx_store_id=${data.id}`,
		},
		data.status != 'pending' && {
			title: __('Orders', 'multivendorx'),
			icon: 'adminfont-order',
			action: () => {
				navigate(`?page=multivendorx#&tab=reports&subtab=store-orders`);
			},
		},
		{
			title: __('Delete store', 'multivendorx'),
			icon: 'adminfont-delete',
			className: 'delete',
			action: () => {
				handleStoreDelete();
			},
		},
	].filter(Boolean);

	return (
		<>
			<SuccessNotice message={successMsg} />
			<Tabs
				tabData={visibleTabs}
				currentTab={currentTab}
				getForm={getForm}
				prepareUrl={prepareUrl}
				appLocalizer={appLocalizer}
				premium={false}
				tabTitleSection={
					<>
						<div className="general-wrapper">
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

									<div className="edit-section">
										<div className="icon-wrapper edit-wrapper">
											<span
												className="admin-btn btn-purple"
												onClick={(e) => {
													e.stopPropagation();
													setBannerMenu(true);
													setLogoMenu(false);
												}}
											>
												<i className="adminfont-edit"></i>
												{__(
													'Edit banner image',
													'multivendorx'
												)}
											</span>
											{bannerMenu && (
												<div className="dropdown">
													<div className="dropdown-body">
														<ul>
															<li
																onClick={(
																	e
																) => {
																	e.stopPropagation();
																	runUploader(
																		'banner'
																	);
																	setBannerMenu(
																		false
																	);
																}}
															>
																<div className="item">
																	<i className="adminfont-cloud-upload"></i>{' '}
																	{__(
																		'Upload',
																		'multivendorx'
																	)}
																</div>
															</li>
															<li
																className="delete"
																onClick={(
																	e
																) => {
																	e.stopPropagation();
																	const updated =
																	{
																		...data,
																		banner: '',
																	};
																	setData(
																		updated
																	);
																	autoSave(
																		updated
																	);
																	setBannerMenu(
																		false
																	);
																}}
															>
																<div className="item">
																	<i className="adminfont-delete"></i>{' '}
																	{__(
																		'Delete',
																		'multivendorx'
																	)}
																</div>
															</li>
														</ul>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
								<div className="details-wrapper">
									<div className="left-section">
										<div className="store-logo">
											{data?.image ? (
												<img src={data.image} alt="" />
											) : (
												<div className="placeholder-400x400" />
											)}

											<div className="edit-section">
												<div className="icon-wrapper edit-wrapper">
													<span
														className="admin-btn btn-purple"
														onClick={(e) => {
															e.stopPropagation();
															setLogoMenu(
																(prev) => !prev
															);
															setBannerMenu(
																false
															);
														}}
													>
														<i className="adminfont-edit"></i>
													</span>
													{logoMenu && (
														<div className="dropdown">
															<div className="dropdown-body">
																<ul>
																	<li
																		onClick={(
																			e
																		) => {
																			e.stopPropagation();
																			runUploader(
																				'image'
																			);
																			setLogoMenu(
																				false
																			);
																		}}
																	>
																		<div className="item">
																			<i className="adminfont-cloud-upload"></i>{' '}
																			{__(
																				'Upload',
																				'multivendorx'
																			)}
																		</div>
																	</li>
																	<li
																		className="delete"
																		onClick={(
																			e
																		) => {
																			e.stopPropagation();
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
																			setLogoMenu(
																				false
																			);
																		}}
																	>
																		<div className="item">
																			<i className="adminfont-delete"></i>{' '}
																			{__(
																				'Delete',
																				'multivendorx'
																			)}
																		</div>
																	</li>
																</ul>
															</div>
														</div>
													)}
												</div>
											</div>
										</div>

										<div className="details">
											<div className="name">
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
														<Skeleton width={150}/>
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
													<Skeleton width={100}/>
												)}

												{modules.includes(
													'marketplace-compliance'
												) && (
														<>
															<div className="admin-badge green">
																<i className="adminfont-store-inventory"></i>
															</div>
															<div className="admin-badge blue">
																<i className="adminfont-geo-my-wp"></i>
															</div>
															<div className="admin-badge yellow">
																<i className="adminfont-staff-manager"></i>
															</div>
														</>
													)}
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
													<Skeleton width={150}/>
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

											<div className="des">
												<b>
													{__(
														'Storefront link:',
														'multivendorx'
													)}{' '}
												</b>
												{appLocalizer.store_page_url}
												{data?.slug ? (
													<>
														{data.slug}{' '}
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
									</div>
									<div className="right-section">
										<div className="tag-wrapper"></div>
									</div>
								</div>
							</div>
						</div>
					</>
				}
				Link={Link}
				settingName={'Store'}
				hideTitle={true}
				hideBreadcrumb={true}
				action={
					<Popover
						className="edit-wrapper"
						template="action"
						toggleIcon="adminfont-more-vertical"
						items={actionItems}
					/>
				}
			/>

			<CommonPopup
				open={deleteModal}
				onClose={() => setDeleteModal(false)}
				width="37.5rem"
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
					<AdminButton
						buttons={[
							{
								icon: 'close',
								text: 'Cancel',
								className: 'red',
								onClick: () => setDeleteModal(false),
							},
							{
								icon: 'delete',
								text: 'Delete',
								className: 'red-bg',
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
						<FormGroup label={__('Deletion method', 'multivendorx')} htmlFor="deletion-method">
							<ToggleSetting
								 
								descClass="settings-metabox-description"
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
								onChange={(value: any) => {
									setDeleteOption(value);
									setSelectedOwner(null);
								}}
							/>
						</FormGroup>
						{deleteOption === 'set_store_owner' && (
							<FormGroup label={__('Assign new store owner', 'multivendorx')}>
								<SelectInput
									name="new_owner"
									value={selectedOwner?.value}
									options={appLocalizer.store_owners}
									type="single-select"
									onChange={(val: any) => {
										if (val) {
											setSelectedOwner(val);
										}
									}}
								/>
							</FormGroup>
						)}
					</FormGroupWrapper>
				</>
			</CommonPopup>
		</>
	);
};

export default EditStore;
