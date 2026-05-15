import React, { useState, useEffect, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { TableCard, QueryProps, TableRow, getApiLink } from 'zyra';
import axios from 'axios';
import QuoteThankYou from './QuoteThankYou';
import { formatLocalDate } from '../../services/commonFunction';
import 'zyra/build/index.css';

type QuoteRow = {
    id: string | number;
    key: string;
    image: string;
    name: string;
    quantity: string | number;
    total: string | number;
};

type CategoryCount = {
    value: string;
    label: string;
    count: number;
};

const QuoteList = () => {
    const [rows, setRows] = useState<TableRow[]>([]);
    const [rowIds, setRowIds] = useState<number[]>([]);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [responseStatus, setResponseStatus] = useState<'success' | 'error' | ''>('');
    const [showThankYou, setShowThankYou] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
    
    const [formData, setFormData] = useState({
        name: (window as any).quoteCart?.name || '',
        email: (window as any).quoteCart?.email || '',
        phone: '',
        message: '',
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setShowThankYou(params.get('order_id'));
        setStatus(params.get('status') || '');
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fetchTableData = useCallback((query: QueryProps) => {
        setIsLoading(true);

        axios
            .post(getApiLink(appLocalizer, 'quote-cart'), {
                page: query.paged || 1,
                row: query.per_page || 10,
                filter_status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
                search_value: query.searchValue || '',
                start_date: query.filter?.created_at?.startDate ? formatLocalDate(query.filter.created_at.startDate) : '',
                end_date: query.filter?.created_at?.endDate ? formatLocalDate(query.filter.created_at.endDate) : '',
                order_by: query.orderby,
                order: query.order,
            }, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then((response) => {
                const items = response.data.response || [];
                const ids = items.filter((item: QuoteRow) => item?.id != null).map((item: QuoteRow) => Number(item.id));
                
                setRowIds(ids);
                setRows(items);
                setCategoryCounts([
                    { value: 'all', label: __('All', 'catalogx-pro'), count: Number(response.data.count) || 0 },
                    { value: 'pending', label: __('Pending', 'catalogx-pro'), count: Number(response.data.pending_count) || 0 },
                    { value: 'approved', label: __('Approved', 'catalogx-pro'), count: Number(response.data.approved_count) || 0 },
                    { value: 'rejected', label: __('Rejected', 'catalogx-pro'), count: Number(response.data.rejected_count) || 0 },
                ]);
                setTotalRows(Number(response.data.count) || 0);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Failed to fetch quote data:', error);
                setRows([]);
                setRowIds([]);
                setTotalRows(0);
                setIsLoading(false);
            });
    }, []);

    const handleRemoveItem = useCallback(async (row: QuoteRow) => {
        try {
            await axios.delete(getApiLink(appLocalizer, 'quote-cart'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: { productId: row.id, key: row.key },
            });
            fetchTableData({ paged: 1, per_page: 10 });
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    }, [fetchTableData]);

    const handleUpdateCart = useCallback(async (selectedIds: number[]) => {
        const selectedRows = rows.filter(row => selectedIds.includes(Number(row.id)));
        const productsToUpdate = selectedRows.map(row => ({
            id: row.id,
            key: row.key,
            quantity: row.quantity || 1,
        }));

        if (productsToUpdate.length === 0) return;

        try {
            await axios.put(getApiLink(appLocalizer, 'quote-cart'), { products: productsToUpdate }, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            });
            fetchTableData({ paged: 1, per_page: 10 });
        } catch (error) {
            console.error('Failed to update cart:', error);
        }
    }, [rows, fetchTableData]);

    const handleSendQuote = useCallback(async () => {
        const sendBtn = document.getElementById('send-quote');
        if (sendBtn) sendBtn.style.display = 'none';

        try {
            const response = await axios.post(getApiLink(appLocalizer, 'send-quote'), { formData }, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            });

            if (response.status === 200) {
                setResponseStatus('success');
                setShowThankYou(response.data.order_id);
            } else {
                setResponseStatus('error');
                if (sendBtn) sendBtn.style.display = 'block';
            }
        } catch (error) {
            console.error('Failed to send quote:', error);
            setResponseStatus('error');
            if (sendBtn) sendBtn.style.display = 'block';
        }
    }, [formData]);

    const handleBulkActionApply = useCallback((action: string, selectedIds: number[]) => {
        if (action === 'update_cart') {
            handleUpdateCart(selectedIds);
        } else if (action === 'remove_selected') {
            Promise.all(selectedIds.map(async (id) => {
                const row = rows.find(r => Number(r.id) === id);
                if (row) await handleRemoveItem(row);
            }));
        }
    }, [handleUpdateCart, handleRemoveItem, rows]);

    const headers = {
        product: {
            label: __('Product', 'catalogx'),
            render: (row: QuoteRow) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div dangerouslySetInnerHTML={{ __html: row.image || '' }} />
                    <div dangerouslySetInnerHTML={{ __html: row.name || '' }} />
                    <i className="adminlib-cross" style={{ cursor: 'pointer' }} onClick={() => handleRemoveItem(row)} />
                </div>
            ),
        },
        quantity: {
            label: __('Quantity', 'catalogx'),
            render: (row: QuoteRow) => (
                <input type="number" className="basic-input" min="1" defaultValue={row.quantity || 1} />
            ),
        },
        total: {
            label: __('Subtotal', 'catalogx'),
            render: (row: QuoteRow) => <div dangerouslySetInnerHTML={{ __html: String(row.total) }} />,
        },
    };

    const bulkActions = [
        { label: __('Update Cart', 'catalogx'), value: 'update_cart' },
        { label: __('Remove Selected', 'catalogx'), value: 'remove_selected' },
    ];

    if (showThankYou || status) {
        return <QuoteThankYou order_id={showThankYou} status={status} />;
    }

    return (
        <div className="quote-list-container">
            <TableCard
                headers={headers}
                rows={rows}
                ids={rowIds}
                totalRows={totalRows}
                isLoading={isLoading}
                onQueryUpdate={fetchTableData}
                bulkActions={bulkActions}
                onBulkActionApply={handleBulkActionApply}
                categoryCounts={categoryCounts}
                activeCategory="all"
                title={__('Quote Cart', 'catalogx')}
                showColumnToggleIcon={false}
            />

            {rows.length > 0 && (
                <div className="form-wrapper">
                    <h3>{__('Request a Quote', 'catalogx')}</h3>
                    
                    <div className="form-field">
                        <label>{__('Name:', 'catalogx')}<span className="required">*</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>

                    <div className="form-field">
                        <label>{__('Email:', 'catalogx')}<span className="required">*</span></label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>

                    <div className="form-field">
                        <label>{__('Phone:', 'catalogx')}</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>

                    <div className="form-field">
                        <label>{__('Message:', 'catalogx')}</label>
                        <textarea name="message" rows={4} value={formData.message} onChange={handleInputChange} />
                    </div>

                    <button id="send-quote" onClick={handleSendQuote} disabled={!formData.name || !formData.email}>
                        {__('Send Quote', 'catalogx')}
                    </button>

                    {responseStatus && (
                        <div className={`response-message ${responseStatus}`}>
                            {responseStatus === 'error' 
                                ? __('Something went wrong! Please try again.', 'catalogx')
                                : __('Quote request sent successfully!', 'catalogx')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuoteList;