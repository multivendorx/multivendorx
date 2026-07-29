/* global vulocartLocalizer */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, FormGroupWrapperComponent, FormGroupComponent } from '@zyra/components';
import { TextInput, ButtonInput, SelectInput } from '@zyra/inputs';
import './orders-page.scss';

interface OfferingSummary {
	id: number;
	title: string;
	price: number | null;
	currency: string | null;
}

interface DraftLine {
	offering_id: number;
	title: string;
	quantity: number;
	unit_price: number | null;
	currency: string | null;
}

/**
 * The "Add New" order page (classes/Admin/Menu.php's `add_orders_menu()`
 * submenu) — an admin building an order on a customer's behalf (phone/
 * email order) with no cart involved. Picks from existing Offerings
 * (`GET /offerings`) rather than a free-text line item, since an order's
 * item still needs to reference a real Offering (Rest::create_manual_item(),
 * modules/Order/Application/OrderService.php's `create_manual_order()`).
 * Saves as a draft order (`FulfillmentStatus::DRAFT`) and redirects to
 * its edit page — same "create then land on the detail page" flow
 * OfferingEdit.tsx's Add path already uses.
 */
export function OrderAdd() {
	const [ offerings, setOfferings ] = useState< OfferingSummary[] >( [] );
	const [ selectedOfferingId, setSelectedOfferingId ] = useState< string >( '' );
	const [ lines, setLines ] = useState< DraftLine[] >( [] );
	const [ customerEmail, setCustomerEmail ] = useState( '' );
	const [ customerName, setCustomerName ] = useState( '' );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );

	useEffect( () => {
		axios
			.get< OfferingSummary[] >( getApiLink( vulocartLocalizer, 'offerings' ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
				params: { per_page: 100 },
			} )
			.then( ( response ) => setOfferings( response.data || [] ) );
	}, [] );

	const addLine = () => {
		const offering = offerings.find( ( item ) => String( item.id ) === selectedOfferingId );

		if ( ! offering ) {
			return;
		}

		setLines( ( current ) => {
			const existing = current.find( ( line ) => line.offering_id === offering.id );

			if ( existing ) {
				return current.map( ( line ) =>
					line.offering_id === offering.id ? { ...line, quantity: line.quantity + 1 } : line
				);
			}

			return [
				...current,
				{
					offering_id: offering.id,
					title: offering.title,
					quantity: 1,
					unit_price: offering.price,
					currency: offering.currency,
				},
			];
		} );
	};

	const updateQuantity = ( offeringId: number, quantity: number ) => {
		if ( quantity <= 0 ) {
			setLines( ( current ) => current.filter( ( line ) => line.offering_id !== offeringId ) );
			return;
		}

		setLines( ( current ) =>
			current.map( ( line ) => ( line.offering_id === offeringId ? { ...line, quantity } : line ) )
		);
	};

	const total = lines.reduce( ( sum, line ) => sum + ( line.unit_price ?? 0 ) * line.quantity, 0 );
	const currency = lines[ 0 ]?.currency ?? '';

	const handleSave = () => {
		if ( lines.length === 0 ) {
			setError( __( 'Add at least one item.', 'vulocart' ) );
			return;
		}

		setIsSaving( true );
		setError( null );

		axios
			.post(
				getApiLink( vulocartLocalizer, 'orders/manual' ),
				{
					items: lines.map( ( line ) => ( { offering_id: line.offering_id, quantity: line.quantity } ) ),
					customer_email: customerEmail || undefined,
					customer_name: customerName || undefined,
				},
				{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
			)
			.then( ( response ) => {
				window.location.href = `admin.php?page=vulocart-orders&action=edit&id=${ response.data.id }`;
			} )
			.catch( () => {
				setError( __( 'Could not create the order.', 'vulocart' ) );
				setIsSaving( false );
			} );
	};

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<a className="vulocart-back-link" href="admin.php?page=vulocart-orders">
					{ __( '← Back to Orders', 'vulocart' ) }
				</a>

				<h1 className="vulocart-edit-page-title">{ __( 'Add New Order', 'vulocart' ) }</h1>

				<div className="vulocart-order-edit-layout">
					<div className="vulocart-order-edit-main">
						<h2>{ __( 'Items', 'vulocart' ) }</h2>
						<FormGroupWrapperComponent>
							<FormGroupComponent label={ __( 'Offering', 'vulocart' ) } htmlFor="vulocart-order-add-offering">
								<SelectInput
									name="offering_id"
									type="single-select"
									options={ offerings.map( ( offering ) => ( {
										label: offering.title,
										value: String( offering.id ),
									} ) ) }
									value={ selectedOfferingId }
									onChange={ ( value ) => setSelectedOfferingId( value as string ) }
								/>
							</FormGroupComponent>
						</FormGroupWrapperComponent>
						<ButtonInput
							buttons={ [
								{ icon: 'plus', text: __( 'Add item', 'vulocart' ), onClick: addLine },
							] }
						/>

						<div className="vulocart-order-detail-items">
							{ lines.length === 0 && <p>{ __( 'No items added yet.', 'vulocart' ) }</p> }
							{ lines.map( ( line ) => (
								<div key={ line.offering_id } className="vulocart-order-detail-item">
									<span>{ line.title }</span>
									<div style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
										<button
											type="button"
											onClick={ () => updateQuantity( line.offering_id, line.quantity - 1 ) }
										>
											−
										</button>
										<span>{ line.quantity }</span>
										<button
											type="button"
											onClick={ () => updateQuantity( line.offering_id, line.quantity + 1 ) }
										>
											+
										</button>
										<span>
											{ ( ( line.unit_price ?? 0 ) * line.quantity ).toFixed( 2 ) } { line.currency }
										</span>
									</div>
								</div>
							) ) }
							{ lines.length > 0 && (
								<div className="vulocart-order-detail-total">
									<strong>{ __( 'Total', 'vulocart' ) }</strong>
									<strong>
										{ total.toFixed( 2 ) } { currency }
									</strong>
								</div>
							) }
						</div>
					</div>

					<div className="vulocart-order-edit-side">
						<h2>{ __( 'Customer', 'vulocart' ) }</h2>
						<FormGroupWrapperComponent>
							<FormGroupComponent label={ __( 'Email', 'vulocart' ) } htmlFor="vulocart-order-add-email">
								<TextInput
									name="customer_email"
									type="email"
									value={ customerEmail }
									onChange={ ( value ) => setCustomerEmail( value as string ) }
								/>
							</FormGroupComponent>
							<FormGroupComponent label={ __( 'Name', 'vulocart' ) } htmlFor="vulocart-order-add-name">
								<TextInput
									name="customer_name"
									type="text"
									value={ customerName }
									onChange={ ( value ) => setCustomerName( value as string ) }
								/>
							</FormGroupComponent>
						</FormGroupWrapperComponent>

						{ error && <p style={ { color: '#dc2626' } }>{ error }</p> }

						<ButtonInput
							buttons={ [
								{
									icon: 'save',
									text: isSaving ? __( 'Saving…', 'vulocart' ) : __( 'Save as draft', 'vulocart' ),
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

export default OrderAdd;
