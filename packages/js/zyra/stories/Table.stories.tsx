import Table from "../src/components/Table";

export default {
    title: "Zyra/Components/Table",
    component: Table,
};

export const TestTable = () => {
    const demoTableProps = {
        data: [
            {
                date: "2025-06-04",
                email: "user@example.com",
                image: "https://example.com/avatar.png",
                product: "Product A",
                product_id: 1,
                reg_user: "User1",
                status: "active",
                status_key: "active",
                user_link: "https://example.com/user/1",
            },
        ],
        columns: [],
        rowSelection: {
            "1": true,
        },
        onRowSelectionChange: ( updater ) => {
            console.log( "Row selection changed:", updater );
        },
        defaultRowsPerPage: 10,
        realtimeFilter: [
            {
                name: "Status Filter",
                render: ( updateFilter, filterValue ) => (
                    <select
                        value={ filterValue }
                        onChange={ ( e ) =>
                            updateFilter( "status", e.target.value )
                        }
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                ),
            },
        ],
        bulkActionComp: () => <button>Bulk Action</button>,
        pageCount: 5,
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
                count: 12,
            },
            {
                key: "inactive",
                name: "Inactive",
                count: 8,
            },
        ],
        autoLoading: true,
        handlePagination: ( rowsPerPage, pageIndex, filterData ) => {
            console.log(
                "Handle pagination:",
                rowsPerPage,
                pageIndex,
                filterData
            );
        },
        perPageOption: [ 10, 20, 50 ],
        successMsg: "Subscribers loaded successfully.",
    };

    return <Table { ...demoTableProps } />;
};
