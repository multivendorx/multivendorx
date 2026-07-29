/* global vulocartFrontendData */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { client } from '../shared/cart';
import { formatPrice, isVisibleInListing } from '../shared/offering';
import type { OfferingSummary } from '../shared/offering';

/**
 * The public catalog grid — `GET /offerings` (public, published-only for a
 * logged-out visitor, classes/RestAPI/Controllers/Offerings.php's own
 * docblock), filtered client-side to hide `catalog_visibility: 'hidden'/
 * 'search_only'` offerings (`isVisibleInListing()`). Each card links to
 * `?offering={id}` on this same page — `Offerings.tsx`'s own docblock
 * explains why that's the whole routing scheme, no page-picker needed.
 *
 * Gated on the Frontend tab's `enable_offerings_listing`
 * (`vulocartFrontendData.offeringsListingEnabled`) — the same flag
 * `src/blocks/checkout/Checkout.tsx`'s own "Available Offerings" section
 * already respects, so both surfaces turn off together.
 */
export function OfferingsListing() {
	const [ offerings, setOfferings ] = useState< OfferingSummary[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		if ( ! vulocartFrontendData.offeringsListingEnabled ) {
			setIsLoading( false );
			return;
		}

		client
			.get< OfferingSummary[] >( '/offerings', { params: { per_page: 100 } } )
			.then( ( response ) => setOfferings( response.data.filter( isVisibleInListing ) ) )
			.finally( () => setIsLoading( false ) );
	}, [] );

	if ( ! vulocartFrontendData.offeringsListingEnabled ) {
		return (
			<div style={ { border: '1px solid #d1d5db', borderRadius: '8px', padding: '20px' } }>
				<p>{ __( 'This catalog is currently unavailable.', 'vulocart' ) }</p>
			</div>
		);
	}

	if ( isLoading ) {
		return <p>{ __( 'Loading…', 'vulocart' ) }</p>;
	}

	if ( offerings.length === 0 ) {
		return <p>{ __( 'No offerings yet.', 'vulocart' ) }</p>;
	}

	const detailUrl = ( id: number ) => {
		const url = new URL( window.location.href );
		url.searchParams.set( 'offering', String( id ) );
		return url.toString();
	};

	return (
		<div
			style={ {
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
				gap: '20px',
			} }
		>
			{ offerings.map( ( offering ) => {
				const price = formatPrice( offering );
				const outOfStock = offering.meta?.stock_management && 'out_of_stock' === offering.meta?.stock_status;

				return (
					<a
						key={ offering.id }
						href={ detailUrl( offering.id ) }
						style={ {
							display: 'block',
							border: '1px solid #e5e7eb',
							borderRadius: '8px',
							overflow: 'hidden',
							textDecoration: 'none',
							color: 'inherit',
						} }
					>
						<div
							style={ {
								aspectRatio: '1 / 1',
								background: '#f3f4f6',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							} }
						>
							{ offering.meta?.featured_image?.url ? (
								<img
									src={ offering.meta.featured_image.url }
									alt={ offering.title }
									style={ { width: '100%', height: '100%', objectFit: 'cover' } }
								/>
							) : (
								<span style={ { color: '#9ca3af', fontSize: '13px' } }>
									{ __( 'No image', 'vulocart' ) }
								</span>
							) }
						</div>
						<div style={ { padding: '12px 14px' } }>
							<div
								style={ {
									fontSize: '11px',
									textTransform: 'uppercase',
									letterSpacing: '0.04em',
									color: '#6b7280',
									marginBottom: '4px',
								} }
							>
								{ offering.type }
							</div>
							<div style={ { fontWeight: 600, marginBottom: '4px' } }>{ offering.title }</div>
							<div style={ { fontSize: '14px', color: '#111827' } }>
								{ outOfStock ? (
									<span style={ { color: '#dc2626' } }>{ __( 'Out of stock', 'vulocart' ) }</span>
								) : (
									price ?? __( 'Price not set', 'vulocart' )
								) }
							</div>
						</div>
					</a>
				);
			} ) }
		</div>
	);
}
