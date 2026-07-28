/* global vulocartLocalizer */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, FormGroupWrapperComponent, FormGroupComponent } from '@zyra/components';
import { SelectInput, ButtonInput } from '@zyra/inputs';
import './orders-page.scss';

const ORDER_STATUS_OPTIONS = [
	{ label: 'pending', value: 'pending' },
	{ label: 'processing', value: 'processing' },
	{ label: 'completed', value: 'completed' },
	{ label: 'cancelled', value: 'cancelled' },
	{ label: 'refunded', value: 'refunded' },
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
	status: string;
	currency: string | null;
	subtotal: number;
	total: number;
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
 * Saving a status change stays on the page and shows an inline
 * "Order updated." notice, mirroring WooCommerce's own "Update" behavior
 * (it never redirects you away from the order you're looking at).
 */
export function OrderEdit( { id }: OrderEditProps ) {
	const [ order, setOrder ] = useState< OrderDetail | null >( null );
	const [ statusValue, setStatusValue ] = useState( 'pending' );
	const [ notFound, setNotFound ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ savedNotice, setSavedNotice ] = useState( false );

	useEffect( () => {
		axios
			.get< OrderDetail >( getApiLink( vulocartLocalizer, `orders/${ id }` ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			} )
			.then( ( response ) => {
				setOrder( response.data );
				setStatusValue( response.data.status );
			} )
			.catch( () => setNotFound( true ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- id is fixed for this page's lifetime (a new id means a new page load, not a re-render).
	}, [] );

	const handleSave = () => {
		setIsSaving( true );
		setSavedNotice( false );

		axios
			.patch< OrderDetail >(
				getApiLink( vulocartLocalizer, `orders/${ id }` ),
				{ status: statusValue },
				{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
			)
			.then( ( response ) => {
				setOrder( response.data );
				setIsSaving( false );
				setSavedNotice( true );
			} )
			.catch( () => setIsSaving( false ) );
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

						<h2>{ __( 'Items', 'vulocart' ) }</h2>
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
						</div>
					</div>

					<div className="vulocart-order-edit-side">
						<h2>{ __( 'Status', 'vulocart' ) }</h2>
						<FormGroupWrapperComponent>
							<FormGroupComponent label={ __( 'Order status', 'vulocart' ) } htmlFor="vulocart-order-status">
								<SelectInput
									name="status"
									type="single-select"
									options={ ORDER_STATUS_OPTIONS }
									value={ statusValue }
									onChange={ ( value ) => setStatusValue( value as string ) }
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
					</div>
				</div>
			</ColumnComponent>
		</ContainerComponent>
	);
}

export default OrderEdit;
