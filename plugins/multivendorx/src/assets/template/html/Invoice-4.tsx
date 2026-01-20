import React from "react";

interface Row {
  item: string;
  seller?: string;
  quantity?: number | string;
  price?: string;
  total?: string;
}

interface Props {
  invoiceRows?: Row[];
}

const InvoiceDOM4: React.FC<Props> = ({ invoiceRows }) => {
  const rows: Row[] = invoiceRows || [
    { item: "Beanie with Logo", seller: "Test Shop", quantity: 1, price: "$250.00", total: "$200.00" },
    { item: "New Dress", seller: "Test Shop", quantity: 1, price: "$500.00", total: "$450.00" },
    { item: "Ninja Shirt", seller: "Test Shop", quantity: 1, price: "$550.00", total: "$550.00" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f5f5f5", padding: 20 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", backgroundColor: "#fff", padding: 40, boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 30, borderBottom: "3px solid #2c3e50", paddingBottom: 20 }}>
          <h1 style={{ color: "#2c3e50", fontSize: 36, marginBottom: 10 }}>INVOICE</h1>
        </div>

        {/* Info Sections */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#2c3e50", marginBottom: 10, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Invoice Details</h3>
            <p><strong>Invoice No:</strong> 201815311526476267</p>
            <p><strong>Invoice Date:</strong> May 16, 2018</p>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#2c3e50", marginBottom: 10, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Order Details</h3>
            <p><strong>Order Number:</strong> 2015</p>
            <p><strong>Order Date:</strong> 01/03/2018</p>
          </div>
        </div>

        {/* Invoice To */}
        <div style={{ backgroundColor: "#f8f9fa", padding: 20, marginBottom: 30, borderLeft: "4px solid #2c3e50" }}>
          <h3 style={{ color: "#2c3e50", marginBottom: 10, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Invoice To</h3>
          <p><strong>ABC Infotech</strong></p>
          <p>BB-164, BB Block, Sector 1</p>
          <p>Salt Lake City, Kolkata</p>
          <p>West Bengal 700064</p>
        </div>

        {/* Payment Method */}
        <div style={{ backgroundColor: "#e8f4f8", padding: "10px 15px", marginBottom: 20, borderRadius: 4, display: "inline-block" }}>
          <strong>Payment Method:</strong> Cash on Delivery
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
          <thead style={{ backgroundColor: "#2c3e50", color: "#fff" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left", fontWeight: 600, fontSize: 13 }}>Item</th>
              <th style={{ padding: 12, textAlign: "center", fontWeight: 600, fontSize: 13 }}>Quantity</th>
              <th style={{ padding: 12, textAlign: "right", fontWeight: 600, fontSize: 13 }}>Price</th>
              <th style={{ padding: 12, textAlign: "right", fontWeight: 600, fontSize: 13 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                <td>
                  <div style={{ fontWeight: 600, color: "#2c3e50", marginBottom: 5 }}>{row.item}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>Sold By: {row.seller}</div>
                </td>
                <td style={{ textAlign: "center" }}>{row.quantity}</td>
                <td style={{ textAlign: "right" }}>{row.price}</td>
                <td style={{ textAlign: "right" }}>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginLeft: "auto", width: 300, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>Subtotal:<span>$1200.00</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>Tax (10%):<span>$135.00</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0 10px 0", fontSize: 18, fontWeight: "bold", color: "#2c3e50", borderBottom: "3px double #2c3e50" }}>Total:<span>$1335.00</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: 16, fontWeight: 600, color: "#27ae60" }}>Amount Paid:<span>$997.00</span></div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: "center", color: "#888", fontSize: 12, paddingTop: 20, borderTop: "1px solid #ddd" }}>
          Thank you for your business!
        </div>
      </div>
    </div>
  );
};

export default InvoiceDOM4;
