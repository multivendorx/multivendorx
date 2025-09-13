/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
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

type AnnouncementForm = {
    title: string;
    url: string;
    content: string;
    stores: string; // ✅ renamed vendors → stores
};

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}
const bulkActionOptions = [
    { value: '', label: __('Bulk actions', 'multivendorx') },
    { value: 'publish', label: __('Publish', 'multivendorx') },
    { value: 'pending', label: __('Pending', 'multivendorx') },
    { value: 'delete', label: __('Delete', 'multivendorx') },
];
const Announcements: React.FC = () => {
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
                        ? response.data.stores.map((s: any) => s.id).join(',') // ✅ store IDs in CSV
                        : '',
                });
                setEditId(id);
                setAddAnnouncements(true);
            }

        } catch (err) {
            setError(__('Failed to load announcement', 'multivendorx'));
        }
    };

    const handleSubmit = async () => {
        if (submitting) return; // prevent double-click

        try {
            setSubmitting(true);
            const endpoint = editId
                ? getApiLink(appLocalizer, `announcement/${editId}`)
                : getApiLink(appLocalizer, 'announcement');
            const method = editId ? 'PUT' : 'POST';

            const payload = {
                ...formData,
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
                setFormData({ title: '', url: '', content: '', stores: '' });
                setEditId(null);
                requestData(pagination.pageSize, pagination.pageIndex + 1);
            } else {
                setError(__('Failed to save announcement', 'multivendorx'));
            }
        } catch (err) {
            setError(__('Failed to save announcement', 'multivendorx'));
        } finally {
            setSubmitting(false);
        }
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
            url: getApiLink(appLocalizer, 'knowledge/bulk'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: { action, ids: selectedIds },
        });
        requestData(pagination.pageSize, pagination.pageIndex + 1);
        setRowSelection({}); // Clear selection
        } catch (err) {
            setError(__('Failed to perform bulk action', 'multivendorx'));
        }
    };
    // Fetch total rows on mount
    useEffect(() => {
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

    const handleDateOpen = () => {
        setOpenDatePicker(!openDatePicker);
    };

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);

    const toggleDropdown = (id: any) => {
        if (showDropdown === id) {
            setShowDropdown(false);
            return;
        }
        setShowDropdown(id);
    };

    // Fetch data from backend
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        status: string = 'all'
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'announcement'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                status: status
            },
        })
            .then((response) => {
                const { items, counts } = response.data;
                setData(items || []);
                setAnnouncementStatus([
                    { key: 'all', name: 'All', count: counts.all || 0 },
                    { key: 'publish', name: 'Published', count: counts.publish || 0 },
                    { key: 'pending', name: 'Pending', count: counts.pending || 0 },
                ]);
            })
            .catch(() => {
                setError(__('Failed to load announcements', 'multivendorx'));
                setData([]);
            });
    }

    const requestApiForData = (rowsPerPage: number, currentPage: number, filterData?: any) => {
        setData(null);
        requestData(rowsPerPage, currentPage, filterData?.typeCount || '');
    };

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
                    {row.original.status || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Sent To', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={Array.isArray(row.original.status) ? row.original.stores.join(', ') : row.original.stores || ''}>
                    {Array.isArray(row.original.stores) ? row.original.stores.join(', ') : row.original.stores || '-'}
                </TableCell>
            ),
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

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'bulk-action',
            render: () => (
                <div className=" bulk-action">
                    <select name="action" className="basic-select" ref={bulkSelectRef}>
                        {bulkActionOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button name="bulk-action-apply" className="admin-btn btn-purple" onClick={handleBulkAction}>
                        {__('Apply')}
                    </button>

                </div>
            ),
        },
    ];
    const BulkAction: React.FC = () => (
        <div className=" bulk-action">
            <select name="action" className="basic-select" ref={bulkSelectRef}>
                <option value="">{__('Bulk actions')}</option>
                <option value="publish">{__('Publish', 'multivendorx')}</option>
                <option value="pending">{__('Pending', 'multivendorx')}</option>
                <option value="delete">{__('Delete', 'multivendorx')}</option>
            </select>
        </div>
    );

    const [open, setOpen] = useState(false);

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
                            <div
                                onClick={!submitting ? handleSubmit : undefined}
                                className={`admin-btn btn-purple ${submitting ? 'disabled' : ''}`}
                                style={{ opacity: submitting ? 0.6 : 1, pointerEvents: submitting ? 'none' : 'auto' }}
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </div>

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
                                    value={formData.stores ? formData.stores.split(',') : []} // ✅ CSV → array
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
                    pageCount={pageCount}
                    pagination={pagination}
                    realtimeFilter={realtimeFilter}
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
