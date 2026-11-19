import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* global appLocalizer */
import React from 'react';
import { ColumnComponent, ContainerComponent, InformationItemComponent, NavigatorHeaderComponent, } from '@zyra/components';
import { TableCard } from '@zyra/table';
import { __ } from '@wordpress/i18n';
import LockedPreview from '../Popup/LockedPreview';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { applyFilters } from '@wordpress/hooks';
import { dummyEnrollments } from './EnrollmentUtil';
/** No-op handler for the sample rows' actions: LockedPreview makes the sample inert. */
const noop = () => undefined;
/** The sample rows drawn behind the unlock card: a few, as the preview fades out below them. */
const SAMPLE_ROWS = dummyEnrollments.slice(0, 4);
const Enrollment = () => {
    // Define table headers
    const headers = {
        learning_unit: {
            label: __('Learning Unit', 'moowoodle'),
            width: '50%',
            render: (row) => {
                let title = '';
                if (row.course_name) {
                    title = row.course_name;
                }
                else if (row.group_name) {
                    title = row.group_name;
                }
                else if (row.cohort_name) {
                    title = row.cohort_name;
                }
                return (_jsx(InformationItemComponent, { title: row.customer_name, avatar: {
                        iconClass: 'person',
                    }, badges: [
                        {
                            text: row.status,
                            className: `badge-${row.status}`,
                        },
                    ], descriptions: [
                        {
                            icon: 'subscription-courses',
                            label: __('Course', 'moowoodle'),
                            value: title,
                        },
                    ] }));
            },
        },
        enrollment_date: {
            label: __('Date', 'moowoodle'),
            render: (row) => {
                return (_jsx(_Fragment, { children: _jsxs("div", { className: "table-details", children: [_jsx("span", { className: "label", children: __('Enrollment Date', 'moowoodle') }), row.enrollment_date || '-'] }) }));
            },
        },
        action: {
            type: 'action',
            label: __('Action', 'moowoodle'),
            actions: [
                {
                    type: 'button',
                    label: (row) => {
                        return row.status === 'enrolled'
                            ? __('Unenroll Now', 'moowoodle')
                            : __('Enroll Now', 'moowoodle');
                    },
                    onClick: noop,
                    color: (row) => {
                        return row.status === 'enrolled'
                            ? __('text-red', 'moowoodle')
                            : __('text-purple', 'moowoodle');
                    },
                    icon: 'classroom-enrollment',
                },
            ],
        },
    };
    const defaultTableProps = {
        headers,
        hideHeader: true,
        rows: dummyEnrollments,
        totalRows: dummyEnrollments.length,
        search: {
            placeholder: __('Search...', 'moowoodle'),
            options: [
                {
                    value: 'name',
                    label: __('Name', 'moowoodle'),
                },
                {
                    value: 'email',
                    label: __('Email', 'moowoodle'),
                },
            ],
        },
    };
    const { props: tableProps, hasNoRecords } = useNoRecordsYet(applyFilters('moowoodle_enrollment_table_props', defaultTableProps
    // MooWoodle Pro's props add the confirm dialog it renders beside the table.
    ));
    /** The sample rows behind a card: for the Pro card (Pro off) and the "none yet" card (Pro on, nothing yet). */
    const sampleTable = (_jsx(TableCard, { ...defaultTableProps, rows: SAMPLE_ROWS, totalRows: SAMPLE_ROWS.length }));
    return (_jsxs(_Fragment, { children: [_jsx(NavigatorHeaderComponent, { headerIcon: "form", headerTitle: __('All Enrollments', 'moowoodle'), headerDescription: __('Enrollment records are presented, showing students, their courses, enrollment dates, and current status.', 'moowoodle') }), _jsx(ContainerComponent, { general: true, children: _jsx(ColumnComponent, { children: appLocalizer.khali_dabba ? (hasNoRecords ? (_jsx(LockedPreview, { feature: {
                            title: __('Enrollments', 'moowoodle'),
                            description: __('A student is enrolled in Moodle™ when they buy a course product. Link your courses to products, and every enrollment shows here.', 'moowoodle'),
                            icon: 'classroom-enrollment',
                        }, heading: __('No enrollments yet', 'moowoodle'), actions: _jsxs(_Fragment, { children: [_jsx("a", { className: "mw-locked-button", href: "#&tab=courses", children: __('Go to courses', 'moowoodle') }), _jsx("a", { className: "mw-locked-link", href: "#&tab=settings&subtab=course-enrollment", children: __('Enrollment settings', 'moowoodle') })] }), note: __('A preview with sample enrollments. Yours show here after the first purchase.', 'moowoodle'), children: sampleTable })) : (_jsxs(_Fragment, { children: [_jsx(TableCard, { ...tableProps }), tableProps.popup] }))) : (_jsx(LockedPreview, { feature: {
                            title: __('Enrollments', 'moowoodle'),
                            description: __('Every student enrollment in one place: enroll or unenroll students, by course, group or cohort.', 'moowoodle'),
                            icon: 'classroom-enrollment',
                        }, children: sampleTable })) }) })] }));
};
export default Enrollment;
//# sourceMappingURL=Enrollment.js.map