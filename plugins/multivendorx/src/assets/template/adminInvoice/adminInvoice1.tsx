import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";

type Row = {
    seller: string;
    product: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
    tax: number;
    total: number;
};

interface Props {
    invoiceRows?: Row[];
    colors: {
        colorPrimary: string;
        colorSecondary: string;
        colorAccent: string;
        colorSupport: string;
    };
}

const adminInvoice1: React.FC<Props> = ({ invoiceRows, colors }) => {
    const rows: Row[] = invoiceRows || [
        {
            seller: "Premium Electronics",
            product: "Widget A - Premium Edition",
            qty: 2,
            unitPrice: 50,
            subtotal: 100,
            tax: 10,
            total: 110,
        },
        {
            seller: "Premium Electronics",
            product: "Widget B - Deluxe Model",
            qty: 1,
            unitPrice: 75,
            subtotal: 75,
            tax: 7.5,
            total: 82.5,
        },
        {
            seller: "Tech Accessories Co",
            product: "Premium USB Cable",
            qty: 2,
            unitPrice: 15,
            subtotal: 30,
            tax: 3,
            total: 33,
        },
    ];


    return (
        <Document>
            <Page
                size="A4"
                style={{
                    fontSize: 12,
                    fontFamily: "Helvetica",
                    backgroundColor: "#fff",
                    position: "relative"
                }}
            >
                <View>
                    {/* header start*/}
                    <View id='invoice-header' style={{ display: "flex", justifyContent: "space-between", flexDirection: "row", margin: "20px", paddingBottom: "20px", borderBottom: "1px solid #eee" }}>
                        {/* left section */}
                        <View id='invoice-header-left' style={{ display: "flex", justifyContent: "space-between", gap: 15, flexDirection: "row", alignItems: "flex-start" }}>
                            <View
                                style={{
                                    padding: 10,
                                    backgroundColor: colors.colorPrimary,
                                    fontSize: 25,
                                    fontWeight: 600,
                                    borderRadius: 4,
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: "#fff" }}>MS</Text>
                            </View>
                            <View style={{ display: "flex", gap: 5, flexDirection: "column" }}>
                                <Text id='company-name' style={{ fontSize: 18, fontWeight: 600 }} >Marketplace Solutions Inc.</Text>
                                <Text id='address'>789 Commerce Boulevard, Suite 500</Text>
                                <Text id='address'>San Francisco, CA 94102, United States</Text>
                                <Text style={{ fontSize: 12, color: "#555" }}>Tax ID: <Text style={{ fontWeight: 600 }}>US-TAX-123456789</Text></Text>
                                <Text style={{ fontSize: 12, color: "#555" }}>GST/VAT Number: <Text style={{ fontWeight: 600 }}>GST-US-987654321</Text></Text>
                                <Text style={{ fontSize: 12, color: "#555" }}>Business Registration: <Text style={{ fontWeight: 600 }}>BRN-2020-MKT-4567</Text></Text>
                            </View>
                        </View>  {/* left section end*/}

                        {/* right section */}
                        <View id='invoice-header-right'
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 6,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                }}
                            >
                                Marketplace Order Invoice
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Invoice #: <Text style={{ fontWeight: 600 }}>ADMIN-ORD-2026-0001</Text>
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Date: <Text style={{ fontWeight: 600 }}>22 Jan 2026</Text>
                            </Text>

                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Order Number: <Text style={{ fontWeight: 600 }}>ORD-20260122-101</Text>
                            </Text>
                            <Text style={{ fontSize: 12, color: "#555" }}>
                                Order Date: <Text style={{ fontWeight: 600 }}>22 Jan 2026</Text>
                            </Text>

                            <View
                                style={{
                                    marginTop: 8,
                                    padding: "4px 8px",
                                    backgroundColor: "#33920e69",
                                    borderRadius: 5,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        color: "#33920eff",
                                    }}
                                >
                                    Completed
                                </Text>
                            </View>
                        </View> {/* right section end */}
                    </View>
                    {/* header end*/}

                    {/* billing section start */}
                    <View id="billing-section" style={{ margin: "20px", display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "20px" }}>

                        <View id="left-details" style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%", padding: "10px", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "5px" }}>
                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, marginBottom: "5px", fontWeight: "bold" }}>Customer Details:</Text>
                            <Text style={{ fontSize: "12px", fontWeight: "bold" }}>John Smith</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Email: </Text>john.smith@email.com</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Phone: </Text>+1 (555) 123-4567</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Customer ID: </Text>CUST-20250315</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Customer Tax ID: </Text>TAX-CUST-567890</Text>

                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, margin: "5px 0", fontWeight: "bold" }}>Tax Information:</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Tax ID: </Text>US-TAX-123456789</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>GST/VAT Number: </Text>GST-US-987654321</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Business Registration: </Text>BRN-2020-MKT-4567</Text>
                            <Text style={{ fontSize: "10px" }}> <Text style={{ fontWeight: "bold" }}>Tax Jurisdiction: </Text>United States</Text>
                        </View>

                        <View id="left-details" style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%", padding: "10px", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "5px" }}>
                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, marginBottom: "5px", fontWeight: "bold" }}>Billing Address:</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>John Smith</Text>
                            <Text style={{ fontSize: "10px" }}>456 Customer Lane</Text>
                            <Text style={{ fontSize: "10px" }}>Manchester, M1 2AB</Text>
                            <Text style={{ fontSize: "10px" }}>United Kingdom</Text>

                            <Text style={{ fontSize: "14px", color: colors.colorPrimary, marginBottom: "5px", fontWeight: "bold" }}>Shipping Address:</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>John Smith</Text>
                            <Text style={{ fontSize: "10px" }}>456 Customer Lane</Text>
                            <Text style={{ fontSize: "10px" }}>Manchester, M1 2AB</Text>
                            <Text style={{ fontSize: "10px" }}>United Kingdom</Text>
                        </View>
                    </View>
                    {/* billing section end */}

                    {/* table section start */}
                    <View id="invoice-table-wrapper" style={{ margin: "20px", display: "flex", flexDirection: "column" }}>
                        <View id="invoice-table-header"
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                paddingVertical: 8,
                            }}
                        >
                            {/* Description */}
                            <View style={{ flex: 4 }}>
                                <Text style={{ fontWeight: 600 }}>Seller</Text>
                            </View>

                            <Text style={{ flex: 2, textAlign: "right", fontWeight: 600 }}>
                                Product / Service
                            </Text>
                            <Text style={{ flex: 2, textAlign: "right", fontWeight: 600 }}>
                               Qty
                            </Text>
                             <Text style={{ flex: 2, textAlign: "right", fontWeight: 600 }}>
                               Unit Price
                            </Text>
                             <Text style={{ flex: 2, textAlign: "right", fontWeight: 600 }}>
                               Subtotal
                            </Text>
                             <Text style={{ flex: 2, textAlign: "right", fontWeight: 600 }}>
                               Tax
                            </Text>
                            <Text
                                style={{
                                    flex: 2,
                                    textAlign: "right",
                                    fontWeight: 600,
                                }}
                            >
                                Amount
                            </Text>
                        </View>
                        {rows.map((row, index) => {
                            return (
                                <View id="invoice-table-row"
                                    key={index}
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        paddingVertical: 8,
                                        borderTop: "1px solid #eee",
                                    }}
                                >
                                    {/* Description */}
                                    <View style={{ flex: 4 }}>
                                        <Text>{row.seller}</Text>
                                    </View>

                                    {/* Unit Price */}
                                    <Text style={{ flex: 2, textAlign: "right" }}>
                                        {row.product}
                                    </Text>

                                    <Text style={{ flex: 2, textAlign: "right" }}>
                                        {row.qty}
                                    </Text>
                                    <Text style={{ flex: 2, textAlign: "right" }}>
                                        {row.unitPrice}
                                    </Text>
                                    <Text style={{ flex: 2, textAlign: "right" }}>
                                        {row.subtotal}
                                    </Text>
                                    <Text style={{ flex: 2, textAlign: "right" }}>
                                        {row.tax}
                                    </Text>

                                    {/* Amount */}
                                    <Text
                                        style={{
                                            flex: 2,
                                            textAlign: "right"
                                        }}
                                    >
                                        {row.total}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    {/* table section end  */}


                    {/* total section start */}
                    <View id="total-section" style={{ margin: "20px", marginTop: "10px", display: "flex", justifyContent: "flex-end", gap: "20px", flexDirection: "row" }}>
                        <View style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", backgroundColor: "#f9f9f9", width: "50%", alignSelf: "flex-end" }}>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderBottom: `1px solid #ccc`, paddingBottom: "8px", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px", fontWeight: "bold"}}>Order Totals</Text>
                                {/* <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$69.62</Text> */}
                            </View>

                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Items Subtotal:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$205.00</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Shipping Fees:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$15.00</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Tax Collected:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$20.50</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${colors.colorPrimary}`, paddingTop: "8px" }}>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary }}>Total Paid by Customer:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary, marginLeft: "10px" }}>$240.50</Text>
                            </View>
                        </View>

                        <View style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", backgroundColor: "#f9f9f9", width: "50%", alignSelf: "flex-end" }}>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderBottom: `1px solid #ccc`, paddingBottom: "8px", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px", fontWeight: "bold"}}>Marketplace Revenue</Text>
                                {/* <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$69.62</Text> */}
                            </View>

                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Platform Fees Collected:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$20.50</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Shipping Fees (if applicable):</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$5.00</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Payment Processing Fees:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$7.50</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${colors.colorPrimary}`, paddingTop: "8px" }}>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary }}>Total Marketplace Revenue:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary, marginLeft: "10px" }}>$32.70</Text>
                            </View>
                        </View>
                    </View>

                    <View id="total-section-row2" style={{ marginBottom: "20px", marginTop: "10px", display: "flex" }}>
                        <View style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", backgroundColor: "#f9f9f9", width: "46%"}}>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderBottom: `1px solid #ccc`, paddingBottom: "8px", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px", fontWeight: "bold"}}>Seller Payouts</Text>
                                {/* <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$69.62</Text> */}
                            </View>

                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Premium Electronics:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$175.00</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Tech Accessories Co:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$30.00</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "8px" }}>
                                <Text style={{ fontSize: "12px" }}>Taxes Remitted to Sellers:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$20.50</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${colors.colorPrimary}`, paddingTop: "8px" }}>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary }}>Total Seller Payouts:</Text>
                                <Text style={{ fontSize: "12px", fontWeight: "bold", color: colors.colorPrimary, marginLeft: "10px" }}>$225.50</Text>
                            </View>
                        </View>
                    </View>
                    {/* total section end */}


                    {/* tax information */}
                    <View id="tax-information" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "16px", padding: "10px", backgroundColor: "#f9f9f9", margin: "20px", border: `1px solid #ccc`, borderRadius: "5px" }}>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Payment Method</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>Credit Card ****5678</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Transaction ID</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>TXN-20260122-ABC123</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Payment Reference</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>REF-MKT-2026-001234</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Payment Status</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold", color: "#1bc006ff", backgroundColor: "#00ff221f", padding: "2px 6px", borderRadius: "3px", textAlign: "center" }}>Confirmed & Settled</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Payment Date</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" }}>22 Jan 2026</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <Text style={{ fontSize: "10px" }}>Total Amount Paid</Text>
                            <Text style={{ fontSize: "10px", fontWeight: "bold" , color: colors.colorPrimary}}>$240.50</Text>
                        </View>
                    </View>
                    {/* tax information end*/}

                    {/* note section start */}
                    <View style={{ padding: "10px", display: "flex", justifyContent: "center", borderLeft: `3px solid ${colors.colorPrimary}`, margin: "20px", backgroundColor: "#f9f9f9" }}>
                        <Text style={{ fontSize: "12px", fontWeight: "bold" }}>
                            Admin Note: <Text style={{ fontSize: "10px" }}>This is an internal administrative copy of the marketplace order invoice. This document contains the complete financial breakdown including marketplace revenue, seller payouts, and tax information. All amounts are in USD. This invoice is for internal accounting and reconciliation purposes only.</Text>
                        </Text>
                    </View>
                    {/* note section end */}
                </View>
            </Page>
        </Document>
    );
};

export default adminInvoice1;
