import { useEffect, useRef } from 'react';

interface Props {
	apiKey: string;
	salesData: Record<string, number>;
}

const CountrySalesMap = ({ apiKey, salesData }: Props) => {
	const mapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!window.mapboxgl || !mapRef.current) {
			return;
		}

		window.mapboxgl.accessToken = apiKey;

		const map = new window.mapboxgl.Map({
			container: mapRef.current,
			style: 'mapbox://styles/mapbox/light-v11',
			center: [0, 20],
			zoom: 1.2,
			attributionControl: false,
		});

		map.on('load', () => {
			// Add country boundary source
			map.addSource('countries', {
				type: 'vector',
				url: 'mapbox://mapbox.country-boundaries-v1',
			});

			map.addLayer({
				id: 'country-sales-layer',
				type: 'fill',
				source: 'countries',
				'source-layer': 'country_boundaries',
				paint: {
					'fill-color': [
						'interpolate',
						['linear'],
						['coalesce', ['get', 'sales'], 0],
						0,
						'#e3f2fd',
						30000,
						'#1565c0',
					],
					'fill-opacity': 0.85,
				},
			});
		});

		// Inject sales data
		map.on('mousemove', 'country-sales-layer', () => {
			map.getCanvas().style.cursor = 'pointer';
		});

		return () => map.remove();
	}, [apiKey]);

	return (
		<div
			ref={mapRef}
			style={{
				width: '100%',
				height: '400px',
				borderRadius: '8px',
				overflow: 'hidden',
			}}
		/>
	);
};

export default CountrySalesMap;
