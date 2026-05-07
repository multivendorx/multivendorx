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
					<Text style={styles.headerTitle}>Tax Invoice</Text>

					<View style={styles.headerRight}>
						<Text style={styles.boldText}> Marketplace Solutions Inc.</Text>
						<Text>123 Elm Street, Suite 400</Text>
						<Text>London, EC1A 1BB</Text>
						<Text>+91 987456321</Text>
						<Text>store@gmail.com</Text>
					</View>  {/* headerDetails view end */}
				</View>
				{/* Header end */}

				{/* Invoice Info Section start */}
				<View style={styles.boxDetails}>
					<View style={styles.box}>
						<Text style={styles.boxTitle}> Store 1  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}> VAT / Tax number:</Text>
							<Text style={styles.detailsValue}> DE987654321</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Marketplace tax ID: </Text>
							<Text style={styles.detailsValue}> GB123456789</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Registration number: </Text>
							<Text style={styles.detailsValue}> GB123456789</Text>
						</View>
					</View>

					<View style={styles.box}>
						<Text style={styles.boxTitle}> Invoice Details:  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}> Invoice Number:</Text>
							<Text style={styles.detailsValue}> INV-2025-091</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Order Number: </Text>
							<Text style={styles.detailsValue}> ORD-2025-456</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Tax ID: </Text>
							<Text style={styles.detailsValue}> 3521456</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>VAT Number: </Text>
							<Text style={styles.detailsValue}> IE 98547464</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Registration Number: </Text>
							<Text style={styles.detailsValue}> 98547464</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>Trade License: </Text>
							<Text style={styles.detailsValue}> 98547464</Text>
						</View>
					</View>
				</View>
				{/* Invoice Info Section end */}

				{/* Table Section start */}
				<View style={styles.table}>
					{/* Table Header */}
					<View style={styles.tableHeader}>
						<View style={{ flex: 1 }}>
							<Text style={styles.tableHeaderText}> Order ID</Text>
						</View>
						<View style={{ flex: 1.5 }}>
							<Text style={styles.tableHeaderText}> Date</Text>
						</View>
						<View style={{ flex: 2 }}>
							<Text style={styles.tableHeaderText}> Order Amount</Text>
						</View>
						<View style={{ flex: 2 }}>
							<Text style={styles.tableHeaderText}> Store Earning</Text>
						</View>
						<View style={{ flex: 2.5 }}>
							<Text style={styles.tableHeaderText}> Marketplace Earning</Text>
						</View>
						<View style={{ flex: 2 }}>
							<Text style={styles.tableHeaderText}> Shipping Tax</Text>
						</View>
						<View style={{ flex: 2 }}>
							<Text style={styles.tableHeaderText}> Shipping Amount</Text>
						</View>
					</View>

					{/* Table Rows */}
					{Array.from({ length: 6 }).map((_, index) => (
						<View style={styles.tableRow}>
							<View style={{ flex: 1 }}>
								<Text style={styles.tableRowText}> #182</Text>
							</View>
							<View style={{ flex: 1.5 }}>
								<Text style={styles.tableRowText}>May 5, 2026</Text>
							</View>
							<View style={{ flex: 2 }}>
								<Text style={styles.tableRowText}> $499</Text>
							</View>
							<View style={{ flex: 2 }}>
								<Text style={styles.tableRowText}> $25</Text>
							</View>
							<View style={{ flex: 2.5 }}>
								<Text style={styles.tableRowText}> $45</Text>
							</View>
							<View style={{ flex: 2 }}>
								<Text style={styles.tableRowText}> $60</Text>
							</View>
							<View style={{ flex: 2 }}>
								<Text style={styles.tableRowText}>$699</Text>
							</View>
						</View>
					))}
				</View>
				{/* Table Section end */}
			</Page>
        </Document>
    );
};

export default Default;