/* global appLocalizer */
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, AdminBreadcrumbs, BasicInput, TextArea, CommonPopup, SelectInput, CalendarInput, ToggleSetting } from 'zyra';

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
    date?:any;
};

type AnnouncementForm = {
    title: string;
    url: string;
    content: string;
    stores: number[]; // This should be number[] to match your API
    status: 'draft' | 'pending' | 'publish';
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

    const [pageCount, setPageCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const bulkSelectRef = useRef<HTMLSelectElement>(null);

    const [editId, setEditId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<AnnouncementForm>({
        title: '',
        url: '',
        content: '',
        stores: [], // Initialize as empty array
        status: 'draft',
    });

    const fetchStoreOptions = async () => {
        try {
            const response = await axios.get(getApiLink(appLocalizer, 'store'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { filter_status: 'active' }
            });
            const stores = response.data?.stores || [];
            const options = [
                { value: "0", label: __('All Stores', 'multivendorx') },
                ...stores.map((store: any) => ({
                    value: store.id.toString(),
                    label: store.store_name,
                })),
            ];
            setStoreOptions(options);
        } catch {
            setError(__('Failed to load stores', 'multivendorx'));
        }
    };

    const handleToggleChange = (value: string) => {
        setFormData((prev) => ({ ...prev, status: value as 'draft' | 'pending' | 'publish' }));
    };

    const [announcementStatus, setAnnouncementStatus] = useState<AnnouncementStatus[] | null>(null);
    const [storeOptions, setStoreOptions] = useState<{ value: string; label: string }[]>([]);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!formData.title.trim()) {
            errors.title = __('Title is required', 'multivendorx');
        }

        if (!formData.content.trim()) {
            errors.content = __('Content is required', 'multivendorx');
        }

        if (!formData.stores || formData.stores.length === 0) {
            errors.stores = __('Please select at least one store', 'multivendorx');
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCloseForm = () => {
        setAddAnnouncements(false);
        setFormData({
            title: '',
            url: '',
            content: '',
            stores: [], // Reset to empty array
            status: 'draft'
        });
        setEditId(null);
        setError(null);
        setValidationErrors({});
    };

    // Handle form input change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear field error when user types
        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleBulkAction = async () => {
        const action = bulkSelectRef.current?.value;
        const selectedIds = Object.keys(rowSelection).map((key) => {
            const index = Number(key);
            return data && data[index] ? data[index].id : null;
        }).filter((id): id is number => id !== null);

        if (!selectedIds.length) {
            return;
        }

        if (!action) {
            return;
        }

        setData(null);

        try {
            await axios({
                method: 'PUT',
                url: getApiLink(appLocalizer, 'announcement'),
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: { bulk: true, action, ids: selectedIds },
            });
            await fetchTotalRows();
            requestData(pagination.pageSize, pagination.pageIndex + 1);
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
                await fetchStoreOptions();

                setFormData({
                    title: response.data.title || '',
                    url: response.data.url || '',
                    content: response.data.content || '',
                    stores: response.data.stores
                        ? response.data.stores.map((s: any) => Number(s)) // ensure numbers
                        : [],
                    status: response.data.status || 'draft',
                });
                setEditId(id);
                setAddAnnouncements(true);
            }
        } catch (err) {
            setError(__('Failed to load announcement', 'multivendorx'));
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;

        if (!validateForm()) {
            return; // Stop submission if errors exist
        }

        setSubmitting(true);
        try {
            const endpoint = editId
                ? getApiLink(appLocalizer, `announcement/${editId}`)
                : getApiLink(appLocalizer, 'announcement');
            const method = editId ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                stores: formData.stores, // already an array of numbers
            };

            const response = await axios({
                method,
                url: endpoint,
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: payload,
            });

            if (response.data.success) {
                setAddAnnouncements(false);
                setFormData({ title: '', url: '', content: '', stores: [], status: 'draft' });
                setEditId(null);
                await fetchTotalRows();
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

    const fetchTotalRows = async () => {
        try {
            const response = await axios.get(getApiLink(appLocalizer, 'announcement'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { count: true },
            });
            const total = response.data || 0;
            setTotalRows(total);
            setPageCount(Math.ceil(total / pagination.pageSize));
        } catch {
            setError(__('Failed to load total rows', 'multivendorx'));
        }
    };

    // Fetch total rows on mount
    useEffect(() => {
        fetchTotalRows();
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
        typeCount = '',
        searchField = '',
        startDate = new Date(0),
        endDate = new Date(),
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'announcement'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                status: typeCount === 'all' ? '' : typeCount,
                startDate,
                endDate,
                searchField
            },
        })
            .then((response) => {
                setData(response.data.items || []);
                const statuses = [
                    { key: 'all', name: 'All', count: response.data.all || 0 },
                    { key: 'publish', name: 'Publish', count: response.data.publish || 0 },
                    { key: 'pending', name: 'Pending', count: response.data.pending || 0 },
                    { key: 'draft', name: 'Draft', count: response.data.draft || 0 },
                ];

                // Remove items where count === 0
                setAnnouncementStatus(statuses.filter(status => status.count > 0));
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
        filterData: FilterData
    ) => {
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
            filterData?.searchField,
            filterData?.date?.start_date,
            filterData?.date?.end_date,

        );
    };


    const searchFilter: RealtimeFilter[] = [
        {
            name: 'searchField',
            render: (updateFilter, filterValue) => (
                <>
                    <div className="search-section">
                        <input
                            name="searchField"
                            type="text"
                            placeholder={__('Search', 'multivendorx')}
                            onChange={(e) => {
                                updateFilter(e.target.name, e.target.value);
                            }}
                            value={filterValue || ''}
                        />
                        <i className="adminlib-search"></i>
                    </div>
                </>
            ),
        },
    ];
    const truncateText = (text: string, maxLength: number) => {
        if (!text) return '-';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
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
                    {truncateText(row.original.title || '', 30)} {/* truncate to 30 chars */}
                </TableCell>
            ),
        },
        {
            header: __('Content', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.content || ''}>
                    {truncateText(row.original.content || '', 50)} {/* truncate to 50 chars */}
                </TableCell>
            ),
        },
        {
            id: 'status',
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => {
                return (
                    <TableCell
                        title={'status'}
                        type="status"
                        status={row.original.status} children={undefined}
                    />
                );
            },
        },
        {
            header: __('Recipients', 'multivendorx'),
            cell: ({ row }) => {
                const storeString = row.original.store_name;

                // 🔹 If store_name is empty, null, or undefined → show All Stores
                if (!storeString) {
                    return <TableCell title={'stores'}>{__('All Stores', 'multivendorx')}</TableCell>;
                }

                // 🔹 Otherwise, split and format store names
                const stores = storeString.split(',').map(s => s.trim());
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
            id: 'date',
            accessorKey: 'date',
            enableSorting: true,
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
        {
            id: 'action',
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell
                    title={'action'}
                    type="action-dropdown"
                    rowData={row.original}
                    header={{
                        actions: [
                            {
                                label: __('Edit', 'multivendorx'),
                                icon: 'adminlib-edit',
                                onClick: (rowData: any) => {
                                    handleEdit(rowData.id); // opens edit popup
                                },
                                hover: true,
                            },
                            {
                                label: __('Delete', 'multivendorx'),
                                icon: 'adminlib-delete',
                                onClick: async (rowData: any) => {
                                    if (!rowData.id) return;
                                    if (!confirm(__('Are you sure you want to delete this announcement?', 'multivendorx'))) return;

                                    try {
                                        await axios({
                                            method: 'DELETE',
                                            url: getApiLink(appLocalizer, `announcement/${rowData.id}`),
                                            headers: { 'X-WP-Nonce': appLocalizer.nonce },
                                        });

                                        // Refresh data after deletion
                                        await fetchTotalRows();
                                        requestData(pagination.pageSize, pagination.pageIndex + 1, '', '');
                                    } catch (err) {
                                        setError(__('Failed to delete announcement', 'multivendorx'));
                                    }
                                },
                                hover: true,
                            },
                        ],
                    }} children={undefined} />
            ),
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

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'date',
            render: (updateFilter) => (
                <div className="right">
                    <CalendarInput
                        wrapperClass=""
                        inputClass=""
                        onChange={(range: any) => {
                            updateFilter('date', {
                                start_date: range.startDate,
                                end_date: range.endDate,
                            });
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-announcement"
                description={'Central hub for managing marketplace announcements. Review past updates and create new ones to keep stores informed.'}
                tabTitle="Announcements"
                buttons={[
                    <div
                        className="admin-btn btn-purple-bg"
                        onClick={async () => {
                            setValidationErrors({});
                            await fetchStoreOptions();
                            setAddAnnouncements(true);
                        }}
                    >
                        <i className="adminlib-plus-circle"></i>
                        {__('Add New', 'multivendorx')}
                    </div>
                ]}
            />

            <CommonPopup
                open={addAnnouncements}
                onClose={handleCloseForm}
                width="31.25rem"
                header={
                    <>
                        <div className="title">
                            <i className="adminlib-announcement"></i>
                            {editId
                                ? __('Edit Announcement', 'multivendorx')
                                : __('Add Announcement', 'multivendorx')}
                        </div>

                        <p>
                            {__(
                                'Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.',
                                'multivendorx'
                            )}
                        </p>

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
                            {__('Cancel', 'multivendorx')}
                        </div>

                        <button
                            type="button"
                            onClick={() => handleSubmit()}
                            className="admin-btn btn-purple"
                            disabled={submitting}
                        >
                            {submitting
                                ? __('Saving...', 'multivendorx')
                                : __('Save', 'multivendorx')}
                        </button>
                    </>
                }
            >
                <div className="content">
                    <div className="form-group-wrapper">

                        <div className="form-group">
                            <label htmlFor="title">
                                {__('Title', 'multivendorx')}
                            </label>

                            <BasicInput
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                msg={error}
                            />
                            {validationErrors.title && (
                                <div className="invalid-massage">
                                    {validationErrors.title}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="content">
                                {__('Announcement message', 'multivendorx')}
                            </label>

                            <TextArea
                                name="content"
                                inputClass="textarea-input"
                                value={formData.content}
                                onChange={handleChange}
                                usePlainText={false}
                                tinymceApiKey={
                                    appLocalizer.settings_databases_value['marketplace']
                                    ['tinymce_api_section'] ?? ''
                                }
                            />

                            {validationErrors.content && (
                                <div className="invalid-massage">
                                    {validationErrors.content}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="stores">
                                {__('Stores', 'multivendorx')}
                            </label>

                            <SelectInput
                                name="stores"
                                type="multi-select"
                                options={storeOptions}
                                value={formData.stores.map(id => id.toString())}
                                onChange={(newValue: any) => {
                                    const selectedValues = Array.isArray(newValue)
                                        ? newValue.map((opt: any) => Number(opt.value))
                                        : [];

                                    setFormData(prev => ({
                                        ...prev,
                                        stores: selectedValues,
                                    }));

                                    if (selectedValues.length > 0 && validationErrors.stores) {
                                        setValidationErrors(prev => {
                                            const updated = { ...prev };
                                            delete updated.stores;
                                            return updated;
                                        });
                                    }
                                }}
                            />

                            {validationErrors.stores && (
                                <div className="invalid-massage">
                                    {validationErrors.stores}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">
                                {__('Status', 'multivendorx')}
                            </label>

                            <ToggleSetting
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                description={__('Select the status of the announcement.', 'multivendorx')}
                                options={[
                                    { key: 'draft', value: 'draft', label: __('Draft', 'multivendorx') },
                                    { key: 'pending', value: 'pending', label: __('Pending', 'multivendorx') },
                                    { key: 'publish', value: 'publish', label: __('Publish', 'multivendorx') },
                                ]}
                                value={formData.status}
                                onChange={handleToggleChange}
                            />
                        </div>

                        <span className="space"></span>
                    </div>
                </div>

                {error && <p className="error-text">{error}</p>}
            </CommonPopup>


            <div className="general-wrapper">
                <div className="admin-table-wrapper">
                    <Table
                        data={data}
                        columns={columns as ColumnDef<Record<string, any>, any>[]}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        defaultRowsPerPage={10}
                        searchFilter={searchFilter}
                        pageCount={pageCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        handlePagination={requestApiForData}
                        perPageOption={[10, 25, 50]}
                        typeCounts={announcementStatus as AnnouncementStatus[]}
                        bulkActionComp={() => <BulkAction />}
                        totalCounts={totalRows}
                        realtimeFilter={realtimeFilter}
                    />
                </div>
            </div>
        </>
    );
};

export default Announcements;
