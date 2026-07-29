/* global vulocartLocalizer */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, NavigatorHeaderComponent } from '@zyra/components';
import { TableCard, TableRow, QueryProps, CategoryCount } from '@zyra/table';
import { downloadCSV } from '../../lib/utils';
import './orders-page.scss';

/**
 * The 6 statuses Order\Domain\FulfillmentStatus::all() declares
 * (modules/Order/Domain/FulfillmentStatus.php) — duplicated here the same
 * way OfferingEdit.tsx duplicates VuloCart\Domain\Offering\OfferingType's list
 * rather than fetching it: small, stable, hand-maintained.
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
 * Order\Domain\PaymentStatus::all() (modules/Order/Domain/PaymentStatus.php).
 */
const PAYMENT_STATUS_OPTIONS = [
	{ label: 'pending', value: 'pending' },
	{ label: 'paid', value: 'paid' },
	{ label: 'failed', value: 'failed' },
	{ label: 'refunded', value: 'refunded' },
];

interface OrdersListProps {
	/**
	 * `draft`/`refunds`, from the "Draft Orders"/"Refunds" submenus
	 * (classes/Admin/Menu.php's `add_orders_menu()`) — seeds the initial
	 * "saved view" tab rather than the user having to click it after the
	 * page loads.
	 */
	filter: string | null;
}

/**
 * Admin order list — `GET /orders` (modules/Order/Rest.php, manage_options-
 * gated) rendered on the same `NavigatorHeaderComponent` + `TableCard`
 * pattern this plugin's other admin screens use. "View" is a real
 * navigation to `admin.php?page=vulocart-orders&action=edit&id={id}`
 * (plain `<a href>`, full page load) rather than a popup — matching the
 * real WooCommerce order edit screen, per this plugin's admin-UX brief.
 * Orders.tsx is what routes between this component and OrderEdit.tsx/
 * OrderAdd.tsx based on the URL's `action`/`id`/`filter`.
 *
 * Payment Status and Fulfillment Status are two independent columns/
 * filters (PaymentStatus.php's/FulfillmentStatus.php's own docblocks
 * explain why an old single flat `status` couldn't render this way
 * honestly). The "saved view" tabs (TableCard's `categoryCounts`) use
 * real per-status counts from `GET /orders`'s `X-WP-Count-{status}`
 * response headers, not guessed/hardcoded numbers.
 */
