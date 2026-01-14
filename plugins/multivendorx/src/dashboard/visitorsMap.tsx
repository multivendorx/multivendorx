import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink } from 'zyra';
import {
    ComposableMap,
    Geographies,
    Geography,
} from 'react-simple-maps';

const GEO_URL =
    'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type MapStats = {
    [countryCode: string]: {
        hits_count: number;
    };
};

type VisitorMapResponse = {
    map_stats: MapStats;
    colors: Record<string, string>;
};

type VisitorsMapProps = {
    dateRange: {
        startDate: string;
        endDate: string;
    };
};

const VisitorsMap: React.FC<VisitorsMapProps> = ({ dateRange }) => {
    const [data, setData] = useState<VisitorMapResponse | null>(null);
    const [tooltip, setTooltip] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                visitorMap: true,
                id: appLocalizer.store_id,
                start_date: dateRange.startDate,
                end_date: dateRange.endDate,
            },
        })
            .then((response) => {
                setData(response.data);
                setLoading(false);
            });

    }, [dateRange]);

    const getCountryCode = (geo: any): string | null => {
        const name = geo?.properties?.name;
        if (!name) return null;
        return name.toLowerCase();
    };

    const handleMouseEnter = (geo: any) => {
        const code = getCountryCode(geo);
        if (!code || !data) return;

        const hits = data.map_stats[code]?.hits_count ?? 0;
        setTooltip(`${geo.properties.name} - ${hits} visitors`);
    };

    const tableRows = data
        ? Object.entries(data.map_stats)
            .map(([code, value]) => ({
                countryCode: code.toUpperCase(),
                visitors: value.hits_count,
            }))
            .sort((a, b) => b.visitors - a.visitors)
        : [];

    return (
        <>
            {!loading && data && (
                <div style={{ position: 'relative' }}>

                    {tooltip && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                background: '#5007aa',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                boxShadow: '0 0 4px rgba(0,0,0,0.25)',
                                fontSize: '12px',
                                pointerEvents: 'none',
                                zIndex: 10,
                            }}
                        >
                            {tooltip}
                        </div>
                    )}

                    <ComposableMap
                        projectionConfig={{ scale: 145 }}
                    >
                        <Geographies geography={GEO_URL}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const code = getCountryCode(geo);
                                    const fill =
                                        (code && data.colors[code]) ||
                                        '#a0a0a0';

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={fill}
                                            stroke="#fff"
                                            style={{
                                                default: { outline: 'none' },
                                                hover: {
                                                    fillOpacity: 0.7,
                                                    outline: 'none',
                                                },
                                            }}
                                            onMouseEnter={() =>
                                                handleMouseEnter(geo)
                                            }
                                            onMouseLeave={() =>
                                                setTooltip('')
                                            }
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ComposableMap>

                    {tableRows.length > 0 && (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr className="header">
                                        <td>Country</td>
                                        <td>Visitors</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableRows.map((row) => (
                                        <tr key={row.countryCode}>
                                            <td>{row.countryCode}</td>
                                            <td>{row.visitors}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default VisitorsMap;
