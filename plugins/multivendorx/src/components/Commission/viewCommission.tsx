/* global appLocalizer */
import React, { useEffect } from "react";
import { __ } from "@wordpress/i18n";
import { CommonPopup, getApiLink, Table, TableCell } from "zyra";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";

// 👉 Type for an order line
interface OrderItem {
  id: number;
  name: string;
  sku: string;
  cost: string;
  discount?: string;
  qty: number;
  total: string;
}

interface ViewCommissionProps {
  open: boolean;
  onClose: () => void;
  commissionId?: number | null;
}

const ViewCommission: React.FC<ViewCommissionProps> = ({ open, onClose, commissionId }) => {
  // 👉 Demo data (replace later with API data if needed)
  const demoData: OrderItem[] = [
    {
      id: 1,
      name: "Charcoal Detox",
      sku: "8678",
      cost: "$95.00",
      discount: "-$5.00",
      qty: 1,
      total: "$95.00",
    },
    {
      id: 2,
      name: "Lavender Soap",
      sku: "9023",
      cost: "$12.00",
      qty: 2,
      total: "$24.00",
    },
  ];

  useEffect(() => {
    if (commissionId) {
        axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `commission/${commissionId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};

		});
    }
  }, [commissionId]);

  const popupColumns: ColumnDef<OrderItem>[] = [
    {
      id: "select",
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
      header: __("Product", "multivendorx"),
      cell: ({ row }) => (
        <TableCell title={row.original.name}>
          <div className="name">{row.original.name ?? "-"}</div>
          <div className="sub-text"> Sku: {row.original.sku ?? "-"} </div>
        </TableCell>
      ),
    },
    {
      header: __("Cost", "multivendorx"),
      cell: ({ row }) => (
        <TableCell title={row.original.cost}>{row.original.cost ?? "-"}</TableCell>
      ),
    },
    {
      header: __("Qty", "multivendorx"),
      cell: ({ row }) => (
        <TableCell title={row.original.qty.toString()}>{row.original.qty ?? "-"}</TableCell>
      ),
    },
    {
      header: __("Total", "multivendorx"),
      cell: ({ row }) => (
        <TableCell title={row.original.total}>{row.original.total ?? "-"}</TableCell>
      ),
    },
  ];

  return (
    <CommonPopup
      open={open}
      onClose={onClose}
      width="1200px"
      height="100%"
      header={
        <>
          <div className="title">
            <i className="adminlib-cart"></i>
            {__("View Commission", "multivendorx")}{" "}
            {commissionId ? `#${commissionId}` : ""} {/* ✅ show ID in header */}
          </div>
          <p>
            {__(
              "Details of this commission including vendor, order breakdown, and notes.",
              "multivendorx"
            )}
          </p>
          <i onClick={onClose} className="icon adminlib-close"></i>
        </>
      }
      footer={
        <>
          <div onClick={onClose} className="admin-btn btn-red">
            {__("Cancel", "multivendorx")}
          </div>
        </>
      }
    >
      <div className="content multi">
        {/* your existing code untouched */}
        <div className="section left">
          <div className="vendor-details">
            <div className="name">Joye Hop</div>
            <div className="details">
              <div className="email">
                <i className="adminlib-mail"></i>
                <b>Email:</b> test_vendor@test.com
              </div>
              <div className="method">
                <i className="adminlib-form-paypal-email"></i>
                <b>Payment Method:</b>{" "}
                <span className="admin-badge blue">Stripe Connect</span>
              </div>
            </div>
          </div>

          <div className="popup-divider"></div>

          <div className="heading">{__("Order Details", "multivendorx")}</div>
          <Table
            data={demoData}
            columns={popupColumns as ColumnDef<Record<string, any>, any>[]}
            rowSelection={{}}
            onRowSelectionChange={() => {}}
            defaultRowsPerPage={5}
          />

          <div className="heading">{__("Shipping", "multivendorx")}</div>
          <Table
            data={demoData}
            columns={popupColumns as ColumnDef<Record<string, any>, any>[]}
            rowSelection={{}}
            onRowSelectionChange={() => {}}
            defaultRowsPerPage={5}
          />
        </div>

        <div className="section right">
          <div className="heading">{__("Commission Overview", "multivendorx")}</div>
          <div className="commission-details">
            <div className="items">
              <div className="text">Associated Order</div>
              <div className="value">#501421</div>
            </div>
            <div className="items">
              <div className="text">Order Status</div>
              <div className="value">
                <span className="admin-badge yellow">On hold</span>
              </div>
            </div>
            <div className="items">
              <div className="text">Commission Status</div>
              <div className="value">
                <span className="admin-badge red">Unpaid</span>
              </div>
            </div>
            <div className="items">
              <div className="text">Commission Amount</div>
              <div className="value">$28.50</div>
            </div>
            <div className="items">
              <div className="text">Shipping</div>
              <div className="value">$28.50</div>
            </div>
            <div className="items">
              <div className="text">Tax</div>
              <div className="value">$28.50</div>
            </div>
          </div>

          <div className="popup-divider"></div>

          <div className="heading">{__("Commission Notes", "multivendorx")}</div>
          <div className="settings-metabox-note">
            <i className="adminlib-info"></i>
            <p>Commission for order (ID: 27297) is created.</p>
          </div>
        </div>
      </div>
    </CommonPopup>
  );
};

export default ViewCommission;
