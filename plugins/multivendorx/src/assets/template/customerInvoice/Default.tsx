import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
interface Props {
	colors: {
		colorPrimary: string;
		colorSecondary: string;
		colorAccent: string;
		colorSupport: string;
	};
}

const Default: React.FC<Props> = ({ colors }) => {
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
					<Text style={styles.headerTitle}>INVOICE</Text>

					<View style={styles.headerRight}>
						<Text style={styles.boldText}> Marketplace Solutions Inc.</Text>
						<Text>123 Elm Street, Suite 400</Text>
						<Text>London, EC1A 1BB</Text>
					</View>  {/* headerDetails view end */}
				</View>
				{/* Header end */}

				{/* Invoice Info Section start */}
				<View style={styles.boxDetails}>
					<View style={styles.box}>
						<Text style={styles.boxTitle}> Invoice Details:  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}> Invoice Number:</Text>
							<Text style={styles.detailsValue}> INV-2025-091</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Order Number:</Text>
							<Text style={styles.detailsValue}> ORD-2025-456</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Invoice Date:</Text>
							<Text style={styles.detailsValue}> October 9, 2025</Text>
						</View>
					</View>

					<View style={styles.box}>
						<Text style={styles.boxTitle}> Bill To:  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Jane Doe</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> john.smith@email.com</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> 456 Oak Avenue</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> Springfield</Text>
							<Text style={styles.detailsValue}> IL</Text>
							<Text style={styles.detailsValue}> 62701</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Email:</Text>
							<Text style={styles.detailsValue}> jane.doe@acme.co</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Phone:</Text>
							<Text style={styles.detailsValue}> (555) 123-4567</Text>
						</View>
					</View>

					<View style={styles.box}>
						<Text style={styles.boxTitle}> Ship To:  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Jane Doe</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> 789 Distribution Road</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> Springfield</Text>
							<Text style={styles.detailsValue}> IL</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> 62701</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> United Kingdom</Text>
						</View>
					</View>

				</View>
				{/* Invoice Info Section end */}

				{/* Table Section start */}
				<View style={styles.table}>
					{/* Table Header */}
					<View style={styles.tableHeader}>
						<View style={{ flex: 3 }}>
							<Text style={styles.tableHeaderText}> Product</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> Quantity</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> Unit Price</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> Subtotal</Text>
						</View>
						<View style={{ flex: 1.5 }}>
							<Text style={styles.tableHeaderText}> Tax Rate</Text>
						</View>
						<View style={{ flex: 1.5 }}>
							<Text style={styles.tableHeaderText}> Tax Amount</Text>
						</View>
					</View>

					{/* Table Rows */}
					{Array.from({ length: 6 }).map((_, index) => (
						<View style={styles.tableRow}>
							<View style={{ flex: 3 }}>
								<Text style={styles.tableRowText}> Product {index}</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.tableRowText}> 5</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.tableRowText}> $25</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.tableRowText}> $199</Text>
							</View>
							<View style={{ flex: 1.5 }}>
								<Text style={styles.tableRowText}> 10%</Text>
							</View>
							<View style={{ flex: 1.5 }}>
								<Text style={styles.tableRowText}> $299</Text>
							</View>
						</View>
					))}
				</View>
				{/* Table Section end */}

				{/* Total Section start */}
				<View style={styles.totalSection}>
					<View style={styles.totalDetails}>
						<Text style={styles.subTotal}> Items Subtotal:</Text>
						<Text style={styles.subTotal}> $4,500.00 </Text>
					</View>
					<View style={styles.totalDetails}>
						<Text style={styles.subTotal}> Tax Subtotal:</Text>
						<Text style={styles.subTotal}> $4,500.00 </Text>
					</View>
					<View style={styles.totalDetails}>
						<Text style={styles.subTotal}> Shipping (Seller Portion):</Text>
						<Text style={styles.subTotal}> $0.00 </Text>
					</View>
					<View style={styles.totalWrapper}>
						<Text style={styles.total}> Total:</Text>
						<Text style={styles.total}> $6000.00 </Text>
					</View>
				</View>
				{/* Total Section end */}

				{/* note section start */}
				<View style={styles.footerNotice}>
					<Text style={styles.boldText}> Notes: </Text>
					<Text>This invoice covers items sold by Premium Electronics Store. Tax amounts shown are calculated based on applicable VAT/GST rates for the delivery jurisdiction. For questions regarding this invoice, please contact the seller directly.</Text>
				</View>
				{/* note section end */}
			</Page>
		</Document>
	);
};

export default Default;