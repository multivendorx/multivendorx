/* global vulocartLocalizer */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, NavigatorHeaderComponent } from '@zyra/components';
import { TableCard, TableRow, QueryProps, CategoryCount } from '@zyra/table';

interface ReviewRow {
	id: number;
	offering_id: number;
	offering_title: string | null;
	customer_name: string | null;
	customer_email: string | null;
	rating: number;
	title: string | null;
	content: string | null;
	status: string;
	created_at: string;
}

const STATUS_OPTIONS = [
	{ label: 'pending', value: 'pending' },
	{ label: 'approved', value: 'approved' },
	{ label: 'rejected', value: 'rejected' },
];

/**
 * The Offerings menu's "Reviews" admin page — moderation queue for
 * customer reviews (`GET/PATCH/DELETE /reviews`, admin-only;
 * `POST /reviews` — submission — is public, not used from this page).
 * Same `TableCard` + real per-status `categoryCounts` pattern
 * `src/pages/Orders/OrdersList.tsx` already establishes.
 */
export function ReviewsPage() {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ rowIds, setRowIds ] = useState< number[] >( [] );
	const [ rows, setRows ] = useState< TableRow[] >( [] );
	const [ totalRows, setTotalRows ] = useState( 0 );
	const [ categoryCounts, setCategoryCounts ] = useState< CategoryCount[] >( [] );

	const doRefreshTableData = ( query: QueryProps ) => {
		setIsLoading( true );
		axios
			.get( getApiLink( vulocartLocalizer, 'reviews' ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
				params: {
					page: query.paged || 1,
					per_page: query.per_page || 20,
					status: 'all' === query.categoryFilter || ! query.categoryFilter ? '' : query.categoryFilter,
				},
			} )
			.then( ( response ) => {
				const items: TableRow[] = response.data || [];

				setRowIds( items.map( ( item ) => Number( item.id ) ) );
				setRows( items );
				setTotalRows( Number( response.headers[ 'x-wp-total' ] ) || 0 );

				setCategoryCounts( [
					{ value: 'all', label: __( 'All', 'vulocart' ), count: Number( response.headers[ 'x-wp-total' ] ) || 0 },
					...STATUS_OPTIONS.map( ( option ) => ( {
						value: option.value,
						label: option.label,
						count: Number( response.headers[ `x-wp-count-${ option.value }` ] ) || 0,
					} ) ),
				] );

				setIsLoading( false );
			} )
			.catch( () => {
				setRows( [] );
				setTotalRows( 0 );
				setIsLoading( false );
			} );
	};

	const moderate = ( id: number, status: string ) => {
		axios
			.patch(
				getApiLink( vulocartLocalizer, `reviews/${ id }` ),
				{ status },
				{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
			)
			.then( () => doRefreshTableData( {} ) );
	};

	const remove = ( id: number ) => {
		if ( ! window.confirm( __( 'Delete this review? This cannot be undone.', 'vulocart' ) ) ) {
			return;
		}

		axios
			.delete( getApiLink( vulocartLocalizer, `reviews/${ id }` ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			} )
			.then( () => doRefreshTableData( {} ) );
	};

	const headers = {
		offering_title: {
			label: __( 'Offering', 'vulocart' ),
			render: ( row?: TableRow ) =>
				row && (
					<a href={ `admin.php?page=vulocart-offerings&action=edit&id=${ row.offering_id }` }>
						{ ( row.offering_title as string ) || __( '(deleted offering)', 'vulocart' ) }
					</a>
				),
		},
		rating: {
			label: __( 'Rating', 'vulocart' ),
			render: ( row?: TableRow ) => '★'.repeat( ( row?.rating as number ) || 0 ) + '☆'.repeat( 5 - ( ( row?.rating as number ) || 0 ) ),
		},
		title: {
			label: __( 'Review', 'vulocart' ),
			render: ( row?: TableRow ) => (
				<div>
					{ row?.title ? <strong>{ row.title as string }</strong> : null }
					<div style={ { fontSize: '12px', color: '#6b7280' } }>{ ( row?.content as string )?.slice( 0, 120 ) }</div>
				</div>
			),
		},
		customer_name: {
			label: __( 'From', 'vulocart' ),
			render: ( row?: TableRow ) => ( row?.customer_name as string ) || ( row?.customer_email as string ) || __( 'Anonymous', 'vulocart' ),
		},
		status: {
			label: __( 'Status', 'vulocart' ),
			type: 'status' as const,
			statusClass: ( row: TableRow ) => `${ row.status }`,
		},
		created_at: {
			label: __( 'Submitted', 'vulocart' ),
			render: ( row?: TableRow ) => ( row?.created_at as string ) || '—',
		},
		actions: {
			label: __( 'Actions', 'vulocart' ),
			render: ( row?: TableRow ) =>
				row && (
					<div style={ { display: 'flex', gap: '8px' } }>
						{ 'approved' !== row.status && (
							<a
								href="#approve"
								onClick={ ( event ) => {
									event.preventDefault();
									moderate( row.id as number, 'approved' );
								} }
							>
								{ __( 'Approve', 'vulocart' ) }
							</a>
						) }
						{ 'rejected' !== row.status && (
							<a
								href="#reject"
								onClick={ ( event ) => {
									event.preventDefault();
									moderate( row.id as number, 'rejected' );
								} }
							>
								{ __( 'Reject', 'vulocart' ) }
							</a>
						) }
						<a
							href="#delete"
							onClick={ ( event ) => {
								event.preventDefault();
								remove( row.id as number );
							} }
						>
							{ __( 'Delete', 'vulocart' ) }
						</a>
					</div>
				),
		},
	};

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<NavigatorHeaderComponent
					headerIcon="review"
					headerTitle={ __( 'Reviews', 'vulocart' ) }
					headerDescription={ __( 'Customer ratings and comments on your offerings — approve or reject before they show on the storefront.', 'vulocart' ) }
				/>

				<TableCard
					title={ __( 'Reviews', 'vulocart' ) }
					headers={ headers }
					rows={ rows }
					totalRows={ totalRows }
					isLoading={ isLoading }
					onQueryUpdate={ doRefreshTableData }
					ids={ rowIds }
					categoryCounts={ categoryCounts }
				/>
			</ColumnComponent>
		</ContainerComponent>
	);
}

export default ReviewsPage;
