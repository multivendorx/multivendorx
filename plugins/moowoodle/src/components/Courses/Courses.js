import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import ShowProPopup from '../Popup/Popup';
import LockedPreview from '../Popup/LockedPreview';
import { sampleCourses } from './CourseUtil';
import { applyFilters } from '@wordpress/hooks';
import { getApiLink } from '@zyra/core';
import { InformationItemComponent, PopupComponent, ContainerComponent, ColumnComponent, NavigatorHeaderComponent, } from '@zyra/components';
import { TableCard } from '@zyra/table';
const Course = () => {
    const [openPopup, setopenPopup] = useState(false);
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [category, setCategory] = useState([]);
    const [error, setError] = useState(null);
    const [rowIds, setRowIds] = useState([]);
    // True once an unfiltered first page comes back empty: nothing synced from Moodle™ yet, so the screen shows
    // sample courses and how to sync instead of an empty table. A search or filter with no match stays a table.
    const [hasNoCourses, setHasNoCourses] = useState(false);
    // Fetch categories on mount
    useEffect(() => {
        axios({
            method: 'get',
            url: getApiLink(appLocalizer, 'courses'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { options: true },
        })
            .then((response) => {
            setCategory(response.data.category || []);
        })
            .catch(() => {
            setError(__('Failed to load categories', 'moowoodle'));
        });
    }, []);
    // Define table headers
    const headers = {
        course_name: {
            label: __('Course', 'moowoodle'),
            width: '50%',
            render: (row) => (_jsx(InformationItemComponent, { title: row.course_name, titleLink: row.moodle_url, avatar: {
                    image: row.product_image,
                    iconClass: 'subscription-courses',
                }, badges: [
                    {
                        text: row.category_name,
                        className: 'yellow',
                    },
                    {
                        className: 'blue',
                        text: row.date,
                    },
                ], descriptions: [
                    {
                        label: __('Short name', 'moowoodle'),
                        value: row.course_short_name,
                    },
                ] })),
        },
        products: {
            label: __('Product', 'moowoodle'),
            render: (row) => (_jsx(_Fragment, { children: row.product_name ? (_jsxs(_Fragment, { children: [row.product_name, _jsx("a", { target: "_blank", rel: "noreferrer", href: row.product_url, className: "link-item edit-link", children: __('Edit product', 'moowoodle') })] })) : ('-') })),
        },
        enrolled_user: {
            label: __('Enrolled users', 'moowoodle'),
            render: (row) => (_jsxs(_Fragment, { children: [row.enrolled_user || 0, _jsx("a", { target: "_blank", rel: "noreferrer", href: row.view_users_url, className: "link-item edit-link", children: __('View users', 'moowoodle') })] })),
        },
        action: {
            type: 'action',
            label: __('Action', 'moowoodle'),
            actions: [
                {
                    label: __('Sync Course Data', 'moowoodle'),
                    icon: 'refresh',
                    onClick: (_row) => {
                        setopenPopup(true);
                    },
                },
                {
                    // Use a function that returns the label based on the row
                    label: (row) => {
                        return row?.product_name
                            ? __('Sync Course Data & Update Product', 'moowoodle')
                            : __('Create Product', 'moowoodle');
                    },
                    icon: (row) => {
                        return row?.product_name
                            ? 'update-product'
                            : 'add-product';
                    },
                    onClick: (_row) => {
                        setopenPopup(true);
                    },
                },
            ],
        },
    };
    // Define bulk actions
    const bulkActions = [
        { label: __('Sync course', 'moowoodle'), value: 'sync_courses' },
        { label: __('Create product', 'moowoodle'), value: 'create_product' },
        { label: __('Update product', 'moowoodle'), value: 'update_product' },
    ];
    // Define filters
    const filters = [
        {
            key: 'category',
            label: __('Select Category', 'moowoodle'),
            type: 'select',
            options: category,
        },
    ];
    const doRefreshTableData = (query) => {
        setIsLoading(true);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'courses'),
            headers: {
                'X-WP-Nonce': appLocalizer.nonce,
                withCredentials: true,
            },
            params: {
                page: query.paged || 1,
                row: query.per_page || 10,
                category: query.filter?.category || '',
                searchaction: query.searchAction || 'course',
                search: query.searchValue,
            },
        })
            .then((response) => {
            const items = response.data || [];
            const ids = items
                .filter((course) => course?.id != null)
                .map((course) => course.id);
            const isUnfiltered = !query.searchValue &&
                !query.filter?.category &&
                (query.paged || 1) === 1;
            setHasNoCourses(isUnfiltered && 0 === items.length);
            setRowIds(ids);
            setRows(items);
            setTotalRows(response.headers['x-wp-total'] || 0);
            setIsLoading(false);
        })
            .catch(() => {
            console.error('Failed to fetch courses');
            setError(__('Failed to load courses', 'moowoodle'));
            setRows([]);
            setTotalRows(0);
            setIsLoading(false);
        });
    };
    const defaultTableProps = {
        headers,
        rows,
        totalRows,
        isLoading,
        setIsLoading,
        onQueryUpdate: doRefreshTableData,
        ids: rowIds,
        search: {
            placeholder: __('Search...', 'moowoodle'),
            options: [
                { value: 'course', label: __('Course', 'moowoodle') },
                { value: 'shortname', label: __('Short name', 'moowoodle') },
            ],
        },
        filters: filters,
        bulkActions: bulkActions,
        onBulkActionApply: () => {
            setopenPopup(true);
        },
    };
    const tableProps = applyFilters('moowoodle_course_table_props', defaultTableProps);
    return (_jsxs(_Fragment, { children: [openPopup && (_jsx(PopupComponent, { position: "lightbox", open: openPopup, onClose: () => setopenPopup(false), width: 31.25, height: "auto", children: _jsx(ShowProPopup, {}) })), _jsx(NavigatorHeaderComponent, { headerIcon: "subscription-courses", headerDescription: __('Comprehensive course data is displayed here, including linked products, enrollment numbers, and related details.', 'moowoodle'), headerTitle: __('Courses', 'moowoodle') }), error && (_jsxs("div", { className: "admin-notice-display-title error", children: [_jsx("i", { className: "admin-font icon-no" }), error] })), _jsx(ContainerComponent, { general: true, children: _jsx(ColumnComponent, { children: hasNoCourses ? (_jsx(LockedPreview, { feature: {
                            title: __('Courses', 'moowoodle'),
                            description: __('Courses come from your Moodle™ site. Connect it, then sync to list every course here and sell it as a WooCommerce product.', 'moowoodle'),
                            icon: 'subscription-courses',
                        }, heading: __('No courses synced yet', 'moowoodle'), actions: _jsxs(_Fragment, { children: [_jsx("a", { className: "mw-locked-button", href: "#&tab=synchronization&subtab=synchronize-course", children: __('Sync courses', 'moowoodle') }), _jsx("a", { className: "mw-locked-link", href: "#&tab=settings&subtab=connection-access", children: __('Connect Moodle™', 'moowoodle') })] }), note: __('A preview with sample courses. Yours show here after the first sync.', 'moowoodle'), children: _jsx(TableCard, { headers: headers, rows: sampleCourses, totalRows: sampleCourses.length, ids: sampleCourses.map((course) => course.id), isLoading: false, search: defaultTableProps.search, bulkActions: bulkActions }) })) : (_jsx(TableCard, { ...tableProps })) }) })] }));
};
export default Course;
//# sourceMappingURL=Courses.js.map