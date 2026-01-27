/**
 * External dependencies
 */
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import type { SortingState, Updater } from '@tanstack/react-table';
import type { Row, Cell } from '@tanstack/react-table';
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table';

type TableRow = Record< string, unknown >;
type InputType =
    | 'number'
    | 'text'
    | 'button'
    | 'color'
    | 'password'
    | 'email'
    | 'file'
    | 'range'
    | 'time'
    | 'url';
interface ProductWithVariations extends TableRow {
    id: string | number;
    variation?: Record< string, TableRow >;
    isVariation?: boolean;
    parentId?: string | number;
    type?: string;
}

import type {
    ColumnDef,
    OnChangeFn,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

/**
 * Internal dependencies
 */
import BasicInput from './BasicInput';
import '../styles/web/Table.scss';
import { Skeleton } from '@mui/material';

const PENALTY = 28;
const COOLDOWN = 1;

type UnknownRecord = Record< string, unknown >;
type FilterUpdater = ( key: string, value: unknown ) => void;

// Types
type Status = {
    key: string;
    name: string;
    count: number;
};

interface ColumnHeader {
    id?: string;
    header?: string | React.ReactNode;
    class?: string;
    type?: string;
    editable?: boolean;
    dependent?: boolean;
    options?: UnknownRecord;
    actions?: Array< {
        label: string;
        icon: string;
        className?: string;
        hover?: boolean;
        onClick: ( rowData: UnknownRecord ) => void;
    } >;
    onClick?: ( rowData: UnknownRecord ) => void;
}

interface TableCellProps {
    title: string;
    fieldValue?: string | boolean;
    children?: ReactNode;
    type?: string;
    header?: ColumnHeader;
    rowId?: string | number;
    isExpanded?: boolean;
    onToggleRow?: ( e: string | number ) => void;
    onToggleActive?: ( e: boolean ) => void;
    rowData?: UnknownRecord;
    onChange?: (
        e: React.ChangeEvent< HTMLInputElement | HTMLSelectElement >
    ) => void;
    showDropdown?: number | null;
    status?: string;
}

interface RealtimeFilter {
    name: string;
    render: ( updateFilter: FilterUpdater, filterValue: unknown ) => ReactNode;
}
interface SearchFilter {
    name: string;
    render: ( updateFilter: FilterUpdater, filterValue: unknown ) => ReactNode;
}
interface actionButton {
    name: string;
    render: ( updateFilter: FilterUpdater, filterValue: unknown ) => ReactNode;
}
export const TableCell: React.FC< TableCellProps > = ( {
    title = '',
    fieldValue = '',
    children = <></>,
    type = '',
    header = {},
    status = '',
    onChange = () => {},
    rowId = '',
    onToggleRow = () => {},
    rowData = {},
} ) => {
    const [ cellData, setCellData ] = useState( fieldValue );
    const timeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );
    const [ showDropdown, setShowDropdown ] = useState< number | null >( null );
    const toggleDropdown = ( id: number ) => {
        setShowDropdown( ( prev ) => ( prev === id ? null : id ) );
    };
    const statusGroups: Record< string, readonly string[] > = {
        green: [
            'completed',
            'active',
            'approved',
            'paid',
            'public',
            'publish',
            'published',
        ],
        yellow: [ 'pending', 'on-hold', 'partially_refunded' ],
        blue: [ 'under_review', 'private', 'upcoming', 'draft' ],
        red: [ 'rejected', 'unpaid', 'cancelled', 'failed', 'expired' ],
        teal: [ 'suspended' ],
        orange: [ 'refunded', 'processed', 'processing' ],
        purple: [ 'locked' ],
        indigo: [ 'deactivated' ],
        pink: [ 'permanently_rejected', 'inactive' ],
    };

    const getStatusColor = ( status: string = '' ) => {
        const key = status.toLowerCase();

        for ( const color of Object.keys( statusGroups ) as Array<
            keyof typeof statusGroups
        > ) {
            if ( statusGroups[ color ].includes( key ) ) {
                return color;
            }
        }

        return 'gray';
    };

    useEffect( () => {
        const handleClickOutside = ( e: MouseEvent ) => {
            // if click is not on dropdown toggle or inside dropdown → close it
            if (
                ! ( e.target as HTMLElement ).closest( '.action-dropdown' ) &&
                ! ( e.target as HTMLElement ).closest(
                    '.adminfont-more-vertical'
                )
            ) {
                setShowDropdown( null );
            }
        };

        document.addEventListener( 'click', handleClickOutside );
        return () =>
            document.removeEventListener( 'click', handleClickOutside );
    }, [] );
    useEffect( () => {
        setCellData( fieldValue );
    }, [ fieldValue ] );

    let content;
    if ( header?.editable === false ) {
        type = '';
    }
    switch ( type ) {
        case 'text':
        case 'number':
            content = (
                <div className={ `${ header.class }` }>
                    { type === 'product' && children }
                    <div className="table-data-container">
                        <BasicInput
                            inputClass="main-input"
                            type={ header.type as InputType }
                            value={
                                type === 'number'
                                    ? String( ( cellData as string ) || 0 )
                                    : ( cellData as string )
                            }
                            proSetting={ false }
                            onChange={ (
                                e: React.ChangeEvent< HTMLInputElement >
                            ) => {
                                const newValue = e.target.value;
                                setCellData( ( prev ) =>
                                    prev === '0'
                                        ? newValue.slice( -1 )
                                        : newValue
                                );
                                // Clear previous timeout if still waiting
                                if ( timeoutRef.current ) {
                                    clearTimeout( timeoutRef.current );
                                }
                                // Debounce the onChange call
                                timeoutRef.current = setTimeout( () => {
                                    if ( onChange ) {
                                        onChange( e );
                                    }
                                }, 2000 );
                            } }
                        />
                    </div>
                </div>
            );
            break;

        case 'expander':
            content = (
                <div
                    onClick={ ( e ) => {
                        e.stopPropagation();
                        if ( rowId !== '' ) {
                            onToggleRow?.( rowId );
                        }
                    } }
                    className={ `table-data-container ${
                        header.dependent ? '' : 'disable'
                    } ${ header.class || '' }` }
                >
                    <button
                        className="setting-btn"
                        disabled={ ! header.dependent }
                    >
                        <span className="bar bar1"></span>
                        <span className="bar bar2"></span>
                        <span className="bar bar1"></span>
                    </button>
                </div>
            );
            break;

        case 'checkbox':
            content = (
                <div
                    className="toggle-checkbox-header"
                    onClick={ ( e ) => e.stopPropagation() }
                >
                    <div className="toggle-checkbox">
                        <input
                            type="checkbox"
                            className="toggle-checkbox"
                            name={ title }
                            id={ title }
                            checked={ cellData as boolean }
                            onChange={ ( e ) => {
                                setCellData(
                                    e.target.checked ? 'true' : 'false'
                                );
                                if ( onChange ) {
                                    onChange(
                                        e as unknown as React.ChangeEvent< HTMLInputElement >
                                    );
                                }
                            } }
                        />
                        <label htmlFor={ title }>&nbsp;</label>
                    </div>
                </div>
            );
            break;
        case 'dropdown': {
            const optionsVal = Object.entries(
                header?.options as UnknownRecord
            ).map( ( [ key, val ] ) => ( {
                key,
                value: key,
                label: String( val ),
            } ) );

            content = (
                <select
                    className={ `${ header.class } dropdown-select ${ fieldValue }` }
                    value={ fieldValue as string }
                    onClick={ ( e ) => e.stopPropagation() }
                    onChange={ ( e ) => {
                        if ( onChange ) {
                            onChange(
                                e.target as unknown as React.ChangeEvent< HTMLInputElement >
                            );
                        }
                    } }
                >
                    { optionsVal.map( ( option ) => (
                        <option key={ option.key } value={ option.value }>
                            { option.label }
                        </option>
                    ) ) }
                </select>
            );
            break;
        }
        case 'action-dropdown':
            content = (
                <div className="action-section">
                    <div className="action-icons">
                        { header.actions && header.actions.length > 2 ? (
                            <>
                                <i
                                    className="adminfont-more-vertical"
                                    onClick={ ( e ) => {
                                        e.stopPropagation();
                                        toggleDropdown( rowId as number );
                                    } }
                                ></i>
                                <div
                                    className={ `action-dropdown ${
                                        showDropdown === rowId
                                            ? 'show'
                                            : 'hover'
                                    }` }
                                >
                                    <ul>
                                        { header.actions.map( ( action ) => (
                                            <li
                                                key={ action.label }
                                                className={ `${
                                                    action.className || ''
                                                } ${
                                                    action.hover ? 'hover' : ''
                                                }` }
                                                onClick={ ( e ) => {
                                                    e.stopPropagation();
                                                    action.onClick( rowData );
                                                } }
                                            >
                                                <i
                                                    className={ action.icon }
                                                ></i>
                                                <span>{ action.label }</span>
                                            </li>
                                        ) ) }
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="inline-actions">
                                { header.actions?.map( ( action ) => (
                                    <div
                                        key={ action.label }
                                        className={ `inline-action-btn tooltip-wrapper ${
                                            action.className || ''
                                        }` }
                                        onClick={ ( e ) => {
                                            e.stopPropagation();
                                            action.onClick( rowData );
                                        } }
                                    >
                                        <i className={ action.icon }></i>
                                        <span className="tooltip-name">
                                            { action.label }
                                        </span>
                                    </div>
                                ) ) }
                            </div>
                        ) }
                    </div>
                </div>
            );
            break;
        case 'status': {
            const displayStatus =
                status
                    ?.replace( /_/g, ' ' )
                    ?.replace( /-/g, ' ' )
                    ?.replace( /\b\w/g, ( c ) => c.toUpperCase() ) || '-';

            const color = getStatusColor( status );

            content = (
                <span className={ `admin-badge ${ color }` }>
                    { displayStatus }
                </span>
            );
            break;
        }
        default:
            content = (
                <div
                    title={ fieldValue as string }
                    className="table-row-custom"
                >
                    <h4 className="hide-title">{ title }</h4>
                    { children }
                </div>
            );
    }

    return <>{ content }</>;
};