export function OrdersList( { filter }: OrdersListProps ) {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ rowIds, setRowIds ] = useState< number[] >( [] );
	const [ rows, setRows ] = useState< TableRow[] >( [] );
	const [ totalRows, setTotalRows ] = useState( 0 );
	const [ categoryCounts, setCategoryCounts ] = useState< CategoryCount[] >( [] );

	const buildQueryParams = ( query: QueryProps, includePagination: boolean = true ) => {
		const category = query.categoryFilter ?? ( 'draft' === filter ? 'draft' : 'refunds' === filter ? 'refunded' : 'all' );

		const params: Record< string, unknown > = {
			fulfillment_status:
				'all' === category || 'refunded' === category
					? query.filter?.fulfillment_status || ''
					: category,
			payment_status:
				'refunded' === category ? 'refunded' : query.filter?.payment_status || '',
			search: query.searchValue || '',
			date_from: query.filter?.created_at?.startDate
				? new Date( query.filter.created_at.startDate ).toISOString().slice( 0, 10 )
				: '',
			date_to: query.filter?.created_at?.endDate
				? new Date( query.filter.created_at.endDate ).toISOString().slice( 0, 10 )
				: '',
		};

		if ( includePagination ) {
			params.page = query.paged || 1;
			params.per_page = query.per_page || 20;
		}

		return params;
	};

	const doRefreshTableData = ( query: QueryProps ) => {
		setIsLoading( true );
		axios
			.get( getApiLink( vulocartLocalizer, 'orders' ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
				params: buildQueryParams( query ),
			} )
			.then( ( response ) => {
				const items: TableRow[] = response.data || [];

				setRowIds( items.map( ( item ) => Number( item.id ) ) );
				setRows( items );
				setTotalRows( Number( response.headers[ 'x-wp-total' ] ) || 0 );

				const total = Number( response.headers[ 'x-wp-total' ] ) || 0;
				const refunded = Number( response.headers[ 'x-wp-count-refunded' ] ) || 0;

				setCategoryCounts( [
					{ value: 'all', label: __( 'All', 'vulocart' ), count: total },
					...FULFILLMENT_STATUS_OPTIONS.map( ( option ) => ( {
						value: option.value,
						label: option.label,
						count: Number( response.headers[ `x-wp-count-${ option.value }` ] ) || 0,
					} ) ),
					{ value: 'refunded', label: __( 'Refunded', 'vulocart' ), count: refunded },
				] );

				setIsLoading( false );
			} )
			.catch( () => {
				setRows( [] );
				setTotalRows( 0 );
				setIsLoading( false );
			} );
	};

	const handleBulkAction = ( action: string, selectedIds: number[] ) => {
		if ( ! action || ! selectedIds.length ) {
			return;
		}

		const [ field, status ] = action.split( ':' );
		const endpoint = 'payment' === field ? 'orders/bulk-payment-status' : 'orders/bulk-fulfillment-status';

		axios
			.patch(
				getApiLink( vulocartLocalizer, endpoint ),
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
		item_count: {
			label: __( 'Items', 'vulocart' ),
			isNumeric: true,
			render: ( row?: TableRow ) => ( row?.item_count as number ) ?? 0,
		},
		payment_status: {
			label: __( 'Payment Status', 'vulocart' ),
			type: 'status' as const,
			statusClass: ( row: TableRow ) => `${ row.payment_status }`,
		},
		fulfillment_status: {
			label: __( 'Fulfillment Status', 'vulocart' ),
			type: 'status' as const,
			statusClass: ( row: TableRow ) => `${ row.fulfillment_status }`,
		},
		total: {
			label: __( 'Total', 'vulocart' ),
			isNumeric: true,
			render: ( row?: TableRow ) =>
				row?.total !== null && row?.total !== undefined ? `${ row.total } ${ row.currency ?? '' }` : '—',
		},
		created_at: {
			label: __( 'Created', 'vulocart' ),
			render: ( row?: TableRow ) => ( row?.created_at as string ) || '—',
		},
		actions: {
			label: __( 'Actions', 'vulocart' ),
			csvDisplay: false,
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

	const downloadSelectedCSV = ( selectedIds: number[] ) => {
		const selectedRows = rows.filter( ( row ) => selectedIds.includes( Number( row.id ) ) );
		downloadCSV( headers, selectedRows, `vulocart-orders-selected-${ new Date().toISOString().slice( 0, 10 ) }.csv` );
	};

	const downloadAllCSV = ( query: QueryProps ) => {
		axios
			.get( getApiLink( vulocartLocalizer, 'orders' ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
				params: { ...buildQueryParams( query, false ), per_page: 1000 },
			} )
			.then( ( response ) => {
				downloadCSV(
					headers,
					response.data || [],
					`vulocart-orders-${ new Date().toISOString().slice( 0, 10 ) }.csv`
				);
			} );
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
					buttons={ [
						{
							label: __( 'Add New', 'vulocart' ),
							icon: 'plus',
							color: '',
							onClick: () => {
								window.location.href = 'admin.php?page=vulocart-orders&action=add';
							},
						},
					] }
				/>

				<TableCard
					title={ __( 'Orders', 'vulocart' ) }
					headers={ headers }
					rows={ rows }
					totalRows={ totalRows }
					isLoading={ isLoading }
					onQueryUpdate={ doRefreshTableData }
					ids={ rowIds }
					categoryCounts={ categoryCounts }
					activeCategory={ 'draft' === filter ? 'draft' : 'refunds' === filter ? 'refunded' : 'all' }
					search={ {
						placeholder: __( 'Search order #, email, or name…', 'vulocart' ),
					} }
					filters={ [
						{
							key: 'fulfillment_status',
							label: __( 'Fulfillment status', 'vulocart' ),
							type: 'select',
							size: 4,
							options: FULFILLMENT_STATUS_OPTIONS,
						},
						{
							key: 'payment_status',
							label: __( 'Payment status', 'vulocart' ),
							type: 'select',
							size: 4,
							options: PAYMENT_STATUS_OPTIONS,
						},
						{
							key: 'created_at',
							label: __( 'Created date', 'vulocart' ),
							type: 'date',
							size: 4,
						},
					] }
					bulkActions={ [
						...FULFILLMENT_STATUS_OPTIONS.map( ( option ) => ( {
							label: __( 'Fulfillment:', 'vulocart' ) + ' ' + option.label,
							value: `fulfillment:${ option.value }`,
						} ) ),
						...PAYMENT_STATUS_OPTIONS.map( ( option ) => ( {
							label: __( 'Payment:', 'vulocart' ) + ' ' + option.label,
							value: `payment:${ option.value }`,
						} ) ),
					] }
					onBulkActionApply={ ( action: string, selectedIds: number[] ) =>
						handleBulkAction( action, selectedIds )
					}
					buttonActions={ [
						{
							label: __( 'Export CSV', 'vulocart' ),
							icon: 'download',
							onClickWithQuery: downloadAllCSV,
						},
					] }
					onSelectCsvDownloadApply={ downloadSelectedCSV }
				/>
			</ColumnComponent>
		</ContainerComponent>
	);
}

export default OrdersList;
