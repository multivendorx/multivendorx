/* global vulocartLocalizer */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, NavigatorHeaderComponent } from '@zyra/components';
import { SelectInput } from '@zyra/inputs';
import './inventory-page.scss';

interface InventoryItem {
	id: number;
	title: string;
	type: string;
	sku: string | null;
	stock_management: boolean;
	stock_status: string;
	stock_quantity: number | null;
	low_stock: boolean;
}

const STOCK_STATUS_OPTIONS = [
	{ label: 'In stock', value: 'in_stock' },
	{ label: 'Out of stock', value: 'out_of_stock' },
	{ label: 'Backorder', value: 'backorder' },
];

/**
 * The Offerings menu's "Inventory" page — a specialized view over
 * offerings of a stock-trackable type (Inventory.php's own
 * `STOCK_TRACKED_TYPES`), with inline quantity/status editing. A plain
 * HTML table with real `<input>`/`<select>` cells rather than zyra's
 * `TableCard`'s own `onCellEdit`/`isEditable` — confirmed those don't
 * actually work in the current `@zyra/table` build
 * (`Table.tsx` hardcodes `isEditing: false` at the call site, so a cell
 * never actually enters edit mode regardless of config) — no sense
 * wiring a prop combination that's a no-op in the shared component.
 */
export function InventoryPage() {
	const [ items, setItems ] = useState< InventoryItem[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ search, setSearch ] = useState( '' );
	const [ savingId, setSavingId ] = useState< number | null >( null );
	const [ drafts, setDrafts ] = useState< Record< number, { quantity: string; status: string } > >( {} );

	const load = ( searchValue = search ) => {
		setIsLoading( true );
		axios
			.get< InventoryItem[] >( getApiLink( vulocartLocalizer, 'inventory' ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
				params: { search: searchValue, per_page: 100 },
			} )
			.then( ( response ) => {
				setItems( response.data );
				const nextDrafts: Record< number, { quantity: string; status: string } > = {};
				response.data.forEach( ( item ) => {
					nextDrafts[ item.id ] = {
						quantity: null === item.stock_quantity ? '' : String( item.stock_quantity ),
						status: item.stock_status,
					};
				} );
				setDrafts( nextDrafts );
			} )
			.finally( () => setIsLoading( false ) );
	};

	useEffect( () => load(), [] ); // eslint-disable-line react-hooks/exhaustive-deps -- load() reads `search` fresh each call; this effect is mount-only.

	const save = ( id: number ) => {
		const draft = drafts[ id ];

		if ( ! draft ) {
			return;
		}

		setSavingId( id );

		axios
			.patch< InventoryItem >(
				getApiLink( vulocartLocalizer, `inventory/${ id }` ),
				{
					stock_quantity: '' === draft.quantity ? null : Number( draft.quantity ),
					stock_status: draft.status,
				},
				{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
			)
			.then( ( response ) => {
				setItems( ( current ) => current.map( ( item ) => ( item.id === id ? response.data : item ) ) );
			} )
			.finally( () => setSavingId( null ) );
	};

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<NavigatorHeaderComponent
					headerIcon="store-inventory"
					headerTitle={ __( 'Inventory', 'vulocart' ) }
					headerDescription={ __(
						'Stock levels for every physical, rental, bundle, and gift card offering.',
						'vulocart'
					) }
				/>

				<input
					type="text"
					placeholder={ __( 'Search title or SKU…', 'vulocart' ) }
					value={ search }
					onChange={ ( event ) => setSearch( event.target.value ) }
					onKeyDown={ ( event ) => {
						if ( 'Enter' === event.key ) {
							load( search );
						}
					} }
					style={ { marginBottom: '16px', maxWidth: '320px', display: 'block' } }
				/>

				{ isLoading && <p>{ __( 'Loading…', 'vulocart' ) }</p> }
				{ ! isLoading && items.length === 0 && <p>{ __( 'No stock-tracked offerings yet.', 'vulocart' ) }</p> }

				{ ! isLoading && items.length > 0 && (
					<table className="vulocart-inventory-table">
						<thead>
							<tr>
								<th>{ __( 'Offering', 'vulocart' ) }</th>
								<th>{ __( 'SKU', 'vulocart' ) }</th>
								<th>{ __( 'Quantity', 'vulocart' ) }</th>
								<th>{ __( 'Status', 'vulocart' ) }</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{ items.map( ( item ) => (
								<tr key={ item.id } className={ item.low_stock ? 'is-low-stock' : '' }>
									<td>
										<a href={ `admin.php?page=vulocart-offerings&action=edit&id=${ item.id }` }>
											{ item.title }
										</a>
										{ item.low_stock && (
											<span className="vulocart-low-stock-badge">{ __( 'Low stock', 'vulocart' ) }</span>
										) }
									</td>
									<td>{ item.sku || '—' }</td>
									<td>
										<input
											type="number"
											min={ 0 }
											value={ drafts[ item.id ]?.quantity ?? '' }
											onChange={ ( event ) =>
												setDrafts( {
													...drafts,
													[ item.id ]: { ...drafts[ item.id ], quantity: event.target.value },
												} )
											}
											style={ { width: '80px' } }
										/>
									</td>
									<td>
										<SelectInput
											name={ `stock_status_${ item.id }` }
											type="single-select"
											options={ STOCK_STATUS_OPTIONS }
											value={ drafts[ item.id ]?.status ?? 'in_stock' }
											onChange={ ( value ) =>
												setDrafts( {
													...drafts,
													[ item.id ]: { ...drafts[ item.id ], status: value as string },
												} )
											}
										/>
									</td>
									<td>
										<button type="button" onClick={ () => save( item.id ) } disabled={ savingId === item.id }>
											{ savingId === item.id ? __( 'Saving…', 'vulocart' ) : __( 'Save', 'vulocart' ) }
										</button>
									</td>
								</tr>
							) ) }
						</tbody>
					</table>
				) }
			</ColumnComponent>
		</ContainerComponent>
	);
}

export default InventoryPage;
