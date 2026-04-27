/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
    getApiLink,
    Container,
    Column,
    TableCard,
    NavigatorHeader,
    CategoryCount,
    QueryProps,
    InfoItem,
} from 'zyra';
import defaultImage from '../../assets/images/moowoodle-product-default.png';

interface CourseRow {
    id?: number;
    moodle_course_id?: number;
    course_name?: string;
    moodle_url?: string;
    course_short_name?: string;
    category_name?: string;
    category_url?: string;
    date?: string;
    products?: Record<string, string>;
    enroled_user?: number;
    view_users_url?: string;
    productimage?: string;
    status?: string;
}

interface Category {
    [key: string]: string;
}

const Course: React.FC = () => {
    const [rows, setRows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [categoryCounts, setCategoryCounts] = useState<CategoryCount[] | null>(null);
    const [category, setCategory] = useState<Category>({});
    const [error, setError] = useState<string | null>(null);
    const [rowIds, setRowIds] = useState<number[]>([]);

    // Fetch categories on mount
    useEffect(() => {
        axios({
            method: 'get',
            url: getApiLink(appLocalizer, 'filters'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                setCategory(response.data.category || {});
            })
            .catch(() => {
                setError(__('Failed to load categories', 'moowoodle'));
            });
    }, []);

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'courses'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
            })
            .catch(() => {
                setError(__('Failed to load total rows', 'moowoodle'));
            });
    }, []);

    // bulk action
    const handleBulkAction = (action: string, selectedIds: number[]) => {
        if (!selectedIds.length) {
            return;
        }

        if (!action) {
            return;
        }
        const selectedCourses = rows
            .filter(row => selectedIds.includes(row.id))
            .map(row => ({
                course_id: row.id,
                moodle_course_id: row.moodle_course_id,
            }));

        if (selectedCourses.length === 0) {
            return;
        }

        setIsLoading(true);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'courses'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                selected_action: action,
                course_ids: selectedCourses,
            },
        })
            .then(() => {
                doRefreshTableData({});
            })
            .catch(() => {
                setError(__('Failed to perform bulk action', 'moowoodle'));
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // Handle single row action
    const handleSingleAction = (actionName: string, courseId: number, moodleCourseId: number) => {
        if (!appLocalizer.khali_dabba) {
            return;
        }

        setIsLoading(true);
        axios({
            method: 'post',
            url: getApiLink(appLocalizer, 'courses'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                selected_action: actionName,
                course_ids: [
                    {
                        course_id: courseId,
                        moodle_course_id: moodleCourseId,
                    },
                ],
            },
        })
            .then(() => {
                doRefreshTableData({});
            })
            .catch(() => {
                setError(__('Failed to perform action', 'moowoodle'));
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // Define table headers
    const headers = {
        course_name: {
            label: __('Course', 'moowoodle'),
            type: 'custom',
            render: (row: CourseRow) => (
                <InfoItem
                    title={row.course_name}
                    titleLink={row.moodle_url}
                    avatar={{
                        image: row.productimage,
                        iconClass: 'subscription-courses',
                    }}
                />
            ),
        },
        course_short_name: {
            label: __('Short name', 'moowoodle'),
        },
        category_name: {
            label: __('Category', 'moowoodle'),
        },
        date: {
            label: __('Course duration', 'moowoodle'),
        },
        products: {
            label: __('Product', 'moowoodle'),
            type: 'custom',
            render: (row: CourseRow) => (
                <>
                    {row.products && Object.keys(row.products).length
                        ? Object.entries(row.products).map(([name, url], index) => (
                            <div key={index} className="action-section">
                                <div>{name}</div>
                                <div className="action-btn">
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href={url}
                                        className=""
                                    >
                                        {__('Edit product', 'moowoodle')}
                                    </a>
                                </div>
                            </div>
                        ))
                        : '-'}
                </>
            ),
        },
        enroled_user: {
            label: __('Enrolled users', 'moowoodle'),
            type: 'custom',
            render: (row: CourseRow) => (
                <div className="action-section">
                    <div>{row.enroled_user || 0}</div>
                    <div className="action-btn">
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={row.view_users_url}
                            className=""
                        >
                            {__('View users', 'moowoodle')}
                        </a>
                    </div>
                </div>
            ),
        },
        action: {
            type: 'action',
            label: __('Action', 'moowoodle'),
            actions: [
                {
                    label: __('Sync Course Data', 'moowoodle'),
                    icon: 'refresh',
                    onClick: (row: CourseRow) => {
                        handleSingleAction('sync_courses', row.id!, row.moodle_course_id!);
                    },
                },
                {
                    // Use a function that returns the label based on the row
                    label: (row: CourseRow) => {
                        return row?.products && Object.keys(row.products).length
                            ? __('Sync Course Data & Update Product', 'moowoodle')
                            : __('Create Product', 'moowoodle');
                    },
                    icon: (row: CourseRow) => {
                        return row?.products && Object.keys(row.products).length
                            ? 'update-product'
                            : 'add-product';
                    },
                    onClick: (row: CourseRow) => {
                        handleSingleAction(
                            row.products && Object.keys(row.products).length
                                ? 'update_product'
                                : 'create_product',
                            row.id!,
                            row.moodle_course_id!
                        );
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
            key: 'catagory',
            label: __('Category', 'moowoodle'),
            type: 'select',
            options: [
                { value: '', label: __('All Categories', 'moowoodle') },
                ...Object.entries(category).map(([id, name]) => ({
                    value: id,
                    label: name,
                })),
            ],
        },
    ];

    // Search configuration
    const searchConfig = {
        fields: [
            {
                key: 'searchAction',
                type: 'select',
                options: [
                    { value: 'course', label: __('Course', 'moowoodle') },
                    { value: 'shortname', label: __('Short name', 'moowoodle') },
                ],
                placeholder: __('Search by...', 'moowoodle'),
            },
            {
                key: 'searchCourseField',
                type: 'text',
                placeholder: __('Search…', 'moowoodle'),
            },
        ],
    };

    const doRefreshTableData = (query: QueryProps) => {
        setIsLoading(true);

        // Determine which search field to use
        let searchField = '';
        let searchValue = '';

        if (query.searchValue) {
            // If searchValue is an object with multiple fields
            if (typeof query.searchValue === 'object') {
                searchField = query.searchValue.searchAction || 'course';
                searchValue = query.searchValue.searchCourseField || '';
            } else {
                searchField = 'course';
                searchValue = query.searchValue;
            }
        }

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
                catagory: query.filter?.catagory || '',
                searchaction: searchField,
                search: searchValue,
            },
        })
            .then((response) => {
                const items = response.data || [];
                const ids = items
                    .filter((course: CourseRow) => course?.id != null)
                    .map((course: CourseRow) => course.id);

                setRowIds(ids);
                setRows(items);
                setTotalRows(Number(response.headers['x-wp-total']) || 0);

                // Set category counts if available from headers
                setCategoryCounts([
                    {
                        value: 'all',
                        label: __('All', 'moowoodle'),
                        count: Number(response.headers['x-wp-total']) || 0,
                    },
                ]);

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

    return (
        <>
            <NavigatorHeader
                headerIcon="subscription-courses"
                headerDescription={__(
                    'Comprehensive course data is displayed here, including linked products, enrollment numbers, and related details.',
                    'moowoodle'
                )}
                headerTitle={__('Courses', 'moowoodle')}
            />

            {error && (
                <div className="admin-notice-display-title error">
                    <i className="admin-font icon-no"></i>
                    {error}
                </div>
            )}

            <Container general>
                <Column>
                    <TableCard
                        headers={headers}
                        rows={rows}
                        totalRows={totalRows}
                        isLoading={isLoading}
                        onQueryUpdate={doRefreshTableData}
                        ids={rowIds}
                        categoryCounts={categoryCounts}
                        search={searchConfig}
                        filters={filters}
                        bulkActions={bulkActions}
                        onBulkActionApply={(action: string, selectedIds: number[]) => {
                            handleBulkAction(action, selectedIds);
                        }}
                        format={appLocalizer.date_format}
                    />
                </Column>
            </Container>
        </>
    );
};

export default Course;