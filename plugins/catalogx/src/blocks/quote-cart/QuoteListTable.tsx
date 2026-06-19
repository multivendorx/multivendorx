import React, { useState, useEffect, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { QueryProps } from 'zyra';
import axios from 'axios';
import QuoteThankYou from './QuoteThankYou';
import { formatLocalDate } from '../../services/commonFunction';

type QuoteRow = {
    id: string | number;
    key: string;
    image: string;
    name: string;
    quantity: string | number;
    total: string | number;
};

const QuoteList = () => {
    const [rows, setRows] = useState<QuoteRow[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [responseStatus, setResponseStatus] = useState<
        'success' | 'error' | ''
    >('');

    const [showThankYou, setShowThankYou] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');

    const [productQuantity, setProductQuantity] = useState<
        Record<
            string | number,
            {
                quantity: string | number;
                key: string;
            }
        >
    >({});

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
        fetchTableData({
            paged: 1,
            per_page: 10,
        });
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleQuantityChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        row: QuoteRow
    ) => {
        const value = Number(e.target.value);

        setProductQuantity((prev) => ({
            ...prev,
            [row.id]: {
                quantity: value,
                key: row.key,
            },
        }));
    };

    /**
     * Fetch Quote Cart Data.
     */
    const fetchTableData = useCallback((query: QueryProps) => {
        setIsLoading(true);

        axios({
            method: 'get',
            url: `${quoteCart.apiUrl}/${quoteCart.restUrl}/quote-cart`,
            headers: {
                'X-WP-Nonce': quoteCart.nonce,
            },
            data: {
                page: query.paged || 1,
                row: query.per_page || 10,
                filter_status:
                    query.categoryFilter === 'all'
                        ? ''
                        : query.categoryFilter,
                search_value: query.searchValue || '',
                start_date: query.filter?.created_at?.startDate
                    ? formatLocalDate(
                        query.filter.created_at.startDate
                    )
                    : '',
                end_date: query.filter?.created_at?.endDate
                    ? formatLocalDate(
                        query.filter.created_at.endDate
                    )
                    : '',
                order_by: query.orderby || '',
                order: query.order || '',
            },
        })
            .then((response) => {
                const items = response.data.response || [];

                const ids = items
                    .filter((item: QuoteRow) => item?.id != null)
                    .map((item: QuoteRow) => Number(item.id));

                setRows(response.data.response || []);

                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Failed to fetch quote cart:', error);

                setRows([]);
                setIsLoading(false);
            });
    }, []);

    const handleRemoveItem = useCallback(
        async (row: QuoteRow) => {
            try {
                await axios({
                    method: 'delete',
                    url: `${quoteCart.apiUrl}/${quoteCart.restUrl}/quote-cart/${row.id}`,
                    headers: {
                        'X-WP-Nonce': quoteCart.nonce,
                    },
                    data: {
                        productId: row.id,
                        key: row.key,
                    },
                });

                fetchTableData({});
            } catch (error) {
                console.error('Failed to remove item:', error);
            }
        },
        [fetchTableData]
    );

    /**
     * Update Quote Cart.
     */
    const handleUpdateCart = useCallback(async () => {
        try {
            /**
             * Only send modified products.
             */
            const updatedProducts = Object.entries(
                productQuantity
            ).map(([id, value]) => ({
                id,
                key: value.key,
                quantity: Number(value.quantity ?? 1),
            }));

            /**
             * Nothing changed.
             */
            if (!updatedProducts.length) {
                return;
            }

            setIsLoading(true);

            /**
             * Update cart.
             */
            await axios({
                method: 'put',
                url: `${quoteCart.apiUrl}/${quoteCart.restUrl}/quote-cart/${updatedProducts?.[0]?.id}`,
                headers: {
                    'X-WP-Nonce': quoteCart.nonce,
                },
                data: {
                    products: updatedProducts,
                },
            });

            fetchTableData({});

            /**
             * Clear local quantity cache.
             */
            setProductQuantity({});

            setIsLoading(false);
        } catch (error) {
            console.error(
                'Failed to update quote cart:',
                error
            );

            setIsLoading(false);
        }
    }, [productQuantity]);

    /**
     * Send Quote Request.
     */
    const handleSendQuote = useCallback(async () => {
        setIsLoading(true);

        const sendBtn = document.getElementById(
            'send-quote'
        ) as HTMLButtonElement | null;

        if (sendBtn) {
            sendBtn.style.display = 'none';
        }

        axios({
            method: 'post',
            url: `${quoteCart.apiUrl}/${quoteCart.restUrl}/quotes`,
            headers: {
                'X-WP-Nonce': quoteCart.nonce,
            },
            data: {
                formData,
            },
        })
            .then((response) => {
                setIsLoading(false);

                if (response.status === 200) {
                    setResponseStatus('success');
                    setShowThankYou(response.data.order_id);
                } else {
                    setResponseStatus('error');

                    if (sendBtn) {
                        sendBtn.style.display = 'block';
                    }
                }
            })
            .catch((error) => {
                console.error(
                    'Failed to send quote request:',
                    error
                );

                setIsLoading(false);
                setResponseStatus('error');

                if (sendBtn) {
                    sendBtn.style.display = 'block';
                }
            });
    }, [formData]);

    const TableSkeleton = () => (
        <table className="shop_table shop_table_responsive my_account_orders catalogx-skeleton-table">
            <thead>
                <tr>
                    <th>
                        <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
                    </th>
                    <th>
                        <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
                    </th>
                    <th>
                        <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
                    </th>
                </tr>
            </thead>
            <tbody>
                {[...Array(5)].map((_, index) => (
                    <tr key={index} className="woocommerce-orders-table__row">
                        <td className="woocommerce-orders-table__cell">
                            <div className="skeleton skeleton-text" style={{ width: '100%', height: '2.5rem' }}></div>
                        </td>
                        <td className="woocommerce-orders-table__cell">
                            <div className="skeleton skeleton-text" style={{ width: '100%', height: '2.5rem' }}></div>
                        </td>
                        <td className="woocommerce-orders-table__cell">
                            <div className="skeleton skeleton-text" style={{ width: '100%', height: '2.5rem' }}></div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    if (showThankYou || status) {
        return (
            <QuoteThankYou
                orderId={showThankYou}
                status={status}
            />
        );
    }

    return (

        <div className="quote-list-container woocommerce" >
            {isLoading && rows.length === 0 ? (
                <TableSkeleton />
            ) : rows.length === 0 ? (
                <div className="woocommerce-notices-wrapper">
                    <ul className="woocommerce-error" role="alert">
                        <li>{__('No products found', 'catalogx-pro')}</li>
                    </ul>
                </div>
            ) : (
                <>
                    <button
                        type="button"
                        className="update-cart-btn button wp-block-button__link update-cart-button"
                        onClick={handleUpdateCart}
                        disabled={isLoading}
                    >
                        {__('Update Cart', 'catalogx')}
                    </button>

                    <table className="catalogx-table shop_table shop_table_responsive my_account_orders">
                        <thead>
                            <tr>
                                <th className="woocommerce-orders-table__header">
                                    {__('Product', 'catalogx')}
                                </th>
                                <th className="woocommerce-orders-table__header">
                                    {__('Quantity', 'catalogx')}
                                </th>
                                <th className="woocommerce-orders-table__header">
                                    {__('Subtotal', 'catalogx')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <>
                                    <tr key={index} className="woocommerce-orders-table__row">
                                        <th
                                            className="product-cell woocommerce-orders-table__cell"
                                            data-label={__('Username', 'catalogx')}
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: row.image || '',
                                                }}
                                            />
                                            {row.name}
                                            <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="#e71313" />
                                            </svg>
                                        </th>
                                        <td
                                            className="woocommerce-orders-table__cell"
                                            data-label={__('Username', 'catalogx')}
                                        >
                                            <input
                                                type="number"
                                                className="basic-input"
                                                min="1"
                                                value={
                                                    productQuantity[row.id]?.quantity ??
                                                    row.quantity ??
                                                    1
                                                }
                                                onChange={(e) =>
                                                    handleQuantityChange(e, row)
                                                }
                                            />
                                        </td>
                                        <td
                                            className="woocommerce-orders-table__cell"
                                            data-label={__('Username', 'catalogx')}
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: String(row.total),
                                                }}
                                            />
                                        </td>
                                    </tr>
                                </>
                            ))}
                        </tbody>
                    </table>

                    {rows.length > 0 && (
                        <>
                            {responseStatus && (
                                <div className="woocommerce-notices-wrapper">
                                    <ul className={
                                        responseStatus === 'error'
                                            ? 'woocommerce-error'
                                            : 'woocommerce-message'
                                    } role="alert">
                                        <li>
                                            {responseStatus === 'error'
                                                ? __(
                                                    'Something went wrong! Please try again.',
                                                    'catalogx'
                                                )
                                                : __(
                                                    'Quote request sent successfully!',
                                                    'catalogx'
                                                )}
                                        </li>
                                    </ul>
                                </div>
                            )}
                            <h2> {__('Request a Quote', 'catalogx')} </h2>
                            <form className="woocommerce-form woocommerce-form-login login">
                                <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                    <label>
                                        {__('Name:', 'catalogx')}
                                        <span className="required">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        className='woocommerce-Input input-text'
                                        onChange={handleInputChange}
                                        required
                                    />
                                </p>

                                <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                    <label>
                                        {__('Email:', 'catalogx')}
                                        <span className="required">*</span>
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        className='woocommerce-Input input-text'
                                        onChange={handleInputChange}
                                        required
                                    />
                                </p>

                                <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                    <label>
                                        {__('Phone:', 'catalogx')}
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        className='woocommerce-Input input-text'
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </p>

                                <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                    <label>
                                        {__('Message:', 'catalogx')}
                                    </label>

                                    <textarea
                                        name="message"
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className='woocommerce-Input input-text'
                                    />
                                </p>
                                <p className='form-row'>
                                    <button
                                        type="button"
                                        id="send-quote"
                                        className='woocommerce-button button wp-element-button wp-block-button__link'
                                        onClick={handleSendQuote}
                                        disabled={
                                            !formData.name || !formData.email
                                        }
                                    >
                                        {__('Send Quote', 'catalogx')}
                                    </button>
                                </p>
                            </form>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default QuoteList;