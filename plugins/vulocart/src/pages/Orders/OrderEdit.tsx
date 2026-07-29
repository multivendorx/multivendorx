/* global vulocartLocalizer */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, FormGroupWrapperComponent, FormGroupComponent } from '@zyra/components';
import { SelectInput, ButtonInput, TextInput } from '@zyra/inputs';
import './orders-page.scss';

/**
 * Order\Domain\FulfillmentStatus::all() (modules/Order/Domain/FulfillmentStatus.php).
 */
const FULFILLMENT_STATUS_OPTIONS = [
	{ label: 'draft', value: 'draft' },
	{ label: 'pending', value: 'pending' },
	{ label: 'processing', value: 'processing' },
	{ label: 'shipped', value: 'shipped' },
	{ label: 'completed', value: 'completed' },
	{ label: 'cancelled', value: 'cancelled' },
];

/**
 * Order\Domain\PaymentStatus::all() (modules/Order/Domain/PaymentStatus.php)
 * — deliberately excludes 'refunded' from this dropdown's own options;
 * refunding goes through the dedicated "Issue refund" action below
 * instead, since a real refund needs an amount, not just a status flip.
 */
const PAYMENT_STATUS_OPTIONS = [
	{ label: 'pending', value: 'pending' },
	{ label: 'paid', value: 'paid' },
	{ label: 'failed', value: 'failed' },
];

interface OrderItem {
	id: number;
	title: string;
	quantity: number;
	unit_price: number;
	currency: string | null;
	subtotal: number;
}

interface OrderDetail {
	id: number;
	order_number: string;
	customer_email: string | null;
	customer_name: string | null;
	payment_status: string;
	fulfillment_status: string;
	refunded_amount: number | null;
	currency: string | null;
	subtotal: number;
	total: number;
	item_count: number;
	items: OrderItem[];
	created_at: string;
}

interface OrderEditProps {
	id: number;
}

/**
 * A dedicated full page for viewing/updating one order — the real
 * WooCommerce order-edit-screen pattern (per this plugin's admin-UX
 * brief), replacing the popup this page used to open from the list.
 * Fetches `GET /orders/{id}` (modules/Order/Rest.php's `get_item()`,
 * admin-only) on mount, since a direct page load/bookmark/back-button
 * visit to `admin.php?page=vulocart-orders&action=edit&id=123` has no
 * in-memory row to seed from.
 *
 * Payment Status and Fulfillment Status are two independent fields now
 * (PaymentStatus.php's/FulfillmentStatus.php's own docblocks) — both save
 * together via one `PATCH /orders/{id}` call. Refunding is a separate
 * action (not just another payment-status option) since a real refund
 * needs an amount recorded (`refunded_amount`), not just a status flip —
 * `POST /orders/{id}/refund`.
 *
 * Saving stays on the page and shows an inline "Order updated." notice,
 * mirroring WooCommerce's own "Update" behavior (it never redirects you
 * away from the order you're looking at).
 */
export function OrderEdit( { id }: OrderEditProps ) {
	const [ order, setOrder ] = useState< OrderDetail | null >( null );
	const [ paymentStatus, setPaymentStatus ] = useState( 'pending' );
	const [ fulfillmentStatus, setFulfillmentStatus ] = useState( 'pending' );
	const [ notFound, setNotFound ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ savedNotice, setSavedNotice ] = useState( false );
	const [ refundAmount, setRefundAmount ] = useState( '' );
	const [ isRefunding, setIsRefunding ] = useState( false );
	const [ showRefundForm, setShowRefundForm ] = useState( false );

	const loadOrder = () => {
		axios
			.get< OrderDetail >( getApiLink( vulocartLocalizer, `orders/${ id }` ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			} )
			.then( ( response ) => {
				setOrder( response.data );
				setPaymentStatus( response.data.payment_status );
				setFulfillmentStatus( response.data.fulfillment_status );
				setRefundAmount( String( response.data.total ) );
			} )
			.catch( () => setNotFound( true ) );
	};

	useEffect( loadOrder, [] ); // eslint-disable-line react-hooks/exhaustive-deps -- id is fixed for this page's lifetime (a new id means a new page load, not a re-render).

	const handleSave = () => {
		setIsSaving( true );
		setSavedNotice( false );

		axios
			.patch< OrderDetail >(
				getApiLink( vulocartLocalizer, `orders/${ id }` ),
				{ payment_status: paymentStatus, fulfillment_status: fulfillmentStatus },
				{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
			)
			.then( ( response ) => {
				setOrder( response.data );
				setIsSaving( false );
				setSavedNotice( true );
			} )
			.catch( () => setIsSaving( false ) );
	};

	const handleRefund = () => {
		const amount = parseFloat( refundAmount );

		if ( ! amount || amount <= 0 ) {
			return;
		}

		setIsRefunding( true );

		axios
			.post< OrderDetail >(
				getApiLink( vulocartLocalizer, `orders/${ id }/refund` ),
				{ amount },
				{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
			)
			.then( ( response ) => {
				setOrder( response.data );
				setPaymentStatus( response.data.payment_status );
				setIsRefunding( false );
				setShowRefundForm( false );
				setSavedNotice( true );
			} )
			.catch( () => setIsRefunding( false ) );
	};

	if ( notFound ) {
		return (
			<ContainerComponent general>
				<ColumnComponent>
					<a className="vulocart-back-link" href="admin.php?page=vulocart-orders">
						{ __( '← Back to Orders', 'vulocart' ) }
					</a>
					<p>{ __( 'No order exists with this id.', 'vulocart' ) }</p>
				</ColumnComponent>
			</ContainerComponent>
		);
	}

	if ( ! order ) {
		return (
			<ContainerComponent general>
				<ColumnComponent>
					<p>{ __( 'Loading…', 'vulocart' ) }</p>
				</ColumnComponent>
			</ContainerComponent>
		);
	}

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<a className="vulocart-back-link" href="admin.php?page=vulocart-orders">
					{ __( '← Back to Orders', 'vulocart' ) }
				</a>

				<h1 className="vulocart-edit-page-title">
					{ __( 'Order', 'vulocart' ) } { order.order_number }
				</h1>

				{ savedNotice && (
					<div className="vulocart-saved-notice">{ __( 'Order updated.', 'vulocart' ) }</div>
				) }

				<div className="vulocart-order-edit-layout">
					<div className="vulocart-order-edit-main">
						<h2>{ __( 'Customer', 'vulocart' ) }</h2>
						<p>
							{ order.customer_name || __( 'Guest', 'vulocart' ) }
							{ order.customer_email ? ` — ${ order.customer_email }` : '' }
						</p>
						<p className="vulocart-order-edit-placed">
							{ __( 'Placed:', 'vulocart' ) } { order.created_at }
						</p>

						<h2>{ __( 'Items', 'vulocart' ) } ({ order.item_count })</h2>
						<div className="vulocart-order-detail-items">
							{ order.items.length === 0 && <p>{ __( 'No line items.', 'vulocart' ) }</p> }
							{ order.items.map( ( item ) => (
								<div key={ item.id } className="vulocart-order-detail-item">
									<span>
										{ item.title } x{ item.quantity }
									</span>
									<span>
										{ item.subtotal } { item.currency }
									</span>
								</div>
							) ) }
							<div className="vulocart-order-detail-total">
								<strong>{ __( 'Total', 'vulocart' ) }</strong>
								<strong>
									{ order.total } { order.currency }
								</strong>
							</div>
							{ order.refunded_amount !== null && (
								<div className="vulocart-order-detail-total">
									<span>{ __( 'Refunded', 'vulocart' ) }</span>
									<span>
										{ order.refunded_amount } { order.currency }
									</span>
								</div>
							) }
						</div>
					</div>

					<div className="vulocart-order-edit-side">
						<h2>{ __( 'Fulfillment', 'vulocart' ) }</h2>
						<FormGroupWrapperComponent>
							<FormGroupComponent label={ __( 'Fulfillment status', 'vulocart' ) } htmlFor="vulocart-order-fulfillment-status">
								<SelectInput
									name="fulfillment_status"
									type="single-select"
									options={ FULFILLMENT_STATUS_OPTIONS }
									value={ fulfillmentStatus }
									onChange={ ( value ) => setFulfillmentStatus( value as string ) }
								/>
							</FormGroupComponent>
						</FormGroupWrapperComponent>

						<h2>{ __( 'Payment', 'vulocart' ) }</h2>
						<FormGroupWrapperComponent>
							<FormGroupComponent label={ __( 'Payment status', 'vulocart' ) } htmlFor="vulocart-order-payment-status">
								<SelectInput
									name="payment_status"
									type="single-select"
									options={ PAYMENT_STATUS_OPTIONS }
									value={ 'refunded' === paymentStatus ? 'paid' : paymentStatus }
									onChange={ ( value ) => setPaymentStatus( value as string ) }
								/>
							</FormGroupComponent>
						</FormGroupWrapperComponent>

						<ButtonInput
							buttons={ [
								{
									icon: 'save',
									text: isSaving ? __( 'Saving…', 'vulocart' ) : __( 'Update', 'vulocart' ),
									onClick: handleSave,
									disabled: isSaving,
								},
							] }
						/>

						{ 'refunded' !== order.payment_status && (
							<>
								<h2>{ __( 'Refund', 'vulocart' ) }</h2>
								{ ! showRefundForm ? (
									<ButtonInput
										buttons={ [
											{
												icon: 'refund',
												text: __( 'Issue refund', 'vulocart' ),
												onClick: () => setShowRefundForm( true ),
											},
										] }
									/>
								) : (
									<FormGroupWrapperComponent>
										<FormGroupComponent label={ __( 'Refund amount', 'vulocart' ) } htmlFor="vulocart-order-refund-amount">
											<TextInput
												name="refund_amount"
												type="number"
												value={ refundAmount }
												onChange={ ( value ) => setRefundAmount( value as string ) }
											/>
										</FormGroupComponent>
										<ButtonInput
											buttons={ [
												{
													icon: 'refund',
													text: isRefunding ? __( 'Refunding…', 'vulocart' ) : __( 'Confirm refund', 'vulocart' ),
													onClick: handleRefund,
													disabled: isRefunding,
												},
											] }
										/>
									</FormGroupWrapperComponent>
								) }
							</>
						) }
					</div>
				</div>
			</ColumnComponent>
		</ContainerComponent>
	);
}

export default OrderEdit;
