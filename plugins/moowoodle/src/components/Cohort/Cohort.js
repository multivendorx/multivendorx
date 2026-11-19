import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { ColumnComponent, ContainerComponent, InformationItemComponent, NavigatorHeaderComponent, } from '@zyra/components';
import { TableCard } from '@zyra/table';
import LockedPreview from '../Popup/LockedPreview';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { applyFilters } from '@wordpress/hooks';
import { dummyCohorts } from './CohortUtil';
/** No-op handler for the sample rows' actions: LockedPreview makes the sample inert. */
const noop = () => undefined;
/** The sample rows drawn behind the unlock card: a few, as the preview fades out below them. */
const SAMPLE_ROWS = dummyCohorts.slice(0, 4);
const Cohort = () => {
    // Define table headers
    const headers = {
        cohort_name: {
            label: __('Cohorts', 'moowoodle'),
            render: (row) => (_jsx(InformationItemComponent, { title: row.cohort_name, titleLink: row.product_url, width: "75%", avatar: { iconClass: 'cohort' }, badges: [
                    {
                        className: 'blue',
                        text: `${row.enrolled_user || 0} Enrolled users`,
                    },
                ], descriptions: [
                    {
                        icon: 'single-product',
                        label: __('Product', 'moowoodle'),
                        value: row.product_name || '-',
                    },
                    {
                        icon: 'calendar',
                        label: __('Last sync', 'moowoodle'),
                        value: row.date || '-',
                    },
                ] })),
        },
        action: {
            type: 'action',
            label: __('Action', 'moowoodle'),
            actions: [
                {
                    label: __('Sync Cohort Data', 'moowoodle'),
                    icon: 'refresh',
                    onClick: noop,
                },
                {
                    label: (row) => {
                        return row?.products && Object.keys(row.products).length
                            ? __('Sync Cohort Data & Update Product', 'moowoodle')
                            : __('Create Product', 'moowoodle');
                    },
                    icon: (row) => {
                        return row?.products && Object.keys(row.products).length
                            ? 'update-product'
                            : 'add-product';
                    },
                    onClick: noop,
                },
            ],
        },
    };
    const defaultTableProps = {
        headers,
        hideHeader: true,
        rows: dummyCohorts,
        totalRows: dummyCohorts.length,
        search: {
            placeholder: __('Search...', 'moowoodle'),
        },
    };
    const { props: tableProps, hasNoRecords } = useNoRecordsYet(applyFilters('moowoodle_cohort_table_props', defaultTableProps));
    /** The sample rows behind a card: for the Pro card (Pro off) and the "none yet" card (Pro on, nothing yet). */
    const sampleTable = (_jsx(TableCard, { ...defaultTableProps, rows: SAMPLE_ROWS, totalRows: SAMPLE_ROWS.length }));
    return (_jsxs(_Fragment, { children: [_jsx(NavigatorHeaderComponent, { headerIcon: "cohort", headerDescription: __('Cohort information is presented with associated products and student enrollments to support administrative actions.', 'moowoodle'), headerTitle: __('Cohorts', 'moowoodle') }), _jsx(ContainerComponent, { general: true, children: _jsx(ColumnComponent, { children: appLocalizer.khali_dabba ? (hasNoRecords ? (_jsx(LockedPreview, { feature: {
                            title: __('Cohorts', 'moowoodle'),
                            description: __('Cohorts come from your Moodle™ site. Sync them to list every cohort here, link it to a product and enroll the whole cohort in one purchase.', 'moowoodle'),
                            icon: 'cohort',
                        }, heading: __('No cohorts synced yet', 'moowoodle'), actions: _jsxs(_Fragment, { children: [_jsx("a", { className: "mw-locked-button", href: "#&tab=synchronization&subtab=synchronize-cohort", children: __('Sync cohorts', 'moowoodle') }), _jsx("a", { className: "mw-locked-link", href: "#&tab=settings&subtab=connection-access", children: __('Connect Moodle™', 'moowoodle') })] }), note: __('A preview with sample cohorts. Yours show here after the first sync.', 'moowoodle'), children: sampleTable })) : (_jsx(TableCard, { ...tableProps }))) : (_jsx(LockedPreview, { feature: {
                            title: __('Cohorts', 'moowoodle'),
                            description: __('Sync Moodle™ cohorts, link them to products and enroll whole cohorts in one purchase.', 'moowoodle'),
                            icon: 'cohort',
                        }, children: sampleTable })) }) })] }));
};
export default Cohort;
//# sourceMappingURL=Cohort.js.map