// Loading table component
const LoadingTable: React.FC = () => (
    <table className="load-table">
        <tbody>
            { Array.from( { length: 10 } ).map( ( _, rowIndex ) => (
                <tr key={ rowIndex }>
                    { Array.from( { length: 5 } ).map( ( __, cellIndex ) => (
                        <td key={ cellIndex } className="load-table-td">
                            <div className="line" />
                        </td>
                    ) ) }
                </tr>
            ) ) }
        </tbody>
    </table>
);

interface TableProps {
    rowSelection?: Record< string, boolean >;
    onRowSelectionChange?: OnChangeFn< RowSelectionState >;
    defaultRowsPerPage?: number;
    realtimeFilter?: RealtimeFilter[];
    searchFilter?: SearchFilter[];
    actionButton?: actionButton[];
    data: TableRow[] | null;
    columns: ColumnDef< TableRow, unknown >[];
    handlePagination?: (
        rowsPerPage: number,
        pageIndex: number,
        filterData: Record< string, unknown >
    ) => void;
    onRowClick?: ( rowData: TableRow ) => void;
    bulkActionComp?: () => React.ReactNode;
    pageCount: number;
    pagination: PaginationState;
    onPaginationChange: OnChangeFn< PaginationState >;
    categoryFilter: Status[];
    languageFilter: Status[];
    defaultCounts?: string;
    autoLoading?: boolean;
    perPageOption: number[];
    successMsg?: string;
    expandElement?: Record< string, boolean >;
    expandedRows?: Record< string, boolean >;
    totalCounts?: number;
}

