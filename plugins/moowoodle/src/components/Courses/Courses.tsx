/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import ProPopup from '../Popup/Popup';
import { Table, getApiLink, TableCell } from 'zyra';
import Dialog from '@mui/material/Dialog';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import defaultImage from '../../assets/images/moowoodle-product-default.png';

// Define RealtimeFilter interface with explicit types
interface RealtimeFilter {
    name: string;
    render: (
        updateFilter: (key: string, value: string) => void,
        filterValue: string | undefined
    ) => React.ReactNode;
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
    moodle_url?: string;
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
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const bulkSelectRef = useRef<HTMLSelectElement>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [modalDetails, setModalDetails] = useState<string>('');

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
                setPageCount(Math.ceil(response.data / pagination.pageSize));
            })
            .catch(() => {
                setError(__('Failed to load total rows', 'moowoodle'));
            });
    }, []);

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);

    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        courseField = '',
        productField = '',
        catagoryField = '',
        searchAction = '',
        searchCourseField = ''
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'courses'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
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
            .catch(() => {
                setError(__('Failed to load courses', 'moowoodle'));
                setData([]);
            });
    }

    // Handle pagination and filter changes
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

    // Handle single row action
    const handleSingleAction = (
        actionName: string,
        courseId: number,
        moodleCourseId: number
    ) => {
        if (appLocalizer.khali_dabba) {
            setData(null);
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
                    requestData();
                })
                .catch(() => {
                    setError(__('Failed to perform action', 'moowoodle'));
                    setData([]);
                });
        } else {
            setOpenDialog(true);
        }
    };

    // Handle bulk action
    const handleBulkAction = () => {
        if (appLocalizer.khali_dabba) {
            if (!Object.keys(rowSelection).length) {
                setModalDetails('Select rows.');
                setOpenModal(true);
                return;
            }
            if (!bulkSelectRef.current?.value) {
                setModalDetails('Please select a action.');
                setOpenModal(true);
                return;
            }
            setData(null);
            axios({
                method: 'post',
                url: getApiLink(appLocalizer, 'courses'),
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: {
                    selected_action: bulkSelectRef.current?.value,
                    course_ids: Object.keys(rowSelection).map((index) => {
                        const row = data?.[parseInt(index)];
                        return {
                            course_id: row?.id,
                            moodle_course_id: row?.moodle_course_id,
                        };
                    }),
                },
            })
                .then(() => {
                    setModalDetails('');
                    setOpenModal(false);
                    requestData();
                    setRowSelection({});
                })
                .catch(() => {
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
                    <img
                        src={row.original.productimage || defaultImage}
                        alt={row.original.course_name || 'Course Image'}
                    />
                    <div className="action-section">
                        <p>{row.original.course_name}</p>
                        <div className="action-btn">
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={row.original.moodle_url}
                                className=""
                            >
                                Edit course
                            </a>
                        </div>
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
                    <a
                        href={row.original.category_url}
                        title={row.original.category_name}
                    >
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
                    {row.original.products &&
                    Object.keys(row.original.products).length
                        ? Object.entries(row.original.products).map(
                              ([name, url], index) => (
                                  <div key={index} className="action-section">
                                      <p>{name}</p>
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
                              )
                          )
                        : '-'}
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
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={row.original.view_users_url}
                                className=""
                            >
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
                    {!appLocalizer.khali_dabba && (
                        <span className="admin-pro-tag">pro</span>
                    )}
                </div>
            ),
            cell: ({ row }) => (
                <div className="action-icons">
                    <i
                        className="adminlib-refresh"
                        title="Sync course data"
                        onClick={() => {
                            handleSingleAction(
                                'sync_courses',
                                row.original.id!,
                                row.original.moodle_course_id!
                            );
                        }}
                    ></i>

                    {row.original.products &&
                    Object.keys(row.original.products).length ? (
                        <i
                            className="adminlib-update-data"
                            title={__(
                                'Sync Course Data & Update Product',
                                'moowoodle'
                            )}
                            onClick={() => {
                                handleSingleAction(
                                    'update_product',
                                    row.original.id!,
                                    row.original.moodle_course_id!
                                );
                            }}
                        ></i>
                    ) : (
                        <i
                            className="adminlib-cloud-upload"
                            title={__('Create Product', 'moowoodle')}
                            onClick={() => {
                                handleSingleAction(
                                    'create_product',
                                    row.original.id!,
                                    row.original.moodle_course_id!
                                );
                            }}
                        ></i>
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
                    <select
                        className="basic-select"
                        name="action"
                        ref={bulkSelectRef}
                    >
                        <option value="">
                            {__('Bulk actions', 'moowoodle')}
                        </option>
                        <option value="sync_courses">
                            {__('Sync course', 'moowoodle')}
                        </option>
                        <option value="create_product">
                            {__('Create product', 'moowoodle')}
                        </option>
                        <option value="update_product">
                            {__('Update product', 'moowoodle')}
                        </option>
                    </select>
                    {!appLocalizer.khali_dabba && (
                        <span className="admin-pro-tag">pro</span>
                    )}
                    <button
                        name="bulk-action-apply"
                        className="admin-btn btn-purple"
                        onClick={handleBulkAction}
                    >
                        {__('Apply', 'moowoodle')}
                    </button>
                </div>
            ),
        },
        {
            name: 'catagoryField',
            render: (
                updateFilter: (key: string, value: string) => void,
                filterValue: string | undefined
            ) => (
                <div className="catagory-field">
                    <select
                        className="basic-select"
                        name="catagoryField"
                        onChange={(e) =>
                            updateFilter(e.target.name, e.target.value)
                        }
                        value={filterValue || ''}
                    >
                        <option value="">{__('Category', 'moowoodle')}</option>
                        {Object.entries(category).map(
                            ([categoryId, categoryName]) => (
                                <option key={categoryId} value={categoryId}>
                                    {categoryName}
                                </option>
                            )
                        )}
                    </select>
                </div>
            ),
        },
        {
            name: 'searchCourseField',
            render: (
                updateFilter: (key: string, value: string) => void,
                filterValue: string | undefined
            ) => (
                <div className="search-course-field">
                    <input
                        className="basic-input"
                        name="searchCourseField"
                        type="text"
                        placeholder={__('Search…', 'moowoodle')}
                        onChange={(e) =>
                            updateFilter(e.target.name, e.target.value)
                        }
                        value={filterValue || ''}
                    />
                </div>
            ),
        },
        {
            name: 'searchAction',
            render: (
                updateFilter: (key: string, value: string) => void,
                filterValue: string | undefined
            ) => (
                <div className="search-action">
                    <select
                        className="basic-select"
                        name="searchAction"
                        onChange={(e) =>
                            updateFilter(e.target.name, e.target.value)
                        }
                        value={filterValue || ''}
                    >
                        <option value="">{__('Select', 'moowoodle')}</option>
                        <option value="course">
                            {__('Course', 'moowoodle')}
                        </option>
                        <option value="shortname">
                            {__('Short name', 'moowoodle')}
                        </option>
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
                        className="admin-font adminlib-cross"
                        onClick={() => setOpenDialog(false)}
                    ></span>
                    <ProPopup />
                </Dialog>
            )}
            {openModal && modalDetails && (
                <div className="notice notice-error error-modal">
                    <div className="modal-wrapper">
                        <p>{modalDetails}</p>
                        <i
                            onClick={() => setOpenModal(false)}
                            className="admin-font adminLib-cross"
                        ></i>
                    </div>
                </div>
            )}
            <div className="admin-page-title">
                <p>{__('Courses', 'moowoodle')}</p>
            </div>
            {error && (
                <div className="admin-notice-display-title error">
                    <i className="admin-font adminlib-icon-no"></i>
                    {error}
                </div>
            )}
            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
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
        </>
    );
};

export default Course;
