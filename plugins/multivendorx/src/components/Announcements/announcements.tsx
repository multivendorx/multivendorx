/* global appLocalizer */
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

import { Table, getApiLink, TableCell, AdminBreadcrumbs, BasicInput, TextArea, CommonPopup, SelectInput } from 'zyra';

import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import "./announcements.scss";

type StoreRow = {
    stores: any;
    date: any;
    title: string;
    content: string;
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: 'publish' | 'pending' | string;
};
type AnnouncementStatus = {
    key: string;
    name: string;
    count: number;
};

type FilterData = {
    searchField: string;
    typeCount?: any;
};

type AnnouncementForm = {
    title: string;
    url: string;
    content: string;
    stores: string;
};

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}

export const Announcements: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState<StoreRow[] | null>(null);
    const [addAnnouncements, setAddAnnouncements] = useState(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const dateRef = useRef<HTMLDivElement | null>(null);
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bulkSelectRef = useRef<HTMLSelectElement>(null);
    const [openModal, setOpenModal] = useState(false);
    const [modalDetails, setModalDetails] = useState<string>('');
    const [selectedRange, setSelectedRange] = useState([
        {
            startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
            key: 'selection',
        },
    ]);
    const [editId, setEditId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<AnnouncementForm>({
        title: '',
        url: '',
        content: '',
        stores: '',
    });
    const [announcementStatus, setAnnouncementStatus] = useState<AnnouncementStatus[] | null>(null);
    const [storeOptions, setStoreOptions] = useState<{ value: string; label: string }[]>([]);

    const handleCloseForm = () => {
        setAddAnnouncements(false);
        setFormData({ title: '', url: '', content: '', stores: '' }); // reset form
        setEditId(null); // reset edit mode
        setError(null); // clear any error
    };

    // Handle form input change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleBulkAction = async () => {
        const action = bulkSelectRef.current?.value;
        const selectedIds = Object.keys(rowSelection).map((key) => {
            const index = Number(key);
            return data && data[index] ? data[index].id : null;
        }).filter((id): id is number => id !== null);
    
        if (!selectedIds.length) {
            setModalDetails('Select rows.');
            setOpenModal(true);
            return;
        }
    
        if (!action) {
            setModalDetails('Please select an action.');
            setOpenModal(true);
            return;
        }
    
        setData(null);
    
        try {
            await axios({
                method: 'PUT',
                url: getApiLink(appLocalizer, 'knowledge'),
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: { bulk: true, action, ids: selectedIds },
            });
    
            requestData(pagination.pageSize, pagination.pageIndex + 1, page);
            setRowSelection({});
        } catch (err) {
            setError(__('Failed to perform bulk action', 'multivendorx'));
        }
    }; 

    const handleEdit = async (id: number) => {
        try {
            const response = await axios.get(
                getApiLink(appLocalizer, `announcement/${id}`),
                {
                    headers: { 'X-WP-Nonce': appLocalizer.nonce },
                }
            );

            if (response.data) {
                setFormData({
                    title: response.data.title || '',
                    url: response.data.url || '',
                    content: response.data.content || '',
                    stores: response.data.stores
                        ? response.data.stores.map((s: any) => s.id).join(',')
                        : '',
                });
                setEditId(id);
                setAddAnnouncements(true);
            }

        } catch (err) {
            setError(__('Failed to load announcement', 'multivendorx'));
        }
    };

    const handleSubmit = async (status: 'publish' | 'pending') => {
        if (submitting) return; // prevent double-click
        setSubmitting(true);

        try {
            const endpoint = editId
                ? getApiLink(appLocalizer, `announcement/${editId}`)
                : getApiLink(appLocalizer, 'announcement');
            const method = editId ? 'PUT' : 'POST';

            const payload = {
                ...formData, 
                status,
                stores: formData.stores ? formData.stores.split(',') : [],
            };

            const response = await axios({
                method,
                url: endpoint,
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: payload,
            });

            if (response.data.success) {
                setAddAnnouncements(false);
                setFormData({ title: '', url: '', content: '', stores: 'pending' });
                setEditId(null);
                requestData(pagination.pageSize, pagination.pageIndex + 1, page);
            } else {
                setError(__('Failed to save announcement', 'multivendorx'));
            }
        } catch (err) {
            setError(__('Failed to save announcement', 'multivendorx'));
        } finally {
            setSubmitting(false);
        }
    };


    const requestApiForData = ( rowsPerPage: number, currentPage: number, filterData: FilterData ) => {
        setData( null );
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
            filterData?.searchField,
        );
    };

    // Fetch data from backend
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        typeCount: string = '',
        searchField: string = ''
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
        .then((response) => {
            if (response.data && Array.isArray(response.data)) {
                const options = response.data.map((store: any) => ({
                    value: store.id.toString(),
                    label: store.store_name,
                }));
                setStoreOptions(options);
            }

        })
        .catch(() => {
            setError(__('Failed to load stores', 'multivendorx'));
        });
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'announcement'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                status: typeCount === 'all' ? '' : typeCount,
                s: searchField,
            },
        }).then((response) => {
            const res = response.data;
            setData(res.items);
            setPageCount(Math.ceil((res.total || 0) / rowsPerPage));
            setAnnouncementStatus([
                { key: 'all', name: 'All', count: res.all || 0 },
                { key: 'publish', name: 'Published', count: res.publish || 0 },
                { key: 'pending', name: 'Pending', count: res.pending || 0 },
            ]);
            setPage(typeCount == 'all' ? '' : typeCount);
        })
        .catch(() => {
            setError(__('Failed to load announcements', 'multivendorx'));
        });
    }

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'searchField',
            render: ( updateFilter, filterValue ) => (
                <>
                    <div className="admin-header-search-section search-section">
                        <input
                            name="searchField"
                            type="text"
                            className="basic-input"
                            placeholder={ __( 'Search', 'moowoodle-pro' ) }
                            onChange={ ( e ) => {
                                updateFilter( e.target.name, e.target.value );
                            } }
                            value={ filterValue || '' }
                        />
                    </div>
                </>
            ),
        },
    ];


    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestData(pagination.pageSize, currentPage, page);
    }, [pagination]);

    // Columns
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
            header: __('Title', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.title || ''}>
                    {row.original.title || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Content', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.content || ''}>
                    {row.original.content || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ''}>
                    {row.original.status ? row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1) : '-'}
                </TableCell>
            ),
        },
        {
            header: __('Sent To', 'multivendorx'),
            cell: ({ row }) => {
                const stores = Array.isArray(row.original.stores) ? row.original.stores : [];
                console.log(stores)
                let displayStores = stores;
        
                if (stores.length > 2) {
                    displayStores = [...stores.slice(0, 2), '...'];
                }
        
                return (
                    <TableCell title={stores.join(', ')}>
                        {displayStores.join(', ')}
                    </TableCell>
                );
            },
        },        
        {
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => {
                const rawDate = row.original.date;
                let formattedDate = '-';
                if (rawDate) {
                    const dateObj = new Date(rawDate);
                    formattedDate = new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }).format(dateObj);
                }
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            },
        },
    ];
    const BulkAction: React.FC = () => (
        <div className=" bulk-action">
            <select name="action" className="basic-select" ref={bulkSelectRef} onChange={handleBulkAction}>
                <option value="">{__('Bulk actions')}</option>
                <option value="publish">{__('Publish', 'multivendorx')}</option>
                <option value="pending">{__('Pending', 'multivendorx')}</option>
                <option value="delete">{__('Delete', 'multivendorx')}</option>
            </select>
        </div>
    );

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                description={'Central hub for managing marketplace announcements. Review past updates and create new ones to keep stores informed.'}
                tabTitle="Announcements"
                buttons={[
                    <div
                        className="admin-btn btn-purple"
                        onClick={() => setAddAnnouncements(true)}
                    >
                        <i className="adminlib-plus-circle-o"></i>
                        Add New
                    </div>,
                ]}
            />

            {addAnnouncements && (
                <CommonPopup
                    open={addAnnouncements}
                    onClose={handleCloseForm}
                    width="500px"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                {editId ? __('Edit Announcement', 'multivendorx') : __('Add Announcement', 'multivendorx')}
                            </div>
                            <p>Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.</p>
                            <i
                                onClick={handleCloseForm}
                                className="icon adminlib-close"
                            ></i>
                        </>
                    }
                    footer={
                        <>
                            <div
                                onClick={handleCloseForm}
                                className="admin-btn btn-red"
                            >
                                Cancel
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSubmit('publish')}
                                className="admin-btn btn-purple"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Publish'}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSubmit('pending')}
                                className="admin-btn btn-yellow"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Pending'}
                            </button>
                        </>
                    }
                >

                    <div className="content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <BasicInput
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="content">Enter Content</label>
                                <TextArea
                                    name="content"
                                    inputClass="textarea-input"
                                    value={formData.content}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group ">
                                <label htmlFor="stores">Stores</label>
                                <SelectInput
                                    name="stores"
                                    type="multi-select"
                                    options={storeOptions}
                                    value={formData.stores ? formData.stores.split(',') : []}
                                    onChange={(newValue: any) => {
                                        const selectedValues = Array.isArray(newValue)
                                            ? newValue.map((opt) => opt.value)
                                            : [];
                                        setFormData((prev) => ({
                                            ...prev,
                                            stores: selectedValues.join(','),
                                        }));
                                    }}
                                />
                            </div>
                            <span className="space"></span>
                        </div>
                    </div>

                    {error && <p className="error-text">{error}</p>}
                </CommonPopup>
            )}

            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    realtimeFilter={ realtimeFilter }
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    handlePagination={requestApiForData}
                    perPageOption={[10, 25, 50]}
                    typeCounts={announcementStatus as AnnouncementStatus[]}
                    onRowClick={(row: any) => {
                        handleEdit(row.id);
                    }}
                    bulkActionComp={() => <BulkAction />}
                />
            </div>
        </>
    );
};

export default Announcements;
