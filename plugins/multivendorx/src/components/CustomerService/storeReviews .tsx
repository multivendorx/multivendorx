/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, CommonPopup } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import image from "../../assets/images/email.png";
type StoreRow = {
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: string;
};

const StoreReviews: React.FC = () => {

    const [data, setData] = useState<StoreRow[] | null>(null);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [moreDetails, setMoreDetails] = useState(false);

    const toggleRow = (rowId: string) => {
        setExpandedRow(expandedRow === rowId ? null : rowId);
    };

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil(response.data / pagination.pageSize));
            })
            .catch(() => {
                setError(__('Failed to load total rows', 'multivendorx'));
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
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
            },
        })
            .then((response) => {
                setData(response.data || []);
            })
            .catch(() => {
                setError(__('Failed to load stores', 'multivendorx'));
                setData([]);
            });
    }

    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
    ) => {
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
        );
    };

    // Column definitions
    const columns: ColumnDef<StoreRow>[] = [
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
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_name || ''}>
                    {/* {row.original.store_name || '-'} */}
                    <div className="single-column">
                        <div className="image">
                            <img src={image} alt="" />
                        </div>
                        <div className="store-details">
                            <div className="details">
                                Welcome to <strong>Urban Trends</strong>, your one-stop shop for the latest in fashion.
                            </div>

                            <div className="sub-tag">
                                <div className="tag">
                                    <i className="adminlib-form-address"></i>
                                    <div className="text">Fast Shipping</div>
                                </div>
                                <div className="tag">
                                    <i className="adminlib-mail"></i>
                                    <div className="text">customer@gmail.com</div>
                                </div>
                                <div className="tag">
                                    <i className="adminlib-form-phone"></i>
                                    <div className="text">+91 32147998569</div>
                                </div>
                            </div>
                        </div>

                        {/* <strong>{row.original.store_name || '-'}</strong>
                        <br />
                        <small>ID: {row.original.id}</small> */}
                    </div>
                </TableCell>
            ),
        },
        {
            header: __('Store', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_name || ''}>
                    <div className="admin-badge green more-btn" onClick={(e) => {
                        setMoreDetails(true);
                    }}>More</div>
                </TableCell>
            ),
        },
        // {
        //     header: __('Action', 'multivendorx'),
        //     cell: ({ row }) => (
        //         <TableCell title="Action">
        //             <div className="action-section">
        //                 <ul>
        //                     <li
        //                         onClick={() =>
        //                             (window.location.href = `?page=multivendorx#&tab=stores&view&id=${row.original.id}`)
        //                         }
        //                     >
        //                         <i className="adminlib-eye"></i>
        //                         { __( 'View Store', 'multivendorx' ) }
        //                     </li>
        //                     <li
        //                         onClick={() =>
        //                             (window.location.href = `?page=multivendorx#&tab=stores&edit/${row.original.id}`)
        //                         }
        //                     >
        //                         <i className="adminlib-create"></i>
        //                         { __( 'Edit Store', 'multivendorx' ) }
        //                     </li>
        //                 </ul>
        //             </div>
        //         </TableCell>
        //     ),
        // }
    ];

    return (
        <>
            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    handlePagination={requestApiForData}
                    perPageOption={[10, 25, 50]}
                    typeCounts={[]}
                />
            </div>
            {moreDetails && (
                <CommonPopup
                    open={moreDetails}
                    onClose={() => setMoreDetails(false)}
                    width="500px"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                Welcome to Urban Trends, your one-stop shop
                            </div>
                            <p>Publish important news, updates, or alerts that appear directly in store dashboards,</p>
                            <i
                                // onClick={handleCloseForm}
                                className="icon adminlib-close"
                                onClick={(e) => {
                                    setMoreDetails(false);
                                }}
                            ></i>
                        </>
                    }
                    footer={
                        <>

                            <div className="admin-btn btn-red" onClick={(e) => {
                                setMoreDetails(false);
                            }}>Close</div>
                        </>
                    }
                >

                    <div className="content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Prioruty</label>
                                <div className="tag-wrapper">
                                    <div className="admin-badge red">Urgent</div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="title">Status</label>
                                <div className="tag-wrapper">
                                    <div className="admin-badge red">Urgent</div>
                                    <div className="admin-badge green">Urgent</div>
                                    <div className="admin-badge blue">Urgent</div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="title">category</label>
                                <div className="tag-wrapper">
                                    <div className="admin-badge red">Urgent</div>
                                    <div className="admin-badge green">Urgent</div>
                                    <div className="admin-badge yellow">Urgent</div>
                                    <div className="admin-badge blue">Urgent</div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="title">group</label>
                                <div className="tag-wrapper">
                                    <div className="admin-badge red">Urgent</div>
                                    <div className="admin-badge red">Urgent</div>
                                    <div className="admin-badge red">Urgent</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </CommonPopup>
            )
            }
        </>
    );
};

export default StoreReviews;
