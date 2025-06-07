import { ReactNode, useEffect, useState } from "react";
import Table from "../src/components/Table";
import { ColumnDef } from "@tanstack/react-table";
import { TableCell } from "../src/components/Table"; // Remove incorrect import

interface RealtimeFilter {
    name: string;
    render: (
        updateFilter: ( key: string, value: any ) => void,
        filterValue: any
    ) => ReactNode;
}

export default {
    title: "Zyra/Components/Table",
    component: Table,
};

/**
 * Static Data for the table
 */
const dataData = [
    {
        date: "2025-06-04",
        email: "user1@example.com",
        image: "https://example.com/avatar1.png",
        product: "Product A",
        product_id: 1,
        reg_user: "User1",
        status: "active",
        status_key: "active",
        user_link: "https://example.com/user/1",
    },
    {
        date: "2025-06-03",
        email: "user2@example.com",
        image: "https://example.com/avatar2.png",
        product: "Product B",
        product_id: 2,
        reg_user: "User2",
        status: "inactive",
        status_key: "inactive",
        user_link: "https://example.com/user/2",
    },
    {
        date: "2025-06-02",
        email: "user3@example.com",
        image: "https://example.com/avatar3.png",
        product: "Product C",
        product_id: 3,
        reg_user: "User3",
        status: "active",
        status_key: "active",
        user_link: "https://example.com/user/3",
    },
    {
        date: "2025-06-01",
        email: "user4@example.com",
        image: "https://example.com/avatar4.png",
        product: "Product D",
        product_id: 4,
        reg_user: "User4",
        status: "inactive",
        status_key: "inactive",
        user_link: "https://example.com/user/4",
    },
    {
        date: "2025-05-31",
        email: "user5@example.com",
        image: "https://example.com/avatar5.png",
        product: "Product E",
        product_id: 5,
        reg_user: "User5",
        status: "active",
        status_key: "active",
        user_link: "https://example.com/user/5",
    },
    {
        date: "2025-05-30",
        email: "user6@example.com",
        image: "https://example.com/avatar6.png",
        product: "Product F",
        product_id: 6,
        reg_user: "User6",
        status: "active",
        status_key: "active",
        user_link: "https://example.com/user/6",
    },
    {
        date: "2025-05-29",
        email: "user7@example.com",
        image: "https://example.com/avatar7.png",
        product: "Product G",
        product_id: 7,
        reg_user: "User7",
        status: "inactive",
        status_key: "inactive",
        user_link: "https://example.com/user/7",
    },
    {
        date: "2025-05-28",
        email: "user8@example.com",
        image: "https://example.com/avatar8.png",
        product: "Product H",
        product_id: 8,
        reg_user: "User8",
        status: "active",
        status_key: "active",
        user_link: "https://example.com/user/8",
    },
    {
        date: "2025-05-27",
        email: "user9@example.com",
        image: "https://example.com/avatar9.png",
        product: "Product I",
        product_id: 9,
        reg_user: "User9",
        status: "active",
        status_key: "active",
        user_link: "https://example.com/user/9",
    },
    {
        date: "2025-05-26",
        email: "user10@example.com",
        image: "https://example.com/avatar10.png",
        product: "Product J",
        product_id: 10,
        reg_user: "User10",
        status: "inactive",
        status_key: "inactive",
        user_link: "https://example.com/user/10",
    },
];

