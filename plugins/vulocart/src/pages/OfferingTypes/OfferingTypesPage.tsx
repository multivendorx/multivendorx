/* global vulocartLocalizer */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, NavigatorHeaderComponent } from '@zyra/components';

interface OfferingTypeInfo {
	type: string;
	description: string;
	offering_count: number;
}

const humanize = ( type: string ): string =>
	type
		.split( '_' )
		.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
		.join( ' ' );

/**
 * The Offerings menu's "Offering Types" page — read-only, deliberately
 * (classes/RestAPI/Controllers/OfferingTypes.php's own docblock explains
 * why this isn't a type builder): the closed set of built-in types
 * (Domain\Offering\OfferingType), each with its real, live offering count.
 */
export function OfferingTypesPage() {
	const [ types, setTypes ] = useState< OfferingTypeInfo[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		axios
			.get< OfferingTypeInfo[] >( getApiLink( vulocartLocalizer, 'offering-types' ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			} )
			.then( ( response ) => setTypes( response.data ) )
			.finally( () => setIsLoading( false ) );
	}, [] );

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<NavigatorHeaderComponent
					headerIcon="variable"
					headerTitle={ __( 'Offering Types', 'vulocart' ) }
					headerDescription={ __(
						'The built-in offering types this plugin supports, and how many offerings currently use each one.',
						'vulocart'
					) }
				/>

				{ isLoading && <p>{ __( 'Loading…', 'vulocart' ) }</p> }

				{ ! isLoading && (
					<div
						style={ {
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
							gap: '16px',
						} }
					>
						{ types.map( ( info ) => (
							<div
								key={ info.type }
								style={ {
									border: '1px solid #e5e7eb',
									borderRadius: '8px',
									padding: '16px',
									background: '#fff',
								} }
							>
								<div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
									<strong>{ humanize( info.type ) }</strong>
									<span
										style={ {
											background: '#f3f4f6',
											borderRadius: '999px',
											padding: '2px 10px',
											fontSize: '12px',
											fontWeight: 600,
										} }
									>
										{ info.offering_count }
									</span>
								</div>
								<p style={ { color: '#6b7280', fontSize: '13px', margin: '8px 0 0' } }>{ info.description }</p>
							</div>
						) ) }
					</div>
				) }
			</ColumnComponent>
		</ContainerComponent>
	);
}

export default OfferingTypesPage;
