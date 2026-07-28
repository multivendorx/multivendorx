/* global vulocartLocalizer */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, NavigatorHeaderComponent } from '@zyra/components';
import { TableCard, TableRow, QueryProps } from '@zyra/table';
import './orders-page.scss';

/**
 * The 5 statuses Order\Domain\OrderStatus::all() declares
 * (modules/Order/Domain/OrderStatus.php) — duplicated here the same way
 * OfferingEdit.tsx duplicates VuloCart\Domain\Asset\AssetType's list
 * rather than fetching it: small, stable, hand-maintained.
 */
const ORDER_STATUS_OPTIONS = [
	{ label: 'pending', value: 'pending' },
	{ label: 'processing', value: 'processing' },
	{ label: 'completed', value: 'completed' },
	{ label: 'cancelled', value: 'cancelled' },
	{ label: 'refunded', value: 'refunded' },
];

/**
 * Admin order list — `GET /orders` (modules/Order/Rest.php, manage_options-
 * gated) rendered on the same `NavigatorHeaderComponent` + `TableCard`
 * pattern this plugin's other admin screens use. "View" is a real
 * navigation to `admin.php?page=vulocart-orders&action=edit&id={id}`
 * (plain `<a href>`, full page load) rather than a popup — matching the
 * real WooCommerce order edit screen, per this plugin's admin-UX brief.
 * Orders.tsx is what routes between this component and OrderEdit.tsx
 * based on the URL's `action`/`id`.
 */
export function OrdersList() {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ rowIds, setRowIds ] = useState< number[] >( [] );
	const [ rows, setRows ] = useState< TableRow[] >( [] );
	const [ totalRows, setTotalRows ] = useState( 0 );

	const doRefreshTableData = ( query: QueryProps ) => {
		setIsLoading( true );
		axios
			.get( getApiLink( vulocartLocalizer, 'orders' ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
				params: {
					page: query.paged || 1,
					per_page: query.per_page || 20,
					status: query.filter?.status || '',
					search: query.searchValue || '',
				},
			} )
			.then( ( response ) => {
				const items: TableRow[] = response.data || [];

				setRowIds( items.map( ( item ) => Number( item.id ) ) );
				setRows( items );
				setTotalRows( Number( response.headers[ 'x-wp-total' ] ) || 0 );
				setIsLoading( false );
			} )
			.catch( () => {
				setRows( [] );
				setTotalRows( 0 );
				setIsLoading( false );
			} );
	};

	const handleBulkStatusApply = ( status: string, selectedIds: number[] ) => {
		if ( ! status || ! selectedIds.length ) {
			return;
		}

		axios
			.patch(
				getApiLink( vulocartLocalizer, 'orders/bulk-status' ),
				{ ids: selectedIds, status },
				{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
			)
			.then( () => doRefreshTableData( {} ) );
	};

	const headers = {
		order_number: {
			label: __( 'Order', 'vulocart' ),
			isSortable: true,
			render: ( row?: TableRow ) =>
				row && (
					<a href={ `admin.php?page=vulocart-orders&action=edit&id=${ row.id }` }>
						{ row.order_number as string }
					</a>
				),
		},
		customer_email: {
			label: __( 'Customer', 'vulocart' ),
			render: ( row?: TableRow ) => ( row?.customer_name as string ) || ( row?.customer_email as string ) || '—',
		},
		status: {
			label: __( 'Status', 'vulocart' ),
			type: 'status' as const,
			statusClass: ( row: TableRow ) => `${ row.status }`,
		},
		total: {
			label: __( 'Total', 'vulocart' ),
			isNumeric: true,
			render: ( row?: TableRow ) =>
				row?.total !== null && row?.total !== undefined ? `${ row.total } ${ row.currency ?? '' }` : '—',
		},
		created_at: {
			label: __( 'Placed', 'vulocart' ),
			render: ( row?: TableRow ) => ( row?.created_at as string ) || '—',
		},
		actions: {
			label: __( 'Actions', 'vulocart' ),
			render: ( row?: TableRow ) =>
				row && (
					<a
						className="vulocart-order-status-action"
						aria-label={ __( 'View order', 'vulocart' ) }
						href={ `admin.php?page=vulocart-orders&action=edit&id=${ row.id }` }
					>
						{ __( 'View', 'vulocart' ) }
					</a>
				),
		},
	};

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<NavigatorHeaderComponent
					headerIcon="cart"
					headerTitle={ __( 'Orders', 'vulocart' ) }
					headerDescription={ __(
						'Every order placed through the storefront checkout — update status as you fulfil, cancel, or refund each one.',
						'vulocart'
					) }
					buttons={ [] }
				/>

				<TableCard
					title={ __( 'Orders', 'vulocart' ) }
					headers={ headers }
					rows={ rows }
					totalRows={ totalRows }
					isLoading={ isLoading }
					onQueryUpdate={ doRefreshTableData }
					ids={ rowIds }
					search={ {
						placeholder: __( 'Search order #, email, or name…', 'vulocart' ),
					} }
					filters={ [
						{
							key: 'status',
							label: __( 'Status', 'vulocart' ),
							options: ORDER_STATUS_OPTIONS,
						},
					] }
					bulkActions={ ORDER_STATUS_OPTIONS.map( ( option ) => ( {
						label: __( 'Set status:', 'vulocart' ) + ' ' + option.label,
						value: option.value,
					} ) ) }
					onBulkActionApply={ ( action: string, selectedIds: number[] ) =>
						handleBulkStatusApply( action, selectedIds )
					}
				/>
			</ColumnComponent>
		</ContainerComponent>
	);
}

export default OrdersList;
