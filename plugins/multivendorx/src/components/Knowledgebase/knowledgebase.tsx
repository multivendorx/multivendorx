/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, AdminBreadcrumbs, BasicInput, TextArea, CommonPopup } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';
import "../Announcements/announcements.scss";

type KBRow = {
    id?: number;
    title?: string;
    content?: string;
    status?: 'publish' | 'pending' | string;
};

type KBForm = {
    title: string;
    content: string;
    status?: 'publish' | 'pending';
};
type AnnouncementStatus = {
    key: string;
    name: string;
    count: number;
};

const bulkActionOptions = [
    { value: '', label: __('Bulk actions', 'multivendorx') },
    { value: 'publish', label: __('Publish', 'multivendorx') },
    { value: 'pending', label: __('Pending', 'multivendorx') },
    { value: 'delete', label: __('Delete', 'multivendorx') },
];

export const KnowledgeBase: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState<KBRow[] | null>(null);
    const [addEntry, setAddEntry] = useState(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [announcementStatus, setAnnouncementStatus] = useState<AnnouncementStatus[] | null>(null);

    const [editId, setEditId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [formData, setFormData] = useState<KBForm>({
        title: '',
        content: '',
        status: 'pending',
    });
    const bulkSelectRef = useRef<HTMLSelectElement>(null);
    const [modalDetails, setModalDetails] = useState<string>('');
    const [openModal, setOpenModal] = useState(false);
    const handleCloseForm = () => {
        setAddEntry(false);
        setFormData({ title: '', content: '', status: 'pending' }); // reset form
        setEditId(null); // reset edit mode
        setError(null); // clear any error
    };
    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const toggleDropdown = (id: any) => {
        if (showDropdown === id) {
            setShowDropdown(false);
            return;
        }
        setShowDropdown(id);
    };
    // Open edit modal
    const handleEdit = async (id: number) => {
        try {
            const response = await axios.get(getApiLink(appLocalizer, `knowledge/${id}`), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            });
            if (response.data) {
                setFormData({
                    title: response.data.title || '',
                    content: response.data.content || '',
                    status: response.data.status || 'pending',
                });
                setEditId(id);
                setAddEntry(true);
            }
        } catch {
            setError(__('Failed to load entry', 'multivendorx'));
        } 
    };

    // Submit form
    const handleSubmit = async (status: 'publish' | 'pending') => {
        if (submitting) return; // prevent multiple clicks
        setSubmitting(true);

        try {
            const endpoint = editId
                ? getApiLink(appLocalizer, `knowledge/${editId}`)
                : getApiLink(appLocalizer, 'knowledge');

            const method = editId ? 'PUT' : 'POST';
            const payload = { ...formData, status };

            const response = await axios({
                method,
                url: endpoint,
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: payload,
            });

            if (response.data.success) {
                setAddEntry(false);
                setFormData({ title: '', content: '', status: 'pending' });
                setEditId(null);
                requestData(pagination.pageSize, pagination.pageIndex + 1);
            } else {
                setError(__('Failed to save entry', 'multivendorx'));
            }
        } catch {
            setError(__('Failed to save entry', 'multivendorx'));
        } finally {
            setSubmitting(false); // re-enable buttons
        } 
    };


    // Fetch data
    const requestData = (
        rowsPerPage = 10,
        currentPage = 1,
        status: string = 'all'
    ) => {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'knowledge'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { page: currentPage, row: rowsPerPage, status },
        })
            .then((response) => {
            const res = response.data;
            setData(res.items || []);
            setTotalRows(res.total || 0);
            setAnnouncementStatus([
                { key: 'all', name: 'All', count: res.all ?? res.total ?? 0 },
                { key: 'publish', name: 'Published', count: res.publish ?? 0 },
                { key: 'pending', name: 'Pending', count: res.pending ?? 0 },
            ]);
            }).catch(() => setError(__('Failed to load entries', 'multivendorx')));
    };

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestData(pagination.pageSize, currentPage);
    }, [pagination]);

    // Columns
    // Columns
    const columns: ColumnDef<KBRow>[] = [
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
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ''}>
                    {row.original.status || '-'}
                </TableCell>
            ),
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

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-book"
                tabTitle="Knowledge Base"
                description={"Build your knowledge base: add new guides or manage existing ones in one place."}
                buttons={[
                    <div className="admin-btn btn-purple" onClick={() => setAddEntry(true)}>
                        <i className="adminlib-plus-circle-o"></i>
                        Add New
                    </div>,
                ]}
            />

            {addEntry && (
                <CommonPopup
                    open={addEntry}
                    onClose={handleCloseForm}
                    width="500px"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                {editId ? __('Edit Knowledgebase', 'multivendorx') : __('Add Knowledgebase', 'multivendorx')}
                            </div>
                            <p>Write and publish a new knowledge base article to help stores navigate their dashboard.</p>
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
                                <BasicInput type="text" name="title" value={formData.title} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="content">Content</label>
                                <TextArea
                                    name="content"
                                    inputClass="textarea-input"
                                    value={formData.content}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </CommonPopup>
            )}

            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    pagination={pagination}
                    realtimeFilter={realtimeFilter}
                    onPaginationChange={setPagination}
                    handlePagination={requestData}
                    perPageOption={[10, 25, 50]}
                    onRowClick={(row: any) => {
                        handleEdit(row.id);
                    }}
                    typeCounts={announcementStatus as AnnouncementStatus[]}
                />
            </div>
        </>
    );
};

export default KnowledgeBase;
