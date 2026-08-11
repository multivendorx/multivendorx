/* global appLocalizer */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { FormGroupComponent, FormGroupWrapperComponent, PopupComponent, } from '@zyra/components';
import { ButtonInput, TextAreaInput } from '@zyra/inputs';
import { QueryProps, TableCard, TableRow } from '@zyra/table';
import { getUrl, toWcIsoDate, } from '../../../src/services/commonFunction';

    interface ReturnProduct {
        id: number;
        name: string;
        image?: string;
    }

    interface ReturnOrder {
        return_id: number;
        order_id: number;
        store_id?: number;
        store_name?: string;
        amount?: number;
        currency?: string;
        reason?: string;
        additional_info?: string;
        products?: ReturnProduct[];
        return_images: string[];
        date_created?: string;
        date_created_gmt?: string;
        status?: string;
        customer_id?: number;
        customer_name?: string;
        customer_email?: string;
        customer_edit_link?: string;
    }

    interface StoreOption {
        label: string;
        value: number;
    }

    interface StoreApi {
        id: number;
        store_name: string;
    }

    const EMPTY_ORDER: ReturnOrder = {
        return_id: 0,
        order_id: 0,
        return_images: [],
    };

const PendingReturn: React.FC<object> = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [store, setStore] = useState<StoreOption[]>([]);
	const [popupOpen, setPopupOpen] = useState(false);
	const [formData, setFormData] = useState({
		content: '',
	});
	const [viewOrder, setViewOrder] =
		useState<ReturnOrder>(EMPTY_ORDER);
	const [isSubmitting, setIsSubmitting] = useState(false);

	/**
	 * Get stores.
	 */
	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'stores'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					options: true,
				},
			})
			.then((response) => {
				const options = (response.data || []).map(
					(store: StoreApi) => ({
						label: store.store_name,
						value: store.id,
					})
				);

				setStore(options);
			})
			.catch(() => {
				setStore([]);
			});
	}, []);

	/**
	 * Close popup.
	 */
	const handleCloseForm = () => {
		setPopupOpen(false);
		setViewOrder(EMPTY_ORDER);
		setFormData({
			content: '',
		});
	};

	/**
	 * Handle textarea change.
	 */
	const handleChange = (
		key: string,
		value: string
	) => {
		setFormData({
			...formData,
			[key]: value,
		});
	};

	/**
	 * Approve / reject return.
	 *
	 * Uses the existing return_update() REST endpoint.
	 */
	const handleSubmit = async (
		orderId: number,
		decision: 'approve' | 'reject'
	) => {
		if (isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		try {
			await axios({
				method: 'PUT',
				url: `${appLocalizer.apiUrl}/returns/${orderId}`,
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				data: {
					decision,
					note: formData.content,
				},
			});

			handleCloseForm();

			doRefreshTableData({
				paged: 1,
				per_page: 10,
			} as QueryProps);
		} catch (error) {
			console.error(
				'Return update failed:',
				error
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	/**
	 * Return table headers.
	 */
	const headers = {
		order_id: {
			label: __('Order', 'multivendorx'),
			isSortable: true,
			render: (row: ReturnOrder) => (
				<a
					href={getUrl(row.order_id, 'order')}
					target="_blank"
					rel="noopener noreferrer"
					className="link-item"
				>
					#{row.order_id}
				</a>
			),
		},

		store_name: {
			label: __('Store', 'multivendorx'),
			render: (row: ReturnOrder) => (
				<a
					href={getUrl(
						row.store_id,
						'store',
						'edit'
					)}
					target="_blank"
					rel="noopener noreferrer"
					className="link-item"
				>
					{row.store_name}
				</a>
			),
		},

		amount: {
			label: __('Amount', 'multivendorx'),
			type: 'currency',
		},

		reason: {
			label: __('Return Reason', 'multivendorx'),
			render: (row: ReturnOrder) =>
				row.reason || '',
		},

		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
			statusClass: (row: ReturnOrder) =>
				`${row.status}`,
		},

		date_created: {
			label: __('Date', 'multivendorx'),
			isSortable: true,
			type: 'date',
		},

		action: {
			label: __('Action', 'multivendorx'),

			render: (row: ReturnOrder) => (
				<ButtonInput
					buttons={[
						{
							icon: 'preview',
							text: __(
								'View Details',
								'multivendorx'
							),
							color: 'purple',

							onClick: () => {
								setViewOrder(row);
								setPopupOpen(true);
							},
						},

						{
							icon: 'yes',
							text: __(
								'Approve',
								'multivendorx'
							),
							color: 'green',

							onClick: () => {
								setViewOrder(row);
								setPopupOpen(true);
							},
						},

						{
							icon: 'close',
							text: __(
								'Reject',
								'multivendorx'
							),
							color: 'red',

							onClick: () => {
								setViewOrder(row);
								setPopupOpen(true);
							},
						},
					]}
				/>
			),
		},
	};

	/**
	 * Filters.
	 */
	const filters = [
		{
			key: 'store_id',
			label: __('Select Stores', 'multivendorx'),
			type: 'select',
			options: store,
		},

		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	/**
	 * Fetch return requests.
	 */
	const doRefreshTableData = (
		query: QueryProps
	) => {
		setIsLoading(true);

		axios
			.get(
				`${appLocalizer.apiUrl}/returns`,
				{
					headers: {
						'X-WP-Nonce':
							appLocalizer.nonce,
					},

					params: {
						page: query.paged,

						// Backend expects "row".
						row: query.per_page,

						// Backend expects search_value.
						search_value:
							query.searchValue,

						store_id:
							query?.filter?.store_id,

						start_date:
							query.filter?.created_at
								?.startDate
								? toWcIsoDate(
										query.filter.created_at
											.startDate,
										'start'
									)
								: undefined,

						end_date:
							query.filter?.created_at
								?.endDate
								? toWcIsoDate(
										query.filter.created_at
											.endDate,
										'end'
									)
								: undefined,
					},
				}
			)
			.then((response) => {
				const orders = Array.isArray(
					response.data
				)
					? response.data
					: [];

				setRows(orders);

				setRowIds(
					orders.map(
						(order: ReturnOrder) =>
							order.order_id
					)
				);

				const total =
					Number(
						response.headers[
							'x-wp-total'
						]
					) || 0;

				setTotalRows(total);

				window.multivendorxStore?.setCount(
					'return-requests',
					total
				);
			})
			.catch((error) => {
				console.error(
					'Return fetch failed:',
					error
				);

				setRows([]);
				setTotalRows(0);
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	/**
	 * Initial table load.
	 */
	useEffect(() => {
		doRefreshTableData({
			paged: 1,
			per_page: 10,
		} as QueryProps);
	}, []);

	return (
		<>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={
					doRefreshTableData
				}
				ids={rowIds}
				search={{}}
				filters={filters}
				format={
					appLocalizer.date_format
				}
				currency={{
					currencySymbol:
						appLocalizer.currency_symbol,

					priceDecimals:
						appLocalizer.price_decimals,

					decimalSeparator:
						appLocalizer.decimal_separator,

					thousandSeparator:
						appLocalizer.thousand_separator,

					currencyPosition:
						appLocalizer.currency_position,
				}}
			/>

			<PopupComponent
				open={popupOpen}
				onClose={handleCloseForm}
				width={40}
				height="80%"
				header={{
					icon: 'announcement',

					title: __(
						'Return Request Details',
						'multivendorx'
					),

					description: __(
						'Review return details before taking action.',
						'multivendorx'
					),
				}}
				footer={
					<ButtonInput
						buttons={[
							{
								icon: 'external-link',
								text: __(
									'View Order',
									'multivendorx'
								),
								color: 'yellow-bg',

								onClick: () => {
									if (
										!viewOrder.order_id
									) {
										return;
									}

									window.open(
										`${appLocalizer.site_url.replace(
											/\/$/,
											''
										)}/wp-admin/post.php?post=${viewOrder.order_id}&action=edit`,
										'_blank'
									);
								},

								disabled: false,
								children: null,
								customStyle: {},
								style: {},
							},

							{
								icon: 'close',
								text: __(
									'Reject',
									'multivendorx'
								),
								color: 'red',

								onClick: () => {
									if (
										!viewOrder.order_id
									) {
										return;
									}

									handleSubmit(
										viewOrder.order_id,
										'reject'
									);
								},

								disabled:
									isSubmitting,

								children: null,
								customStyle: {},
								style: {},
							},

							{
								icon: 'yes',
								text: __(
									'Approve',
									'multivendorx'
								),
								color: 'green',

								onClick: () => {
									if (
										!viewOrder.order_id
									) {
										return;
									}

									handleSubmit(
										viewOrder.order_id,
										'approve'
									);
								},

								disabled:
									isSubmitting,

								children: null,
								customStyle: {},
								style: {},
							},
						]}
					/>
				}
			>
				{viewOrder && (
					<FormGroupWrapperComponent>

						<FormGroupComponent
							label={__(
								'Return Reason',
								'multivendorx'
							)}
						>
							<div className="refund-reason-box">
								{viewOrder.reason ||
									''}
							</div>
						</FormGroupComponent>

						<FormGroupComponent
							label={__(
								'Additional Information',
								'multivendorx'
							)}
						>
							<div className="refund-additional-info">
								{viewOrder.additional_info ||
									''}
							</div>
						</FormGroupComponent>

						{viewOrder.products &&
							viewOrder.products.length >
								0 && (
								<FormGroupComponent
									label={__(
										'Return Products',
										'multivendorx'
									)}
								>
									<div className="return-product-list">
										{viewOrder.products.map(
											(product) => (
												<div
													key={
														product.id
													}
													className="return-product-item"
												>
													{product.image && (
														<div className="return-product-image">
															<img
																src={
																	product.image
																}
																alt={
																	product.name
																}
															/>
														</div>
													)}

													<div className="return-product-name">
														{
															product.name
														}
													</div>
												</div>
											)
										)}
									</div>
								</FormGroupComponent>
							)}

						{viewOrder.return_images?.length >
							0 && (
							<FormGroupComponent
								label={
									viewOrder
										.return_images
										.length === 1
										? __(
												'Attachment',
												'multivendorx'
											)
										: __(
												'Attachments',
												'multivendorx'
											)
								}
							>
								<div className="refund-attachment-list">
									{viewOrder.return_images.map(
										(
											image,
											index
										) => (
											<a
												key={
													index
												}
												href={
													image
												}
												target="_blank"
												rel="noopener noreferrer"
												className="refund-attachment-item"
											>
												<div className="attachment-thumb">
													<img
														src={
															image
														}
														alt={__(
															'Return attachment',
															'multivendorx'
														)}
													/>
												</div>

												<div className="attachment-name">
													{__(
														'Attachment',
														'multivendorx'
													)}{' '}
													{index +
														1}
												</div>
											</a>
										)
									)}
								</div>
							</FormGroupComponent>
						)}

						<FormGroupComponent
							label={__(
								'Decision Note',
								'multivendorx'
							)}
							htmlFor="content"
						>
							<TextAreaInput
								name="content"
								value={
									formData.content
								}
								onChange={(
									value: string
								) =>
									handleChange(
										'content',
										value
									)
								}
								usePlainText={
									false
								}
								tinymceApiKey={
									appLocalizer
										.admin_settings[
										'overview'
									][
										'tinymce_api_section'
									] ?? ''
								}
							/>
						</FormGroupComponent>

					</FormGroupWrapperComponent>
				)}
			</PopupComponent>
		</>
	);
};

export default PendingReturn;