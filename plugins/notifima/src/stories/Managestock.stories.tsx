(globalThis as any).appLocalizer = {
    khali_dabba: false,
};

import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Table, TableCell } from "zyra";
import { ColumnDef } from "@tanstack/react-table";
import Managestock from "../components/Managestock/Managestock";
import "zyra/build/index.css";

export default {
    title: "Notifima/Components/Managestock",
    component: Managestock,
};

export const TestFreeManagestock = () => {
    (globalThis as any).appLocalizer.khali_dabba = false;
    return <Managestock />;
};

const ManageStockTable = () => {
    const columnsData: ColumnDef<Record<string, any>, any>[] = [
        {
            id: "date",
            header: "Date",
            cell: ({ row }) => {
                return (
                    <TableCell
                        key="date"
                        title="This is Date"
                        type="text"
                        header="no header"
                        fieldValue="25.02.2025"
                        onChange={
                            (e) => {
                                console.log("changed...");
                            } // ✅ Now uses correct rowId
                        }
                    >
                        <p data-id={row.id}>{row.original.date}</p>
                    </TableCell>
                );
            },
        },
        {
            id: "email",
            header: "Email",
            cell: "email",
        },
        {
            id: "image",
            header: "Avatar",
            cell: ({ row }) => (
                <img
                    src={row.original.image}
                    alt="avatar"
                    className="h-10 w-10 rounded-full object-cover"
                />
            ),
        },
        {
            id: "product",
            header: "Product",
            cell: "product",
        },
        {
            id: "product_id",
            header: "Product ID",
            cell: "product_id",
        },
        {
            id: "reg_user",
            header: "Registered User",
            cell: "reg_user",
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => (
                <span
                    className={`px-2 py-1 rounded text-white ${
                        row.original.status === "active"
                            ? "bg-green-500"
                            : "bg-red-500"
                    }`}
                >
                    {row.original.status}
                </span>
            ),
        },
        {
            id: "status_key",
            header: "User Link",
            cell: ({ row }) => (
                <a
                    href={row.original.user_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                >
                    View User
                </a>
            ),
        },
    ];
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
        columns: columnsData,
        rowSelection: {
            "1": true,
        },
        onRowSelectionChange: (updater: any) => {
            console.log("Row selection changed:", updater);
        },
        defaultRowsPerPage: 10,
        realtimeFilter: [
            {
                name: "Status Filter",
                render: (updateFilter: any, filterValue: any) => (
                    <select
                        value={filterValue}
                        onChange={(e) => updateFilter("status", e.target.value)}
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
        onPaginationChange: (updater: any) => {
            console.log("Pagination updated:", updater);
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
        handlePagination: (
            rowsPerPage: any,
            pageIndex: any,
            filterData: any
        ) => {
            console.log(
                "Handle pagination:",
                rowsPerPage,
                pageIndex,
                filterData
            );
        },
        perPageOption: [10, 20, 50],
        successMsg: "Subscribers loaded successfully.",
    };
    return (
        <>
            <div className="admin-middle-container-wrapper">
                <div className="title-section">
                    <p>Inventory Manager</p>
                    <div className="stock-reports-download">
                        <button className="import-export-btn">
                            <div>
                                <div className="wp-menu-image dashicons-before dashicons-download"></div>
                                Import
                            </div>
                        </button>
                        <button className="import-export-btn">
                            <div>
                                <div className="wp-menu-image dashicons-before dashicons-upload"></div>
                                Export
                            </div>
                        </button>
                    </div>
                </div>
                <Table {...demoTableProps} />
            </div>
        </>
    );
};

export const TestProManagestock = () => {
    (globalThis as any).appLocalizer.khali_dabba = true;
    useEffect(() => {
        // This will run after the component is mounted and DOM is available
        const tableDiv = document.getElementById("manage_stock_table");
        if (tableDiv) {
            const root = createRoot(tableDiv);
            root.render(<ManageStockTable />);
        } else {
            console.error('Element with id "manage_stock_table" not found.');
        }
    }, []);
    return <Managestock />;
};
