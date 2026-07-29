/* global vulocartLocalizer */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, NavigatorHeaderComponent } from '@zyra/components';
import { TableCard, TableRow, QueryProps } from '@zyra/table';
import './offerings-page.scss';

/**
 * The listing half of Offerings — DB (vulocart_offerings) → WPDBOfferingRepository
 * → OfferingService → REST (`GET /offerings`) → this zyra `TableCard`. "Add
 * Offering" and per-row "Edit" are real navigations to
 * `admin.php?page=vulocart-offerings&action=add`/`...&action=edit&id={id}`
 * (plain `<a href>`, full page load) rather than a popup — matching
 * WooCommerce's real Products/Orders admin screens, per this plugin's
 * admin-UX brief ("when edit click this open to another page like
 * woocommerce orders edit page"). Offerings.tsx is what routes between
 * this component and OfferingEdit.tsx based on the URL's `action`/`id`.
 */
export function OfferingsList() {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ rowIds, setRowIds ] = useState< number[] >( [] );
	const [ rows, setRows ] = useState< TableRow[] >( [] );
	const [ totalRows, setTotalRows ] = useState( 0 );

	const doRefreshTableData = ( query: QueryProps ) => {
		setIsLoading( true );
		axios
			.get( getApiLink( vulocartLocalizer, 'offerings' ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
				params: {
					page: query.paged || 1,
					per_page: query.per_page || 20,
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

	const headers = {
		title: {
			label: __( 'Title', 'vulocart' ),
			isSortable: true,
			render: ( row?: TableRow ) =>
				row && (
					<a href={ `admin.php?page=vulocart-offerings&action=edit&id=${ row.id }` }>
						{ row.title as string }
					</a>
				),
		},
		type: {
			label: __( 'Type', 'vulocart' ),
		},
		sku: {
			label: __( 'SKU', 'vulocart' ),
			render: ( row?: TableRow ) => ( row?.sku as string ) || '—',
		},
		status: {
			label: __( 'Status', 'vulocart' ),
			type: 'status' as const,
			statusClass: ( row: TableRow ) => `${ row.status }`,
		},
		price: {
			label: __( 'Price', 'vulocart' ),
			isNumeric: true,
			render: ( row?: TableRow ) =>
				row?.price !== null && row?.price !== undefined
					? `${ row.price } ${ row.currency ?? '' }`
					: '—',
		},
		actions: {
			label: __( 'Actions', 'vulocart' ),
			render: ( row?: TableRow ) =>
				row && (
					<>
						<a
							className="vulocart-offering-edit-action"
							aria-label={ __( 'Edit offering', 'vulocart' ) }
							href={ `admin.php?page=vulocart-offerings&action=edit&id=${ row.id }` }
						>
							{ __( 'Edit', 'vulocart' ) }
						</a>
						{
							/**
							 * `vulocart_offering_row_actions` — the extension point
							 * vulocart-pro's Passport module registers into
							 * (modules/Passport/src/index.tsx), same "Pro extends Free
							 * via @wordpress/hooks filters" pattern react-frontend.md
							 * documents for the multivendorx family. Renders nothing
							 * when Passport isn't active.
							 */
							applyFilters( 'vulocart_offering_row_actions', null, row )
						}
					</>
				),
		},
	};

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<NavigatorHeaderComponent
					headerIcon="product"
					headerTitle={ __( 'Offerings', 'vulocart' ) }
					headerDescription={ __(
						'Manage every offering — physical, digital, or service-based — from one place.',
						'vulocart'
					) }
					buttons={ [
						{
							label: __( 'Add Offering', 'vulocart' ),
							icon: 'plus',
							color: '',
							onClick: () => {
								window.location.href = 'admin.php?page=vulocart-offerings&action=add';
							},
						},
					] }
				/>

				<TableCard
					title={ __( 'Offerings', 'vulocart' ) }
					headers={ headers }
					rows={ rows }
					totalRows={ totalRows }
					isLoading={ isLoading }
					onQueryUpdate={ doRefreshTableData }
					ids={ rowIds }
					search={ {} }
				/>
			</ColumnComponent>
		</ContainerComponent>
	);
}

export default OfferingsList;
