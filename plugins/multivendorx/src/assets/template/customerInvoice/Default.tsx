import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { __ } from '@wordpress/i18n';

interface Row {
	description: string;
	qty?: number | string;
	unitPrice?: string;
	subtotal?: string;
	taxRate?: string;
	taxAmount?: string;
}
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
			description: 'Product A',
			qty: 2,
			unitPrice: '$250.00',
			subtotal: '$500.00',
			taxRate: '10%',
			taxAmount: '$250'
		},
		{
			description: 'Product B',
			qty: 10,
			unitPrice: '$850.00',
			subtotal: '$850.00',
			taxRate: '10%',
			taxAmount: '$250'
		},
		{
			description: 'Product C',
			qty: 4,
			unitPrice: '$850.00',
			subtotal: '$850.00',
			taxRate: '10%',
			taxAmount: '$250'
		},
		{
			description: 'Product D',
			qty: 1,
			unitPrice: '$850.00',
			subtotal: '$850.00',
			taxRate: '10%',
			taxAmount: '$250'
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
					<Text style={styles.headerTitle}>{__('INVOICE', 'multivendorx')}</Text>

					<View style={styles.headerRight}>
						<Text style={styles.boldText}> {__('Marketplace Solutions Inc.', 'multivendorx')}</Text>
						<Text>{__('123 Elm Street, Suite 400', 'multivendorx')}</Text>
						<Text>{__('London, EC1A 1BB', 'multivendorx')}</Text>
					</View>  {/* headerDetails view end */}
				</View>
				{/* Header end */}

				{/* Invoice Info Section start */}
				<View style={styles.boxDetails}>
					<View style={styles.box}>
						<Text style={styles.boxTitle}> {__('Invoice Details:', 'multivendorx')}  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}> {__('Invoice Number:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('INV-2025-091', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Order Number:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('ORD-2025-456', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Invoice Date:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('October 9, 2025', 'multivendorx')}</Text>
						</View>
					</View>

					<View style={styles.box}>
						<Text style={styles.boxTitle}> {__('Bill To:', 'multivendorx')}  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Jane Doe', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {__('john.smith@email.com', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {__('456 Oak Avenue', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {__('Springfield', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('IL', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('62701', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Email:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('jane.doe@acme.co', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Phone:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> (555) 123-4567</Text>
						</View>
					</View>

					<View style={styles.box}>
						<Text style={styles.boxTitle}> {__('Ship To:', 'multivendorx')}  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Jane Doe', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {__('789 Distribution Road', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {__('Springfield', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {__('IL', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {__('62701', 'multivendorx')}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {__('United Kingdom', 'multivendorx')}</Text>
						</View>
					</View>

				</View>
				{/* Invoice Info Section end */}

				{/* Table Section start */}
				<View style={styles.table}>
					{/* Table Header */}
					<View style={styles.tableHeader}>
						<View style={{ flex: 3 }}>
							<Text style={styles.tableHeaderText}> {__('Product', 'multivendorx')}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> {__('Quantity', 'multivendorx')}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> {__('Unit Price', 'multivendorx')}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> {__('Subtotal', 'multivendorx')}</Text>
						</View>
						<View style={{ flex: 1.5 }}>
							<Text style={styles.tableHeaderText}> {__('Tax Rate', 'multivendorx')}</Text>
						</View>
						<View style={{ flex: 1.5 }}>
							<Text style={styles.tableHeaderText}> {__('Tax Amount', 'multivendorx')}</Text>
						</View>
					</View>

					{/* Table Rows */}
					{rows.map((row, index) => {
						return (
							<View style={styles.tableRow}>
								<View style={{ flex: 3 }}>
									<Text style={styles.tableRowText}> {row.description}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.tableRowText}> {row.qty}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.tableRowText}> {row.unitPrice}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.tableRowText}> {row.subtotal}</Text>
								</View>
								<View style={{ flex: 1.5 }}>
									<Text style={styles.tableRowText}> {row.taxRate}</Text>
								</View>
								<View style={{ flex: 1.5 }}>
									<Text style={styles.tableRowText}> {row.taxAmount}</Text>
								</View>
							</View>
						);
					})}
				</View>
				{/* Table Section end */}

				{/* Total Section start */}
				<View style={styles.totalSection}>
					<View style={styles.totalDetails}>
						<Text style={styles.subTotal}> {__('Items Subtotal:', 'multivendorx')}</Text>
						<Text style={styles.subTotal}> {__('$4,500.00', 'multivendorx')} </Text>
					</View>
					<View style={styles.totalDetails}>
						<Text style={styles.subTotal}> {__('Tax Subtotal:', 'multivendorx')}</Text>
						<Text style={styles.subTotal}> {__('$4,500.00', 'multivendorx')} </Text>
					</View>
					<View style={styles.totalDetails}>
						<Text style={styles.subTotal}> {__('Shipping (Seller Portion):', 'multivendorx')}</Text>
						<Text style={styles.subTotal}> {__('$0.00', 'multivendorx')} </Text>
					</View>
					<View style={styles.totalWrapper}>
						<Text style={styles.total}> {__('Total:', 'multivendorx')}</Text>
						<Text style={styles.total}> {__('$6000.00', 'multivendorx')} </Text>
					</View>
				</View>
				{/* Total Section end */}

				{/* note section start */}
				<View style={styles.footerNotice}>
					<Text style={styles.boldText}> {__('Notes:', 'multivendorx')} </Text>
					<Text>{__('This invoice covers items sold by Premium Electronics Store. Tax amounts shown are calculated based on applicable VAT/GST rates for the delivery jurisdiction. For questions regarding this invoice, please contact the seller directly.', 'multivendorx')}</Text>
				</View>
				{/* note section end */}
			</Page>
		</Document>
	);
};

export default Default;