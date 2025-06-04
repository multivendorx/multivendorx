import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import ProPopup from "../Popup/Popup";
import { Table, getApiLink, TableCell } from "zyra";
import './Courses.scss';
import Dialog from "@mui/material/Dialog";
import defaultImage from '../../assets/images/moowoodle-product-default.png';
import { ColumnDef, RowSelectionState, PaginationState } from "@tanstack/react-table";

// Define RealtimeFilter interface with explicit types
interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => React.ReactNode;
}

type FilterData = {
    searchField?: string;
    searchAction?: string;
    courseField?: string;
    productField?: string;
    catagoryField?: string;
    searchCourseField?: string;
};

type CourseRow = {
    id?: number;
    moodle_course_id?: number;
    course_name?: string;
    course_short_name?: string;
    category_name?: string;
    category_url?: string;
    date?: string;
    products?: Record<string, string>;
    enroled_user?: number;
    view_users_url?: string;
    productimage?: string;
};

type Category = {
    [key: string]: string;
};

const Course: React.FC = () => {
    const [data, setData] = useState<CourseRow[] | null>(null);
    const [category, setCategory] = useState<Category>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const bulkSelectRef = useRef<HTMLSelectElement>(null);
    const [openDialog, setOpenDialog] = useState(false);

    // Fetch categories on mount
    useEffect(() => {
        axios({
            method: "get",
            url: getApiLink(appLocalizer, 'all-filters'),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
        })
            .then((response) => {
                setCategory(response.data.category || {});
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
                setError(__('Failed to load categories', 'moowoodle'));
            });
    }, []);

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: "GET",
            url: getApiLink(appLocalizer, 'courses'),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil(response.data / pagination.pageSize));
            })
            .catch((error) => {
                console.error('Error fetching total rows:', error);
                setError(__('Failed to load total rows', 'moowoodle'));
            });
    }, []);

    // Fetch initial data
    useEffect(() => {
        requestData();
    }, []);

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);

    /**
     * Fetch data from backend
     */
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        courseField = '',
        productField = '',
        catagoryField = '',
        searchAction = '',
        searchCourseField = ''
    ) {
        setError(null);
        axios({
            method: "GET",
            url: getApiLink(appLocalizer, 'courses'),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                course: courseField,
                product: productField,
                catagory: catagoryField,
                searchaction: searchAction,
                search: searchCourseField,
            },
        })
            .then((response) => {
                setData(response.data || []);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(__('Failed to load courses', 'moowoodle'));
                setData([]);
            });
    }

    /**
     * Handle pagination and filter changes
     */
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
        filterData: FilterData
    ) => {
         if (
            Boolean(
                (
                    filterData as {
                        searchAction?: string;
                        searchCourseField?: string;
                    }
                )?.searchAction
            ) !==
            Boolean(
                (
                    filterData as {
                        searchAction?: string;
                        searchCourseField?: string;
                    }
                )?.searchCourseField
            )
        ) {
            return;
        }

        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.courseField,
            filterData?.productField,
            filterData?.catagoryField,
            filterData?.searchAction,
            filterData?.searchCourseField
        );
    };

    /**
     * Handle single row action
     */
    const handleSingleAction = (actionName: string, courseId: number, moodleCourseId: number) => {
        if (appLocalizer.khali_dabba) {
            setData(null);
            axios({
                method: 'post',
                url: getApiLink(appLocalizer, `course-bulk-action`),
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: {
                    selected_action: actionName,
                    course_ids: [{
                        course_id: courseId,
                        moodle_course_id: moodleCourseId,
                    }],
                },
            })
                .then((response) => {
                    requestData();
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setError(__('Failed to perform action', 'moowoodle'));
                    setData([]);
                });
        } else {
            setOpenDialog(true);
        }
    };

    /**
     * Handle bulk action
     */
    const handleBulkAction = () => {
        if (appLocalizer.khali_dabba) {
            if (!Object.keys(rowSelection).length) {
                return window.alert(__('Select rows', 'moowoodle'));
            }
            if (!bulkSelectRef.current?.value) {
                return window.alert(__('Select bulk action', 'moowoodle'));
            }
            setData(null);
            axios({
                method: 'post',
                url: getApiLink(appLocalizer, `course-bulk-action`),
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: {
                    selected_action: bulkSelectRef.current?.value,
                    course_ids: Object.keys(rowSelection).map((index) => {
                        const row = data?.[parseInt(index)];
                        return { course_id: row?.id, moodle_course_id: row?.moodle_course_id };
                    }),
                },
            })
                .then((response) => {
                    requestData();
                    setRowSelection({});
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setError(__('Failed to perform bulk action', 'moowoodle'));
                    setData([]);
                });
        } else {
            setOpenDialog(true);
        }
    };

    // Column definitions
    const columns: ColumnDef<CourseRow>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
        },
        {
            header: __('Course', 'moowoodle'),
            cell: ({ row }) => (
                <TableCell title={row.original.course_name || ''}>
                    <img src={row.original.productimage || defaultImage} alt={row.original.course_name || 'Course Image'} />
                    <div className="action-section">
                        <p>{row.original.course_name}</p>
                    </div>
                </TableCell>
            ),
        },
        {
            header: __('Short name', 'moowoodle'),
            cell: ({ row }) => (
                <TableCell title={row.original.course_short_name || ''}>
                    {row.original.course_short_name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Category', 'moowoodle'),
            cell: ({ row }) => (
                <TableCell title={__('Category Name')}>
                    <a href={row.original.category_url} title={row.original.category_name}>
                        {row.original.category_name || '-'}
                    </a>
                </TableCell>
            ),
        },
        {
            header: __('Course duration', 'moowoodle'),
            cell: ({ row }) => (
                <TableCell title={__('Date')}>
                    {row.original.date || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Product', 'moowoodle'),
            cell: ({ row }) => (
                <TableCell title={__('Product Name')}>
                    {row.original.products && Object.keys(row.original.products).length ? (
                        Object.entries(row.original.products).map(([name, url], index) => (
                            <div key={index} className="action-section">
                                <p>{name}</p>
                                <div className="action-btn">
                                    <a target="_blank" href={url} className="">
                                        {__('Edit product', 'moowoodle')}
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        '-'
                    )}
                </TableCell>
            ),
        },
        {
            header: __('Enrolled users', 'moowoodle'),
            cell: ({ row }) => (
                <TableCell title={__('Enrolled users')}>
                    <div className="action-section">
                        <p>{row.original.enroled_user || 0}</p>
                        <div className="action-btn">
                            <a target="_blank" href={row.original.view_users_url} className="">
                                {__('View users', 'moowoodle')}
                            </a>
                        </div>
                    </div>
                </TableCell>
            ),
        },
        {
            id: 'actions',
            header: () => (
                <div className="table-action-column">
                    {__('Action', 'moowoodle')}
                    {!appLocalizer.khali_dabba && <span className="admin-pro-tag">pro</span>}
                </div>
            ),
            cell: ({ row }) => (
                <div className="moowoodle-course-actions">
                    <button
                        className="sync-single-course button-primary"
                        title={__('Sync course data', 'moowoodle')}
                        onClick={() => {
                            handleSingleAction(
                                'sync_courses',
                                row.original.id!,
                                row.original.moodle_course_id!
                            );
                        }}
                    >
                        <i className="dashicons dashicons-update"></i>
                    </button>
                    {row.original.products && Object.keys(row.original.products).length ? (
                        <button
                            className="update-existed-single-product button-secondary"
                            title={__('Sync Course Data & Update Product', 'moowoodle')}
                            onClick={() => {
                                handleSingleAction(
                                    'update_product',
                                    row.original.id!,
                                    row.original.moodle_course_id!
                                );
                            }}
                        >
                            <i className="dashicons dashicons-admin-links"></i>
                        </button>
                    ) : (
                        <button
                            className="create-single-product button-secondary"
                            title={__('Create Product', 'moowoodle')}
                            onClick={() => {
                                handleSingleAction(
                                    'create_product',
                                    row.original.id!,
                                    row.original.moodle_course_id!
                                );
                            }}
                        >
                            <i className="dashicons dashicons-cloud-upload"></i>
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'bulk-action',
            render: () => (
                <div className="course-bulk-action bulk-action">
                    <select name="action" ref={bulkSelectRef}>
                        <option value="">{__('Bulk actions', 'moowoodle')}</option>
                        <option value="sync_courses">{__('Sync course', 'moowoodle')}</option>
                        <option value="create_product">{__('Create product', 'moowoodle')}</option>
                        <option value="update_product">{__('Update product', 'moowoodle')}</option>
                    </select>
                    {!appLocalizer.khali_dabba && <span className="admin-pro-tag">pro</span>}
                    <button name="bulk-action-apply" onClick={handleBulkAction}>
                        {__('Apply', 'moowoodle')}
                    </button>
                </div>
            ),
        },
        {
            name: 'catagoryField',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="admin-header-search-section catagoryField">
                    <select
                        name="catagoryField"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                    >
                        <option value="">{__('Category', 'moowoodle')}</option>
                        {Object.entries(category).map(([categoryId, categoryName]) => (
                            <option key={categoryId} value={categoryId}>
                                {categoryName}
                            </option>
                        ))}
                    </select>
                </div>
            ),
        },
        {
            name: 'searchCourseField',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="admin-header-search-section searchCourseField">
                    <input
                        name="searchCourseField"
                        type="text"
                        placeholder={__('Search...', 'moowoodle')}
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                    />
                </div>
            ),
        },
        {
            name: 'searchAction',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="admin-header-search-section searchAction">
                    <select
                        name="searchAction"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                    >
                        <option value="">{__('Select', 'moowoodle')}</option>
                        <option value="course">{__('Course', 'moowoodle')}</option>
                        <option value="shortname">{__('Short name', 'moowoodle')}</option>
                    </select>
                </div>
            ),
        },
    ];

    return (
        <>
            {openDialog && (
                <Dialog
                    className="admin-module-popup"
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminLib-cross stock-manager-popup-cross"
                        onClick={() => setOpenDialog(false)}
                    ></span>
                    <ProPopup />
                </Dialog>
            )}
            <div className="course-container-wrapper">
                <div className="admin-page-title">
                    <p>{__('Courses', 'moowoodle')}</p>
                </div>
                {error && (
                    <div className="admin-notice-display-title error">
                        <i className="admin-font adminLib-icon-no"></i>
                        {error}
                    </div>
                )}
                <div className="admin-table-wrapper">
                    <Table
                        data={data}
                        columns={
                            columns as ColumnDef<Record<string, any>, any>[]
                        }
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        realtimeFilter={realtimeFilter}
                        defaultRowsPerPage={10}
                        pageCount={pageCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        handlePagination={requestApiForData}
                        perPageOption={[10, 25, 50]}
                        typeCounts={[]}
                    />
                </div>
            </div>
        </>
    );
};

export default Course;