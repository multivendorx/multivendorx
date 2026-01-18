import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import { Table, TableCell } from 'zyra';
import axios from 'axios';
import QuoteThankYou from './QuoteThankYou';
import 'zyra/build/index.css';

type QuoteRow = {
    id: string | number;
    key: string;
    image: string;
    name: string;
    quantity: string | number;
    total: number;
};

type DataRow = {
    id: string | number;
    key: string;
    image: string;
    name: string;
    quantity: string | number;
    total: string;
};

const QuoteList = () => {
    const [ data, setData ] = useState< DataRow[] | null >( null );
    const [ selectedRows, setSelectedRows ] = useState< DataRow[] >( [] );
    const [ rowSelection, setRowSelection ] = useState< RowSelectionState >(
        {}
    );
    const [ productQuantity, setProductQuantity ] = useState<
        Record< string | number, { quantity: string; key: string } >
    >( {} );
    const [ loading, setLoading ] = useState( false );
    const [ responseContent, setResponseContent ] = useState( false );
    const [ responseStatus, setResponseStatus ] = useState( '' );
    const [ totalRows, setTotalRows ] = useState< number >( 0 );
    const [ showThankYou, setShowThankYou ] = useState< string | null >( null );
    const [ status, setStatus ] = useState( '' );
    const [ formData, setFormData ] = useState( {
        name: quoteCart.name || '',
        email: quoteCart.email || '',
        phone: '',
        message: '',
    } );
    const [ pagination, setPagination ] = useState< PaginationState >( {
        pageIndex: 0,
        pageSize: 10,
    } );
    const [ pageCount, setPageCount ] = useState( 0 );

    useEffect( () => {
        if ( ! Array.isArray( data ) ) return;

        const selectedIndices = Object.keys( rowSelection )
            .filter( ( key ) => rowSelection[ key ] )
            .map( Number ); // Convert "0", "1" to 0, 1

        const selectedItems = selectedIndices
            .map( ( index ) => data[ index ] )
            .filter( Boolean ); // remove undefined if index is out of bounds

        setSelectedRows( selectedItems );
    }, [ rowSelection, data ] );

    useEffect( () => {
        const params = new URLSearchParams( location.search );
        const orderIdParam = params.get( 'order_id' );
        const statusParam = params.get( 'status' );
        setShowThankYou( orderIdParam );
        setStatus( statusParam || '' );
    }, [ location ] );

    const handleInputChange = (
        e: React.ChangeEvent< HTMLInputElement | HTMLTextAreaElement >
    ) => {
        const { name, value } = e.target;
        setFormData( ( prevState ) => ( {
            ...prevState,
            [ name ]: value,
        } ) );
    };

    useEffect( () => {
        requestData();
    }, [] );

    useEffect( () => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData( rowsPerPage, currentPage );
        setPageCount( Math.ceil( totalRows / rowsPerPage ) );
    }, [ pagination ] );

    const handleQuantityChange = (
        e: React.ChangeEvent< HTMLInputElement >,
        id: string | number,
        key: string
    ) => {
        setProductQuantity( ( prev ) => ( {
            ...prev,
            [ id ]: {
                quantity: e.target.value,
                key,
            },
        } ) );
    };

    function requestData( rowsPerPage = 10, currentPage = 1 ) {
        //Fetch the data to show in the table
        axios( {
            method: 'post',
            url: `${ quoteCart.apiUrl }/${ quoteCart.restUrl }/quote-cart`,
            headers: { 'X-WP-Nonce': quoteCart.nonce },
            data: {
                page: currentPage,
                row: rowsPerPage,
            },
        } ).then( ( response ) => {
            setTotalRows( response.data.count );
            setPageCount(
                Math.ceil( response.data.count / pagination.pageSize )
            );
            setData( response.data.response );
        } );
    }

    const handleRemoveCart = (
        e: React.MouseEvent< HTMLElement >,
        id: string | number,
        key: string
    ) => {
        axios( {
            method: 'delete',
            url: `${ quoteCart.apiUrl }/${ quoteCart.restUrl }/quote-cart`,
            headers: { 'X-WP-Nonce': quoteCart.nonce },
            data: {
                productId: id,
                key,
            },
        } ).then( () => {
            requestData();
        } );
    };

    const handleUpdateCart = () => {
        const newProductQuantity =
            selectedRows.length > 0
                ? selectedRows.map( ( row ) => {
                      const id = row.id;
                      const value = productQuantity[ id ].quantity || 1;
                      return {
                          key: row.key,
                          id,
                          quantity: value,
                      };
                  } )
                : Object.entries( productQuantity ).map(
                      ( [ id, value ] ) => ( {
                          id,
                          quantity: value.quantity,
                          key: value.key,
                      } )
                  );

        axios( {
            method: 'put',
            url: `${ quoteCart.apiUrl }/${ quoteCart.restUrl }/quote-cart`,
            headers: { 'X-WP-Nonce': quoteCart.nonce },
            data: {
                products: newProductQuantity,
            },
        } ).then( () => {
            requestData();
            window.location.reload();
        } );
    };

    const handleSendQuote = () => {
        const sendBtn = document.getElementById( 'send-quote' );
        if ( sendBtn ) {
            sendBtn.style.display = 'none';
        }
        setLoading( true );
        axios( {
            method: 'post',
            url: `${ quoteCart.apiUrl }/${ quoteCart.restUrl }/quotes`,
            headers: { 'X-WP-Nonce': quoteCart.nonce },
            data: {
                formData,
            },
        } ).then( ( response ) => {
            setLoading( false );
            setResponseContent( true );
            if ( response.status === 200 ) {
                setResponseStatus( 'success' );
                setShowThankYou( response.data.order_id );
            } else {
                setResponseStatus( 'error' );
                if ( sendBtn ) {
                    sendBtn.style.display = 'block';
                }
            }
        } );
    };

    const Loader = () => {
        return (
            <section className="loader_wrapper">
                <div className="loader"></div>
            </section>
        );
    };

    //columns for the data table
    const columns: ColumnDef< QuoteRow >[] = [
        {
            id: 'select',
            header: ( { table } ) => (
                <input
                    type="checkbox"
                    checked={ table.getIsAllRowsSelected() }
                    onChange={ table.getToggleAllRowsSelectedHandler() }
                />
            ),
            cell: ( { row } ) => (
                <input
                    type="checkbox"
                    checked={ row.getIsSelected() }
                    onChange={ row.getToggleSelectedHandler() }
                />
            ),
        },
        {
            header: __( 'Product', 'catalogx' ),
            cell: ( { row } ) => (
                <TableCell title="image">
                    <p
                        dangerouslySetInnerHTML={ {
                            __html: row.original.image,
                        } }
                    ></p>
                    <p
                        dangerouslySetInnerHTML={ {
                            __html: row.original.name,
                        } }
                    ></p>
                    { /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */ }
                    <i
                        className="adminfont-cross"
                        onClick={ ( e ) =>
                            handleRemoveCart(
                                e,
                                row.original.id,
                                row.original.key
                            )
                        }
                    ></i>
                </TableCell>
            ),
        },
        {
            header: __( 'Quantity', 'catalogx' ),
            cell: ( { row } ) => (
                <TableCell title="quantity">
                    <input
                        type="number"
                        name="quantity"
                        className="basic-input"
                        min="1"
                        value={
                            productQuantity[ row.original.id ]?.quantity ??
                            row.original.quantity
                        }
                        placeholder="1"
                        onChange={ ( e ) =>
                            handleQuantityChange(
                                e,
                                row.original.id,
                                row.original.key
                            )
                        }
                    />
                </TableCell>
            ),
        },
        {
            header: __( 'Subtotal', 'catalogx' ),
            cell: ( { row } ) => (
                <TableCell title="subtotal">
                    <p
                        dangerouslySetInnerHTML={ {
                            __html: row.original.total,
                        } }
                    ></p>
                </TableCell>
            ),
        },
    ];

    return (
        <>
            { showThankYou || status ? (
                <QuoteThankYou order_id={ showThankYou } status={ status } />
            ) : (
                <>
                    <div className="quotelist-table-main-wrapper">
                        <div className="admin-page-title">
                            <div className="add-to-quotation-button">
                                <button onClick={ handleUpdateCart }>
                                    { __( 'Update Cart', 'catalogx' ) }
                                </button>
                            </div>
                        </div>
                        <Table
                            data={ data || [] }
                            columns={
                                columns as ColumnDef<
                                    Record< string, any >,
                                    any
                                >[]
                            }
                            rowSelection={ rowSelection }
                            onRowSelectionChange={ setRowSelection }
                            defaultRowsPerPage={ 10 }
                            pageCount={ pageCount }
                            pagination={ pagination }
                            onPaginationChange={ setPagination }
                            handlePagination={ requestData }
                            perPageOption={ [ 10, 25, 50 ] }
                            typeCounts={ [] }
                        />
                    </div>

                    { data && Object.keys( data ).length > 0 && (
                        <div className="form-wrapper">
                            { loading && <Loader /> }
                            <p className="section-wrapper">
                                <label htmlFor="name">
                                    { __( 'Name:', 'catalogx' ) }
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="basic-input"
                                    value={ formData.name }
                                    onChange={ handleInputChange }
                                />
                            </p>
                            <p className="section-wrapper">
                                <label htmlFor="email">
                                    { __( 'Email:', 'catalogx' ) }
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="basic-input"
                                    value={ formData.email }
                                    onChange={ handleInputChange }
                                />
                            </p>
                            <p className="section-wrapper">
                                <label htmlFor="phone">
                                    { __( 'Phone:', 'catalogx' ) }
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="basic-input"
                                    value={ formData.phone }
                                    onChange={ handleInputChange }
                                />
                            </p>
                            <p className="section-wrapper">
                                <label htmlFor="message">
                                    { __( 'Message:', 'catalogx' ) }
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    className="textarea-input"
                                    rows={ 4 }
                                    cols={ 50 }
                                    value={ formData.message }
                                    onChange={ handleInputChange }
                                ></textarea>
                            </p>
                            <div className="buttons-wrapper">
                                <button
                                    id="send-quote"
                                    onClick={ handleSendQuote }
                                >
                                    { __( 'Send Quote', 'catalogx' ) }
                                </button>
                            </div>
                            { responseContent && (
                                <section
                                    className={ `response-message-container ${ responseStatus }` }
                                >
                                    <p>
                                        { responseStatus === 'error'
                                            ? __(
                                                  'Something went wrong! Try Again',
                                                  'catalogx'
                                              )
                                            : __(
                                                  'Form submitted successfully',
                                                  'catalogx'
                                              ) }
                                    </p>
                                </section>
                            ) }
                        </div>
                    ) }
                </>
            ) }
        </>
    );
};

export default QuoteList;