export const TestTable = () => {
    const [ data, setData ] = useState( dataData );
    /**
     * This is needed for row selection.
     */
    const [ rowSelection, setRowSelection ] = useState<
        Record< string, boolean >
    >( {} );
    const handleSelectChange = ( val: string ) => {
        if ( val === "" ) {
            setData( dataData );
            return;
        }
        const filterData = dataData.filter( ( item ) => item.status === val );
        setData( filterData );
    };

    const handleFilterSearch = ( filterData: {
        typeCount: string;
        searchAction: string;
        searchField: string;
    } ) => {
        console.log( "Filter data:", filterData );
        if ( filterData.typeCount ) {
            console.log( "Filtering by type count:", filterData.typeCount );
            handleSelectChange( filterData.typeCount );
            return;
        }

        if ( ! filterData.searchAction || ! filterData.searchField ) {
            console.log( "No search criteria provided." );
            setData( dataData );
            return;
        }

        const filteredResults = dataData.filter( ( item ) => {
            const itemValue = item[ filterData.searchAction ];

            if ( typeof itemValue === "string" ) {
                return itemValue
                    .toLowerCase()
                    .includes( filterData.searchField.toLowerCase() );
            }

            return itemValue === filterData.searchField;
        } );
        setData( filteredResults );
    };

    /**
     * Define the columns for the table.
     * This is for Non Editable Table
     */
    const columnsData: ColumnDef< Record< string, any >, any >[] = [
        {
            // Checkbox Column for Row Selection
            id: "select",
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
            header: "Avatar",
            cell: ( { row } ) => (
                <TableCell
                    title="Image"
                    fieldValue={ row.original.image }
                    header="Image Header"
                >
                    <img
                        src={ row.original.image }
                        alt="avatar"
                        className="h-10 w-10 rounded-full object-cover"
                    />
                </TableCell>
            ),
        },
        /**
         * This is a editable column for status.
         * for editable column pass type in TableCell
         */
        {
            header: "Date",
            cell: ( { row } ) => (
                <TableCell
                    title="Date"
                    type="text"
                    fieldValue={ row.original.date }
                    header="Date Header"
                >
                    <p>{ row.original.date }</p>
                </TableCell>
            ),
        },
        {
            header: "Email",
            cell: ( { row } ) => (
                <TableCell
                    title="Email"
                    fieldValue={ row.original.email }
                    header="Email Header"
                >
                    <p>{ row.original.email }</p>
                </TableCell>
            ),
        },
        {
            header: "Product",
            cell: ( { row } ) => (
                <TableCell
                    title="Product"
                    fieldValue={ row.original.product }
                    header="Product Header"
                >
                    <p>{ row.original.product }</p>
                </TableCell>
            ),
        },
        {
            header: "Product ID",
            cell: ( { row } ) => (
                <TableCell
                    title="Product ID"
                    fieldValue={ String( row.original.product_id ) }
                    header="Product ID Header"
                >
                    <p>{ row.original.product_id }</p>
                </TableCell>
            ),
        },
        {
            header: "Registered User",
            cell: ( { row } ) => (
                <TableCell
                    title="Registered User"
                    fieldValue={ row.original.reg_user }
                    header="Registered User Header"
                >
                    <p>{ row.original.reg_user }</p>
                </TableCell>
            ),
        },
        /**
         * This is a editable column for status.
         * for editable column pass type in TableCell
         */
        {
            header: "Status",
            cell: ( { row } ) => (
                <TableCell
                    title="Status"
                    fieldValue={ row.original.status }
                    type="dropdown"
                    header={ {
                        options: { active: "Active", inactive: "Inactive" },
                    } }
                >
                    <span
                        className={ `px-2 py-1 rounded text-white ${
                            row.original.status === "active"
                                ? "bg-green-500"
                                : "bg-red-500"
                        }` }
                    >
                        { row.original.status }
                    </span>
                </TableCell>
            ),
        },
        {
            header: "User Link",
            cell: ( { row } ) => (
                <TableCell
                    title="User Link"
                    fieldValue={ row.original.user_link }
                    header="User Link Header"
                >
                    <a
                        href={ row.original.user_link }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        View User
                    </a>
                </TableCell>
            ),
        },
    ];

    /**
     * Define the realtime filters for the table.
     *
     */
    const realtimeFilter: RealtimeFilter[] = [
        {
            name: "Product Type",
            render: () => {
                return (
                    <div className="subscriber-bulk-action bulk-action">
                        <select
                            name="productType"
                            onChange={ ( event ) => {
                                handleSelectChange( event.target.value );
                            } }
                        >
                            <option value="">Product Type</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                );
            },
        },
        {
            name: "searchField",
            render: ( updateFilter = () => {}, filterValue = "" ) => (
                <div className="admin-header-search-section search-section">
                    <input
                        name="searchField"
                        type="text"
                        placeholder="Search..."
                        onChange={ ( e ) =>
                            updateFilter( "searchField", e.target.value )
                        }
                        value={ filterValue }
                    />
                </div>
            ),
        },
        {
            name: "searchAction",
            render: ( updateFilter = () => {}, filterValue = "" ) => (
                <div className="admin-header-search-section searchAction">
                    <select
                        name="searchAction"
                        onChange={ ( e ) =>
                            updateFilter( "searchAction", e.target.value )
                        }
                        value={ filterValue }
                    >
                        <option value="">Select</option>
                        <option value="product">Product Name</option>
                        <option value="email">Email</option>
                    </select>
                </div>
            ),
        },
    ];

    /**
     * Props for the Table component.
     */
    const demoTableProps = {
        data: data,
        columns: columnsData,
        rowSelection: rowSelection,
        onRowSelectionChange: setRowSelection,
        defaultRowsPerPage: 10,
        realtimeFilter: realtimeFilter,
        bulkActionComp: () => <button>Bulk Action</button>,
        pageCount: 1,
        pagination: {
            pageIndex: 0,
            pageSize: 10,
        },
        onPaginationChange: ( updater ) => {
            console.log( "Pagination updated:", updater );
        },
        typeCounts: [
            {
                key: "active",
                name: "Active",
                count: 6,
            },
            {
                key: "inactive",
                name: "Inactive",
                count: 4,
            },
        ],
        autoLoading: false,
        handlePagination: ( rowsPerPage, pageIndex, filterData ) => {
            handleFilterSearch( filterData );
        },
        perPageOption: [ 10, 20, 50 ],
    };

    return <Table { ...demoTableProps } />;
};
