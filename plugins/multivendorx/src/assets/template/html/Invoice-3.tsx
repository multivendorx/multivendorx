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

const InvoiceDOM3: React.FC<Props> = ({ invoiceRows }) => {
  const rows: Row[] = invoiceRows || [
    { item: "Beanie with Logo", seller: "Test Shop", quantity: 1, price: "$250.00", total: "$200.00" },
    { item: "New Dress", seller: "Test Shop", quantity: 1, price: "$500.00", total: "$450.00" },
    { item: "Ninja Shirt", seller: "Test Shop", quantity: 1, price: "$550.00", total: "$550.00" },
  ];

  return (
    <div style={{ fontFamily: "Segoe UI, Arial, sans-serif", background: "#f4f6f8", padding: 40 }}>
      <div style={{ maxWidth: 850, background: "#fff", margin: "0 auto", borderRadius: 10, boxShadow: "0 4px 15px rgba(0,0,0,0.1)", padding: "40px 50px" }}>
        
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #0056b3", paddingBottom: 15, marginBottom: 30 }}>
          <div className="logo">
            <img src="logo.png" alt="Company Logo" style={{ width: 130 }} />
          </div>
          <div className="invoice-details" style={{ textAlign: "right" }}>
            <h1 style={{ margin: 0, color: "#0056b3", fontSize: 26 }}>INVOICE</h1>
            <p><strong>Invoice No:</strong> 201815311526476267</p>
            <p><strong>Invoice Date:</strong> May 16, 2018</p>
          </div>
        </header>

        {/* Info */}
        <section style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 25 }}>
          <div style={{ flex: "1 1 45%", fontSize: 14, color: "#444" }}>
            <p><strong>Order Number:</strong> 2015</p>
            <p><strong>Order Date:</strong> 01/03/2018</p>
            <p><strong>Payment Method:</strong> Cash on Delivery</p>
          </div>
          <div style={{ flex: "1 1 45%", fontSize: 14, color: "#444" }}>
            <h3 style={{ color: "#0056b3", fontSize: 16, marginBottom: 8 }}>Invoice To:</h3>
            <p><strong>ABC Infotech</strong></p>
            <p>BB-164, BB Block, Sector 1,</p>
            <p>Salt Lake City, Kolkata,</p>
            <p>West Bengal 700064</p>
          </div>
        </section>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>
                  {row.item}<br />
                  <span style={{ fontSize: 12, color: "#777" }}>Sold By: {row.seller}</span>
                </td>
                <td>{row.quantity}</td>
                <td>{row.price}</td>
                <td style={{ textAlign: "right" }}>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginTop: 25, display: "flex", justifyContent: "flex-end" }}>
          <table style={{ width: 300, borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td>Subtotal:</td>
                <td style={{ textAlign: "right" }}>$1200.00</td>
              </tr>
              <tr>
                <td>Tax (10%):</td>
                <td style={{ textAlign: "right" }}>$135.00</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, fontSize: 17 }}>Total:</td>
                <td style={{ textAlign: "right", fontWeight: 700, fontSize: 17 }}>$1335.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Paid Status */}
        <div style={{ background: "#e8f7e3", color: "#256029", fontWeight: 600, padding: 12, borderRadius: 8, textAlign: "center", marginTop: 30, fontSize: 15 }}>
          Amount Paid: $997.00 — Remaining Balance: $338.00
        </div>

        {/* Footer */}
        <footer style={{ textAlign: "center", fontSize: 13, color: "#999", marginTop: 35, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
          © 2018 ABC Infotech — Thank you for your business.
        </footer>
      </div>
    </div>
  );
};

export default InvoiceDOM3;