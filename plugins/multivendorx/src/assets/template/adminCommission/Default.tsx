import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { __ } from '@wordpress/i18n';

type Row = {
    orderID: string;
    orderAmount: string;
    storeEarning: number;
    marketplaceEarning: number;
    shippingTax: number;
    shippingAmount: number;
    date?: string;
};

interface Props {
    invoiceRows?: Row[];
    order?: any;
    colors: {
        colorPrimary: string;
        colorSecondary: string;
        colorAccent: string;
        colorSupport: string;
    };
}

const Default: React.FC<Props> = ({ invoiceRows, colors, order }) => {
    const rows: Row[] = invoiceRows || [
        {
            orderID: '1',
            date: '2025-10-01',
            orderAmount: '100',
            storeEarning: 2,
            marketplaceEarning: 0.5,
            shippingTax: 1,
            shippingAmount: 5,
        },
        {
            orderID: '2',
            date: '2025-10-02',
            orderAmount: '200',
            storeEarning: 2,
            marketplaceEarning: 0.5,
            shippingTax: 1,
            shippingAmount: 5,
        },
        {
            orderID: '3',
            date: '2025-10-03',
            orderAmount: '300',
            storeEarning: 2,
            marketplaceEarning: 0.5,
            shippingTax: 1,
            shippingAmount: 5,
        },
    ];

    const createStyles = (colors: Props['colors']) => StyleSheet.create({
        page: {
			fontSize: 12,
			fontFamily: 'Helvetica',
			backgroundColor: '#fff',
			position: 'relative',
			padding: 0,
			margin: 0
		},
		boldText: {
			fontWeight: 600,
			fontSize: 14,
			margin: 0,
		},

		header: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			flexDirection: 'row',
			margin: 20,
		},
		headerTitle: {
			fontSize: 32,
			color: '#1e2a38',
			fontWeight: 'bold',
		},
		headerRight: {
			textAlign: 'right',
			fontSize: 14,
			color: '#555',
			display: 'flex',
			flexDirection: 'column',
		},
		headerDetails: {
			display: 'flex',
			flexDirection: 'row',
		},
		// boxDetails start
		boxDetails: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			margin: 20,
		},
		box: {
			display: 'flex',
			flexDirection: 'column',
			gap: 8,
		},
		boxTitle: {
			fontSize: 16,
			marginBottom: 8,
			color: '#1e2a38',
			fontWeight: 'bold',
		},
		boxValueWrapper: {
			display: 'flex',
			flexDirection: 'row',
		},
		detailsValue: {
			fontSize: 14,
			color: '#555'
		},

		// table start
		table: {
			display: 'flex',
			flexDirection: 'column',
			margin: 20,
		},
		tableHeader: {
			display: 'flex',
			flexDirection: 'row',
			backgroundColor: '#f7f8fa',
			padding: 10,
		},
		tableHeaderText: {
			fontWeight: 600,
			color: '#1e2a38',
		},
		tableRow: {
			display: 'flex',
			flexDirection: 'row',
			padding: 15,
			borderBottom: '1px solid #eaeaea',
		},
		tableRowText: {
			fontSize: 14,
			color: '#555'
		},
		// total section 
		totalSection: {
			display: 'flex',
			justifyContent: 'flex-end',
			alignItems: 'flex-end',
			flexDirection: 'column',
			margin: 20,
		},
		totalDetails: {
			width: 300,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			paddingTop: 12,
		},
		subTotal: {
			fontSize: 15,
			color: '#1e2a38',
		},
		totalWrapper: {
			width: 300,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			borderTop: `0.125rem solid #61666bff`,
			paddingTop: 10,
			marginTop: 10,
		},
		total: {
			fontSize: 16,
			fontWeight: 600,
			color: '#1e2a38',
		},

		// footer notice
		footerNotice: {
			padding: 10,
			display: 'flex',
			justifyContent: 'center',
			borderLeft: `0.125rem solid #1e2a38`,
			margin: 20,
			backgroundColor: '#f9f9f9',
		}
    });
    const styles = createStyles(colors);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
				{/* Header start */}
				<View style={styles.header}>
					<Text style={styles.headerTitle}>{__('Tax Invoice', 'multivendorx')}</Text>

					<View style={styles.headerRight}>
						<Text style={styles.boldText}> {__('Marketplace Solutions Inc.', 'multivendorx')}</Text>
						<Text>{__('123 Elm Street, Suite 400', 'multivendorx')}</Text>
						<Text>{__('London, EC1A 1BB', 'multivendorx')}</Text>
						<Text>{__('+91 987456321', 'multivendorx')}</Text>
						<Text>{__('store@gmail.com', 'multivendorx')}</Text>
					</View>  {/* headerDetails view end */}
				</View>
				{/* Header end */}

				{/* Invoice Info Section start */}
				<View style={styles.boxDetails}>
					<View style={styles.box}>
						<Text style={styles.boxTitle}> {__('Store 1', 'multivendorx')}  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}> {__('VAT / Tax number:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('DE987654321', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Marketplace tax ID: ', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('GB123456789', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Registration number: ', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('GB123456789', 'multivendorx')}</Text>
						</View>
					</View>

					<View style={styles.box}>
						<Text style={styles.boxTitle}> {__('Invoice Details:', 'multivendorx')}  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}> {__('Invoice Number:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('INV-2025-091', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Order Number: ', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('ORD-2025-456', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Tax ID: ', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('3521456', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('VAT Number: ', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('IE 98547464', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Registration Number: ', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('98547464', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Trade License: ', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('98547464', 'multivendorx')}</Text>
						</View>
					</View>
				</View>
				{/* Invoice Info Section end */}

				{/* Table Section start */}
				<View style={styles.table}>
					{/* Table Header */}
					<View style={styles.tableHeader}>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> {__('Order ID', 'multivendorx-pro')}</Text>
						</View>
						<View style={{ flex: 1.5 }}>
							<Text style={styles.tableHeaderText}> {__('Date', 'multivendorx-pro')}</Text>
						</View>
						<View style={{ flex: 2 }}>
							<Text style={styles.tableHeaderText}> {__('Order Amount', 'multivendorx-pro')}</Text>
						</View>
						<View style={{ flex: 2 }}>
							<Text style={styles.tableHeaderText}> {__('Store Earning', 'multivendorx-pro')}</Text>
						</View>
						<View style={{ flex: 2.5 }}>
							<Text style={styles.tableHeaderText}> {__('Marketplace Earning', 'multivendorx-pro')}</Text>
						</View>
						<View style={{ flex: 2 }}>
							<Text style={styles.tableHeaderText}> {__('Shipping Tax', 'multivendorx-pro')}</Text>
						</View>
						<View style={{ flex: 2 }}>
							<Text style={styles.tableHeaderText}> {__('Shipping Amount', 'multivendorx-pro')}</Text>
						</View>
					</View>

					{/* Table Rows */}
					{rows.map((row, index) => {
						return (
							<View style={styles.tableRow}>
								<View style={{ flex: 1 }}>
									<Text style={styles.tableRowText}> {row.orderID}</Text>
								</View>
								<View style={{ flex: 1.5 }}>
									<Text style={styles.tableRowText}>{row.date}</Text>
								</View>
								<View style={{ flex: 2 }}>
									<Text style={styles.tableRowText}> {row.orderAmount}</Text>
								</View>
								<View style={{ flex: 2 }}>
									<Text style={styles.tableRowText}> {row.storeEarning}</Text>
								</View>
								<View style={{ flex: 2.5 }}>
									<Text style={styles.tableRowText}> {row.marketplaceEarning}</Text>
								</View>
								<View style={{ flex: 2 }}>
									<Text style={styles.tableRowText}> {row.shippingTax}</Text>
								</View>
								<View style={{ flex: 2 }}>
									<Text style={styles.tableRowText}> {row.shippingAmount}</Text>
								</View>
							</View>
						);
					})}
				</View>
				{/* Table Section end */}
			</Page>
        </Document>
    );
};

export default Default;