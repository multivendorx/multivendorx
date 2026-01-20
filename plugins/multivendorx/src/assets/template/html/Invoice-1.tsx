import React from "react";

interface Row {
  description: string;
  qty?: number | string;
  price?: string;
  amount?: string;
}

interface Props {
  invoiceRows?: Row[];
}

const InvoiceDOM2: React.FC<Props> = ({ invoiceRows }) => {
  const rows: Row[] = invoiceRows || [
    { description: "Website Design & Development", qty: 1, price: "$3,500.00", amount: "$3,500.00" },
    { description: "Hosting & Maintenance (1 Year)", qty: 1, price: "$800.00", amount: "$800.00" },
    { description: "Content Optimization", qty: 1, price: "$350.00", amount: "$350.00" },
    { description: "Discount", qty: "—", price: "—", amount: "−$150.00" },
  ];

  return (
    <div style={{ fontFamily: "Poppins, Arial, sans-serif", background: "#f7f9fb", padding: 40 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(90deg, #2563eb, #0ea5e9)", color: "#fff", padding: "40px 50px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: 1 }}>INVOICE</h1>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Bluewave Solutions</h2>
            <p style={{ margin: 4, fontSize: 13 }}>123 Business Street</p>
            <p style={{ margin: 4, fontSize: 13 }}>New York, NY 10001</p>
            <p style={{ margin: 4, fontSize: 13 }}>contact@bluewave.co | +1 555-123-4567</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "40px 50px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 30 }}>
            {/* Bill To */}
            <div style={{ flex: "1 1 45%", marginBottom: 20 }}>
              <h3 style={{ marginBottom: 8, fontSize: 16, color: "#2563eb" }}>Bill To:</h3>
              <p><strong>John Doe</strong></p>
              <p>456 Oak Avenue</p>
              <p>Los Angeles, CA 90012</p>
              <p>john.doe@email.com</p>
            </div>
            {/* Invoice Meta */}
            <div style={{ flex: "1 1 45%", marginBottom: 20 }}>
              <h3 style={{ marginBottom: 8, fontSize: 16, color: "#2563eb" }}>Invoice Details:</h3>
              <p><strong>Invoice #:</strong> INV-2025-103</p>
              <p><strong>Date:</strong> Oct 9, 2025</p>
              <p><strong>Due Date:</strong> Oct 23, 2025</p>
              <p><strong>Status:</strong> <span style={{ color: "#16a34a", fontWeight: 600 }}>Paid</span></p>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 10px", borderBottom: "1px solid #eee" }}>Description</th>
                <th style={{ textAlign: "left", padding: "12px 10px", borderBottom: "1px solid #eee" }}>Qty</th>
                <th style={{ textAlign: "left", padding: "12px 10px", borderBottom: "1px solid #eee" }}>Unit Price</th>
                <th style={{ textAlign: "right", padding: "12px 10px", borderBottom: "1px solid #eee" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>{row.description}</td>
                  <td>{row.qty}</td>
                  <td>{row.price}</td>
                  <td style={{ textAlign: "right" }}>{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ marginTop: 40, display: "flex", justifyContent: "flex-end" }}>
            <table style={{ width: 300, borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td style={{ textAlign: "right" }}>$4,500.00</td>
                </tr>
                <tr>
                  <td>Tax (10%)</td>
                  <td style={{ textAlign: "right" }}>$450.00</td>
                </tr>
                <tr>
                  <td><strong>Total</strong></td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontSize: 17 }}><strong>$4,950.00</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div style={{ marginTop: 50, fontSize: 13, color: "#666", borderTop: "1px dashed #ddd", paddingTop: 15 }}>
            <strong>Notes:</strong>
            <p>Thank you for your payment. We appreciate your business! Please contact us if you need any additional documents.</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#f8fafc", textAlign: "center", padding: 15, fontSize: 13, color: "#777", borderTop: "1px solid #e5e7eb" }}>
          © 2025 Bluewave Solutions — www.bluewave.co
        </div>
      </div>
    </div>
  );
};

export default InvoiceDOM2;
