/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, AdminBreadcrumbs, BasicInput, TextArea } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import "./announcements.scss";
type StoreRow = {
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: string;
};

const Announcements: React.FC = () => {

    const [data, setData] = useState<StoreRow[] | null>(null);
    const [addAnnouncements, setAddAnnouncements] = useState(false);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);

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
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = (id: any) => {
        if (showDropdown === id) {
            setShowDropdown(false);
            return;
        }
        setShowDropdown(id);
    };
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
                    {row.original.store_name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Slug', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_slug || ''}>
                    {row.original.store_slug || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ''}>
                    {row.original.status || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title="Action">
                    <div className="action-section">
                        <div className="action-icons">
                            <i
                                className="adminlib-more-vertical"
                                onClick={() =>
                                    toggleDropdown(row.original.order_id)
                                }
                            ></i>
                            <div
                                className={`action-dropdown ${showDropdown === row.original.order_id
                                    ? 'show'
                                    : ''
                                    }`}
                            >
                                <ul>
                                    <li
                                        onClick={() =>
                                            (window.location.href = `?page=multivendorx#&tab=stores&view&id=${row.original.id}`)
                                        }
                                    >
                                        <i className="adminlib-eye"></i>
                                        {__('View Store', 'multivendorx')}
                                    </li>
                                    <li
                                        onClick={() =>
                                            (window.location.href = `?page=multivendorx#&tab=stores&edit/${row.original.id}`)
                                        }
                                    >
                                        <i className="adminlib-create"></i>
                                        {__('Edit Store', 'multivendorx')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </TableCell>
            ),
        }
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                tabTitle="Announcements"
                buttons={[
                    <div
                        className="admin-btn btn-purple"
                        onClick={() => setAddAnnouncements(true)}
                    >
                        <i className="adminlib-plus-circle-o"></i>
                        Add New
                    </div>
                ]}
            />

            {addAnnouncements && (
                <div className="right-popup">
                    <div className={`content-wrapper ${addAnnouncements ? "open" : ""}`}>
                        <div className="title-wrapper">
                                <div className="title">
                                    <i className="adminlib-cart"></i>
                                    Add Announcements
                                </div>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                                <i onClick={() => setAddAnnouncements(false)} className="icon adminlib-close"></i>
                            </div>
                            
                            <div className="content">
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Title</label>
                                        <BasicInput
                                            type="text"
                                            name="name"
                                            // value={formData.name}
                                            // onChange={handleChange}

                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Enter Url</label>
                                        <BasicInput
                                            type="text"
                                            name="name"
                                            // value={formData.name}
                                            // onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Enter Content</label>
                                        <TextArea
                                        name="description"
                                        inputClass="textarea-input"
                                        // value={formData.description}
                                        // onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Vendors</label>
                                        <TextArea
                                        name="description"
                                        inputClass="textarea-input"
                                        // value={formData.description}
                                        // onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        <div className="popup-footer">
                            <div onClick={() => setAddAnnouncements(false)} className="admin-btn btn-red">Cancel</div>
                            <a href="" className="admin-btn btn-purple">Submit</a>
                        </div>
                    </div>
                </div>
            )}
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
        </>
    );
};

export default Announcements;
