/* global vulocartLocalizer */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ContainerComponent, ColumnComponent, CardComponent } from '@zyra/components';
import { getApiLink, getApiResponse } from '@zyra/core';

/**
 * A real, modest dashboard rather than `multivendorx/src/components/
 * AdminDashboard/AdminDashboard.tsx`'s full parity — that page's actual
 * content (DashboardTab) is built entirely around marketplace data
 * (stores/commissions/orders) VuloCart has no equivalent of yet. Same
 * `ContainerComponent`/`ColumnComponent` layout, `CardComponent` for
 * each stat, but showing genuinely available data instead of fabricated
 * widgets — total offering count (`GET /offerings`'s `X-WP-Total` header,
 * already returned by Controllers\Offerings::get_items()) and active module
 * count (the now-fixed `GET /modules`, a flat active-id array).
 */
const Dashboard = () => {
	const [ offeringCount, setOfferingCount ] = useState< number | null >( null );
	const [ activeModuleCount, setActiveModuleCount ] = useState< number | null >( null );

	useEffect( () => {
		fetch( getApiLink( vulocartLocalizer, 'offerings' ), {
			headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
		} ).then( ( response ) => {
			setOfferingCount( Number( response.headers.get( 'X-WP-Total' ) ?? 0 ) );
		} );

		getApiResponse< string[] >(
			getApiLink( vulocartLocalizer, 'modules' ),
			{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
		).then( ( response ) => {
			setActiveModuleCount( Array.isArray( response ) ? response.length : 0 );
		} );
	}, [] );

	return (
		<ContainerComponent>
			<ColumnComponent>
				<CardComponent title={ __( 'Total Offerings', 'vulocart' ) }>
					<p className="vulocart-stat">
						{ offeringCount === null ? '—' : offeringCount }
					</p>
				</CardComponent>
			</ColumnComponent>
			<ColumnComponent>
				<CardComponent title={ __( 'Active Modules', 'vulocart' ) }>
					<p className="vulocart-stat">
						{ activeModuleCount === null ? '—' : activeModuleCount }
					</p>
				</CardComponent>
			</ColumnComponent>
		</ContainerComponent>
	);
};

export default Dashboard;