const Table: React.FC< TableProps > = ( {
    data,
    columns,
    rowSelection = {},
    onRowSelectionChange,
    defaultRowsPerPage = 10,
    bulkActionComp,
    realtimeFilter,
    searchFilter,
    actionButton,
    pageCount,
    pagination,
    onPaginationChange,
    categoryFilter,
    languageFilter,
    autoLoading,
    handlePagination,
    perPageOption,
    successMsg,
    expandElement,
    expandedRows,
    onRowClick,
    totalCounts = 0,
    defaultCounts = 'all',
} ) => {
    const [ sorting, setSorting ] = useState< SortingState >( [] );
    const [ loading, setLoading ] = useState< boolean >( false );
    const [ filterData, setFilterData ] = useState< UnknownRecord >( {} );

    // Counter variable for cooldown effect
    const counter = useRef( 0 );
    const counterId = useRef< ReturnType< typeof setInterval > | null >( null );

    const [ windowWidth, setWindowWidth ] = useState( window.innerWidth );

    useEffect( () => {
        const handleResize = () => setWindowWidth( window.innerWidth );
        window.addEventListener( 'resize', handleResize );
        return () => window.removeEventListener( 'resize', handleResize );
    }, [] );

    // Hide some columns if screen is small
    const isSmallScreen = windowWidth < 768;

    // Assume first column is 'select', keep that always
    const visibleColumns = isSmallScreen ? columns.slice( 0, 3 ) : columns;

    const getHiddenColumns = ( row: Row< TableRow > ) => {
        return row
            .getVisibleCells()
            .filter(
                ( cell: Cell< TableRow, unknown > ) =>
                    ! visibleColumns.find(
                        ( col ) =>
                            col.id === cell.column.id ||
                            col.header === cell.column.id
                    )
            );
    };

    // Function that handles filter changes.
    const handleFilterChange = ( key: string, value: unknown ) => {
        setFilterData( ( prevData ) => ( {
            ...prevData,
            [ key ]: value,
        } ) );
    };

    useEffect( () => {
        // Check if filter data is empty then this effect is for first time rendering.
        // Do nothing in this case.
        if ( Object.keys( filterData ).length === 0 ) {
            return;
        }
        // Set counter by penalti
        counter.current = PENALTY;
        // Clear previous counter.
        if ( counterId.current ) {
            clearInterval( counterId.current );
        }
        // Create new interval
        const intervalId = setInterval( () => {
            counter.current -= COOLDOWN;
            // Cooldown compleate time for db request.
            if ( counter.current < 0 ) {
                // Set the loading
                if ( autoLoading ) {
                    setLoading( true );
                }
                // Call filter function
                if ( handlePagination ) {
                    handlePagination( defaultRowsPerPage, 1, filterData );
                }
                clearInterval( intervalId );
                counterId.current = null;
            }
        }, 50 );
        // Store the interval id.
        counterId.current = intervalId;
    }, [ filterData, autoLoading, defaultRowsPerPage ] );

    useEffect( () => {
        setLoading( data === null );
    }, [ data ] );

    const flattenedData: TableRow[] = [];

    ( ( data as ProductWithVariations[] | null ) || [] ).forEach(
        ( product ) => {
            flattenedData.push( product );

            if ( product.variation && typeof product.variation === 'object' ) {
                Object.values( product.variation ).forEach(
                    ( variation: TableRow ) => {
                        flattenedData.push( {
                            ...variation,
                            isVariation: true,
                            parentId: product.id,
                        } );
                    }
                );
            }
        }
    );

    const table = useReactTable( {
        data: flattenedData,
        columns,
        state: {
            rowSelection,
            sorting,
            ...( pagination ? { pagination } : {} ),
        },
        enableRowSelection: true,
        manualPagination: true,
        manualSorting: true,
        pageCount,
        onPaginationChange,
        onRowSelectionChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: ( newSorting: Updater< SortingState > ) => {
            setSorting( newSorting );

            // Extract sorting information and update filterData
            // This will trigger the existing useEffect that handles API calls
            const sortingArray =
                typeof newSorting === 'function'
                    ? newSorting( table.getState().sorting )
                    : newSorting;

            const sortingObj = sortingArray[ 0 ];
            const orderBy = sortingObj?.id || '';
            const order = sortingObj?.desc ? 'desc' : 'asc';

            // Update filterData with sorting parameters
            // This will trigger the existing useEffect that calls handlePagination
            setFilterData( ( prevData ) => ( {
                ...prevData,
                orderBy,
                order,
            } ) );
        },
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    } );

    const typeCountActive = filterData.categoryFilter || defaultCounts;
    const typeLanguageCountActive = filterData.languageFilter || defaultCounts;
    const isFilterLoading = categoryFilter === null;
    return (
        <>
            { ( categoryFilter?.length > 0 ||
                searchFilter ||
                actionButton ) && (
                <div className="admin-top-filter">
                    <div className="filter-wrapper">
                        { categoryFilter === null ? (
                            <>
                                <div className="filter-item">
                                    { ' ' }
                                    <Skeleton
                                        variant="text"
                                        width={ 20 }
                                    />{ ' ' }
                                </div>
                                <div className="filter-item">
                                    <Skeleton variant="text" width={ 30 } />
                                </div>
                                <div className="filter-item">
                                    { ' ' }
                                    <Skeleton variant="text" width={ 20 } />
                                </div>
                            </>
                        ) : (
                            categoryFilter?.map( ( countInfo, index ) => (
                                <div
                                    key={ index }
                                    role="button"
                                    tabIndex={ 0 }
                                    onClick={ () =>
                                        setFilterData( {
                                            categoryFilter: countInfo.key,
                                        } )
                                    }
                                    className={
                                        countInfo.key === typeCountActive
                                            ? 'filter-item active'
                                            : 'filter-item'
                                    }
                                >
                                    { `${ countInfo.name } (${ countInfo.count })` }
                                </div>
                            ) )
                        ) }
                    </div>

                    <div className="filter-wrapper">
                        { languageFilter?.length > 0 && (
                            <>
                                { languageFilter ? (
                                    languageFilter.length > 0 ? (
                                        <>
                                            { languageFilter.map(
                                                ( countInfo, index ) => (
                                                    <div
                                                        key={ index }
                                                        role="button"
                                                        tabIndex={ 0 }
                                                        onClick={ () =>
                                                            setFilterData( {
                                                                languageFilter:
                                                                    countInfo.key,
                                                            } )
                                                        }
                                                        className={
                                                            countInfo.key ===
                                                            typeLanguageCountActive
                                                                ? 'filter-item active'
                                                                : 'filter-item'
                                                        }
                                                    >
                                                        { `${ countInfo.name } (${ countInfo.count })` }
                                                    </div>
                                                )
                                            ) }
                                        </>
                                    ) : (
                                        <span>No types found</span>
                                    )
                                ) : (
                                    <>
                                        <Skeleton
                                            variant="text"
                                            width={ 100 }
                                        />
                                        <Skeleton
                                            variant="text"
                                            width={ 120 }
                                        />
                                        <Skeleton variant="text" width={ 90 } />
                                    </>
                                ) }
                            </>
                        ) }
                    </div>
                    <div className="table-action-wrapper">
                        { searchFilter && (
                            <div className="search-field">
                                { searchFilter?.map( ( filter ) => (
                                    <React.Fragment key={ filter.name }>
                                        { filter.render(
                                            handleFilterChange,
                                            filterData[ filter.name ]
                                        ) }
                                    </React.Fragment>
                                ) ) }
                            </div>
                        ) }
                        { actionButton && (
                            <div className="action-wrapper">
                                { actionButton?.map( ( filter ) => (
                                    <React.Fragment key={ filter.name }>
                                        { filter.render(
                                            handleFilterChange,
                                            filterData[ filter.name ]
                                        ) }
                                    </React.Fragment>
                                ) ) }
                            </div>
                        ) }
                    </div>
                </div>
            ) }

            { loading ? (
                <LoadingTable />
            ) : (
                <>
                    { data?.length === 0 && (
                        <div className="no-data">
                            <p>There are no records to display</p>
                        </div>
                    ) }
                    { ( data?.length as number ) > 0 && (
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead className="admin-table-header">
                                    { table
                                        .getHeaderGroups()
                                        .map( ( headerGroup ) => (
                                            <tr
                                                key={ headerGroup.id }
                                                className="header-row"
                                            >
                                                { headerGroup.headers
                                                    .filter( ( header ) =>
                                                        visibleColumns.find(
                                                            ( col ) =>
                                                                col.id ===
                                                                    header
                                                                        .column
                                                                        .id ||
                                                                col.header ===
                                                                    header
                                                                        .column
                                                                        .id
                                                        )
                                                    )
                                                    .map( ( header ) => (
                                                        <th
                                                            key={ header.id }
                                                            onClick={ ( e ) => {
                                                                if (
                                                                    ! header.column.getCanSort()
                                                                ) {
                                                                    return;
                                                                }

                                                                const handler =
                                                                    header.column.getToggleSortingHandler();
                                                                if (
                                                                    ! handler
                                                                ) {
                                                                    return;
                                                                }

                                                                handler( e );
                                                            } }
                                                            className={ [
                                                                'header-col',
                                                                header.column.getCanSort()
                                                                    ? 'sortable'
                                                                    : null,
                                                                header.column.id
                                                                    ? `${ header.column.id }`
                                                                    : null,
                                                            ]
                                                                .filter(
                                                                    Boolean
                                                                )
                                                                .join( ' ' ) }
                                                        >
                                                            { flexRender(
                                                                header.column
                                                                    .columnDef
                                                                    .header,
                                                                header.getContext()
                                                            ) }
                                                            { header.column.getCanSort() && (
                                                                <span className="sort-icon">
                                                                    { header.column.getIsSorted() ===
                                                                        'asc' &&
                                                                        '▲' }
                                                                    { header.column.getIsSorted() ===
                                                                        'desc' &&
                                                                        '▼' }
                                                                    { ! header.column.getIsSorted() &&
                                                                        '⇅' }
                                                                </span>
                                                            ) }
                                                        </th>
                                                    ) ) }
                                                { isSmallScreen && <th></th> }
                                            </tr>
                                        ) ) }
                                </thead>
                                <tbody className="admin-table-body">
                                    { table.getRowModel().rows.map( ( row ) => {
                                        const product = row.original;
                                        const isVariation = product.isVariation;
                                        const productId = product.id;
                                        const parentId = product.parentId;

                                        // Show variation only if its parent is expanded
                                        if (
                                            isVariation &&
                                            ! expandedRows?.[
                                                parentId as number
                                            ]
                                        ) {
                                            return null;
                                        }

                                        return (
                                            <tr
                                                key={ productId as number }
                                                className={ `admin-row ${
                                                    isVariation
                                                        ? 'variation-row'
                                                        : ''
                                                } ${
                                                    product.type === 'Variable'
                                                        ? 'variable'
                                                        : 'simple'
                                                } ${
                                                    expandElement?.[
                                                        productId as number
                                                    ]
                                                        ? 'active'
                                                        : ''
                                                } ${
                                                    productId
                                                        ? `row-${ productId }`
                                                        : ''
                                                }` }
                                                onClick={ () =>
                                                    onRowClick?.( row.original )
                                                }
                                            >
                                                { row
                                                    .getVisibleCells()
                                                    .filter( ( cell ) =>
                                                        visibleColumns.find(
                                                            ( col ) =>
                                                                col.id ===
                                                                    cell.column
                                                                        .id ||
                                                                col.header ===
                                                                    cell.column
                                                                        .id
                                                        )
                                                    )
                                                    .map( ( cell ) => (
                                                        <td
                                                            key={ cell.id }
                                                            className={ [
                                                                'admin-column',
                                                                cell.column.id
                                                                    ? `${ cell.column.id }`
                                                                    : null,
                                                            ]
                                                                .filter(
                                                                    Boolean
                                                                )
                                                                .join( ' ' ) }
                                                            onClick={ ( e ) => {
                                                                const target =
                                                                    e.target as HTMLElement;
                                                                // Prevent row click if clicking on an interactive element
                                                                if (
                                                                    [
                                                                        'BUTTON',
                                                                        'INPUT',
                                                                        'SELECT',
                                                                        'LABEL',
                                                                        'TEXTAREA',
                                                                    ].includes(
                                                                        target.tagName
                                                                    )
                                                                ) {
                                                                    e.stopPropagation();
                                                                    return;
                                                                }
                                                            } }
                                                        >
                                                            { flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext()
                                                            ) }
                                                        </td>
                                                    ) ) }

                                                { isSmallScreen && (
                                                    <td className="responsive-cell">
                                                        <details>
                                                            <summary></summary>
                                                            <ul className="text-sm">
                                                                { getHiddenColumns(
                                                                    row
                                                                ).map(
                                                                    (
                                                                        cell: Cell<
                                                                            TableRow,
                                                                            unknown
                                                                        >
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                cell.id
                                                                            }
                                                                        >
                                                                            { flexRender(
                                                                                cell
                                                                                    .column
                                                                                    .columnDef
                                                                                    .cell,
                                                                                cell.getContext()
                                                                            ) }
                                                                        </li>
                                                                    )
                                                                ) }
                                                            </ul>
                                                        </details>
                                                    </td>
                                                ) }
                                            </tr>
                                        );
                                    } ) }
                                </tbody>
                            </table>

                            { /* Pagination Controls */ }
                            { pagination && pageCount && perPageOption && (
                                <>
                                    <div className="admin-pagination">
                                        <div className="pagination-number-wrapper">
                                            <div className="show-section">
                                                { `Showing ${
                                                    pagination.pageIndex *
                                                        pagination.pageSize +
                                                    1
                                                } to ${ Math.min(
                                                    ( pagination.pageIndex +
                                                        1 ) *
                                                        pagination.pageSize,
                                                    totalCounts
                                                ) } of ${ totalCounts } entries. ` }
                                            </div>
                                            { totalCounts > 10 && (
                                                <div className="showing-number">
                                                    Show
                                                    <select
                                                        value={
                                                            table.getState()
                                                                .pagination
                                                                .pageSize
                                                        }
                                                        onChange={ ( e ) =>
                                                            table.setPageSize(
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                    >
                                                        { perPageOption.map(
                                                            ( size ) => (
                                                                <option
                                                                    key={ size }
                                                                    value={
                                                                        size
                                                                    }
                                                                >
                                                                    { size }
                                                                </option>
                                                            )
                                                        ) }
                                                    </select>
                                                    entries
                                                </div>
                                            ) }
                                        </div>
                                        { totalCounts > pagination.pageSize && (
                                            <div className="pagination-arrow">
                                                <span
                                                    tabIndex={ 0 }
                                                    className={ `${
                                                        ! table.getCanPreviousPage()
                                                            ? 'pagination-button-disabled'
                                                            : ''
                                                    }` }
                                                    onClick={ () => {
                                                        if (
                                                            ! table.getCanPreviousPage()
                                                        ) {
                                                            return;
                                                        }
                                                        table.setPageIndex( 0 );
                                                    } }
                                                >
                                                    <i className="admin-font adminfont-pagination-prev-arrow"></i>
                                                </span>
                                                <span
                                                    tabIndex={ 0 }
                                                    className={ `${
                                                        ! table.getCanPreviousPage()
                                                            ? 'pagination-button-disabled'
                                                            : ''
                                                    }` }
                                                    onClick={ () => {
                                                        if (
                                                            ! table.getCanPreviousPage()
                                                        ) {
                                                            return;
                                                        }
                                                        table.previousPage();
                                                    } }
                                                >
                                                    <i className="admin-font adminfont-pagination-left-arrow"></i>
                                                </span>
                                                <div className="pagination">
                                                    { Array.from(
                                                        { length: pageCount },
                                                        ( _, i ) => (
                                                            <button
                                                                key={ i }
                                                                className={ `number-btn ${
                                                                    table.getState()
                                                                        .pagination
                                                                        .pageIndex ===
                                                                    i
                                                                        ? 'active'
                                                                        : ''
                                                                }` }
                                                                onClick={ () =>
                                                                    table.setPageIndex(
                                                                        i
                                                                    )
                                                                }
                                                            >
                                                                { i + 1 }
                                                            </button>
                                                        )
                                                    ) }
                                                </div>

                                                <span
                                                    tabIndex={ 0 }
                                                    className={ `${
                                                        ! table.getCanNextPage()
                                                            ? 'pagination-button-disabled'
                                                            : ''
                                                    }` }
                                                    onClick={ () => {
                                                        if (
                                                            ! table.getCanNextPage()
                                                        ) {
                                                            return;
                                                        }
                                                        table.nextPage();
                                                    } }
                                                >
                                                    <i className="admin-font adminfont-pagination-right-arrow"></i>
                                                </span>
                                                <span
                                                    tabIndex={ 0 }
                                                    className={ `${
                                                        ! table.getCanNextPage()
                                                            ? 'pagination-button-disabled'
                                                            : ''
                                                    }` }
                                                    onClick={ () => {
                                                        if (
                                                            ! table.getCanNextPage()
                                                        ) {
                                                            return;
                                                        }
                                                        table.setPageIndex(
                                                            pageCount - 1
                                                        );
                                                    } }
                                                >
                                                    <i className="admin-font adminfont-pagination-next-arrow"></i>
                                                </span>
                                            </div>
                                        ) }
                                    </div>
                                </>
                            ) }
                        </div>
                    ) }
                    { Object.keys( rowSelection || {} ).length >= 2 ? (
                        <div className="admin-filter-wrapper ">
                            <div className="wrap-bulk-all-date bulk">
                                <div className="action-item count">
                                    <button className="admin-btn">
                                        <span>
                                            {
                                                Object.keys( rowSelection )
                                                    .length
                                            }
                                        </span>
                                        Rows selected
                                        <i
                                            onClick={ () =>
                                                onRowSelectionChange?.( {} )
                                            }
                                            className="adminfont-close"
                                        ></i>
                                    </button>
                                </div>
                                <div className="action-item">
                                    <button
                                        className="admin-btn"
                                        onClick={ () =>
                                            table.toggleAllRowsSelected(
                                                ! table.getIsAllRowsSelected()
                                            )
                                        }
                                    >
                                        <i
                                            className={
                                                table.getIsAllRowsSelected()
                                                    ? 'adminfont-close'
                                                    : 'adminfont-active'
                                            }
                                        ></i>
                                        { table.getIsAllRowsSelected()
                                            ? 'Deselect all'
                                            : 'Select all' }
                                    </button>
                                </div>
                                { bulkActionComp && bulkActionComp() }
                            </div>
                        </div>
                    ) : (
                        <div className="admin-filter-wrapper ">
                            { ( data?.length !== 0 || counter.current < 0 ) &&
                                realtimeFilter &&
                                realtimeFilter.length > 0 && (
                                    <div className="wrap-bulk-all-date filter">
                                        <span className="title">
                                            <i className="adminfont-filter"></i>{ ' ' }
                                            Filter
                                        </span>
                                        { realtimeFilter?.map( ( filter ) => (
                                            <React.Fragment key={ filter.name }>
                                                { filter.render(
                                                    handleFilterChange,
                                                    filterData[ filter.name ]
                                                ) }
                                            </React.Fragment>
                                        ) ) }
                                    </div>
                                ) }

                            { /* Show Reset button only if filters are applied */ }
                            { ( Object.keys( filterData ).length > 0 ||
                                counter.current < 0 ) && (
                                <div className="reset-btn">
                                    <span
                                        onClick={ () => {
                                            setFilterData( {} ); // clear all filters
                                            onRowSelectionChange?.( {} ); // clear row selection if any
                                            if ( handlePagination ) {
                                                handlePagination(
                                                    defaultRowsPerPage,
                                                    1,
                                                    {}
                                                );
                                            }
                                        } }
                                        className="admin-badge red"
                                    >
                                        <i className="adminfont-refresh"></i>{ ' ' }
                                        Reset
                                    </span>
                                </div>
                            ) }
                        </div>
                    ) }
                    { successMsg && (
                        <div className="admin-notice-display-title">
                            <i className="admin-font adminfont-icon-yes"></i>
                            { successMsg }
                        </div>
                    ) }
                </>
            ) }
        </>
    );
};

export default Table;
