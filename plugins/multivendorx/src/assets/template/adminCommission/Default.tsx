import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@/services/commonFunction';
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

const adminCommissionDefault: React.FC<Props> = ({ invoiceRows, colors, order }) => {
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

	const subtotal = (order?.total || 0) - (order?.total_tax || 0) - (order?.shipping_total || 0);

    const adminTaxDetails = appLocalizer?.tax_details;
    const storeTaxDetails = order?.store_tax_details;

    const taxFields = [
        { key: 'vat_number', label: 'VAT:', fallback: 'GB123456789' },
        { key: 'tax_id', label: 'Tax ID:', fallback: 'TRN-2024-SELL-9012' },
        { key: 'registration_number', label: 'Marketplace Registration Number:', fallback: 'TRN-2024-SELL-9012' },
        { key: 'company_number', label: 'Company registration number:', fallback: 'TRN-2024-SELL-9012' },
    ];
    const isAdmin = window.location.pathname.includes('/wp-admin');
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
			fontSize: 11,
			margin: 0,
		},
		flexEnd: {
			display: 'flex',
			justifyContent: 'flex-end',
			margin: 20,
		},
		// header start
		header: {
			display: 'flex',
			justifyContent: 'space-between',
			flexDirection: 'row',
			margin: '20px',
			paddingBottom: '20px',
			borderBottom: '1px solid #eee',
		},
		headerLeft: {
			display: 'flex',
			justifyContent: 'space-between',
			gap: 15,
			flexDirection: 'row',
			alignItems: 'flex-start',
		},
		headerAvater: {
			padding: 10,
			backgroundColor: colors.colorPrimary,
			fontSize: 25,
			fontWeight: 600,
			borderRadius: 5,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
		},
		headerLeftDetails: {
			display: 'flex',
			gap: 5,
			flexDirection: 'column',
		},
		headerRight: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'flex-end',
			gap: 6,
		},
		invoiceText: {
			fontSize: 26,
			color: '#fff',
			fontWeight: 'bold',
		},
		invoiceLogo: {
			width: 120,
			height: 'auto'
		},
		companyName: {
			fontSize: 20,
			fontWeight: 600
		},
		headerDetails: {
			display: 'flex',
			flexDirection: 'row',
			gap: 4,
		},
		headerDetailsLabel: {
			fontWeight: 600,
		},
		headerDetailsValue: {
			fontSize: 12
		},
		// box details
		boxDetails: {
			margin: 20,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			gap: 20,
		},
		box: {
			display: 'flex',
			flexDirection: 'column',
			gap: 5,
			width: '100%',
			padding: 10,
			backgroundColor: `${colors.colorPrimary}10`,
			borderRadius: 5,
		},
		boxTitle: {
			fontSize: 14,
			color: colors.colorPrimary,
			marginBottom: 5,
			fontWeight: 600,
		},
		boxValueWrapper: {
			display: 'flex',
			flexDirection: 'row',
		},
		detailsValue: {},

		// total section
		totalSection: {
			borderRadius: 5,
			padding: 8,
			width: '40%',
			alignSelf: 'flex-end',
			marginLeft: 'auto',
		},
		totalDetails: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginBottom: 8,
		},
		subTotal: {
			fontSize: 12,
			fontWeight: 'bold',
			marginLeft: 10,
		},
		totalWrapper: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			backgroundColor: `${colors.colorPrimary}10`,
			borderRadius: 5,
			padding: 8,
		},
		total: {
			fontSize: 14,
			fontWeight: 'bold',
			color: colors.colorPrimary,
		},

		// signature Wrapper
		signatureWrapper: {
			marginTop: 20,
			alignItems: 'flex-end',
		},
		signatureImage: {
			width: 120,
			height: 50,
			marginBottom: 4,
		},
		signatureText: {
			fontSize: 14,
			fontWeight: 600,
			borderTop: '0.063rem dashed',
			paddingTop: 6,
		},

		// footer notice
		footerNotice: {
			padding: 10,
			display: 'flex',
			justifyContent: 'center',
			borderLeft: `0.188rem solid ${colors.colorPrimary}`,
			margin: 20,
			backgroundColor: '#f9f9f9',
		},
		noticeText: {
			fontSize: 12,
			fontWeight: 600,
		},
		notice: {
			fontSize: 12,
			fontWeight: 400,
		},
		// table start
		table: {
			display: 'flex',
			flexDirection: 'column',
			margin: 20,
			marginTop: 40
		},
		tableHeader: {
			display: 'flex',
			flexDirection: 'row',
			padding: 8,
			backgroundColor: colors.colorPrimary,
			borderRadius: 4
		},
		tableHeaderText: {
			fontWeight: 600,
			fontSize: 14,
			padding: 8,
			color: '#fff'
		},
		tableRow: {
			display: 'flex',
			flexDirection: 'row',
			padding: 8,
		},
		tableRowText: {
			padding: 8,
		}
	});
	const styles = createStyles(colors);

	return (
		<Document>
			<Page
				size="A4"
				style={styles.page}
			>
				<View>
					{/* header start*/}
					<View style={styles.header}>
						{/* left section */}
						<View style={styles.headerLeft}>
							<View style={styles.headerAvater}>
								<Text style={{ color: '#fff' }}>MS</Text>
							</View>
							<View style={styles.headerLeftDetails}>
								<Text style={styles.companyName}> {isAdmin ? ('Marketplace Solutions Inc.') : order?.billing?.invoice_name}</Text>
								<Text style={styles.headerDetailsValue}>{isAdmin ? ('123 Elm Street, Suite 400') : order?.billing?.invoice_address}</Text>
								<Text style={styles.headerDetailsValue}>{isAdmin ? ('London') : order?.invoice_phone} {isAdmin ? ('EC1A 1BB') : order?.invoice_email}</Text>

								{taxFields.map((field) => {
									const adminData = adminTaxDetails?.[field.key];
									let value = '';
									// Case 1: Global config (has enable/description)
									if (adminData && typeof adminData === 'object') {
										value = adminData.description || '';
									}
									else {
										value = field.fallback;
									}

									return (
										<View style={styles.headerDetails} key={field.key}>
											<Text style={styles.boldText}>{field.label} </Text>
											<Text>{value}</Text>
										</View>
									);
								})}
							</View>
						</View>
						{/* left section end*/}
						{/* right section */}
						<View style={styles.headerRight}>
							<Text style={styles.companyName}>{isAdmin ? __('Store', 'multivendorx') : order?.store_name}</Text>
							<View style={styles.headerDetails}>
								<Text style={styles.headerDetailsLabel}>{__('Invoice Number:', 'multivendorx')}</Text>
								<Text> {isAdmin ? __('INV-2025-', 'multivendorx') : appLocalizer.invoice_prefix} {isAdmin ? ('091') : order?.id}</Text>
							</View>

							<View style={styles.headerDetails}>
								<Text style={styles.headerDetailsLabel}>{__('Invoice Date:', 'multivendorx')}</Text>
								<Text> {isAdmin ? __('October 9, 2025', 'multivendorx') : order?.date_created ? formatDate(order.date_created) : ''}</Text>
							</View>
							{taxFields.map((field) => {
								const adminData = storeTaxDetails?.[field.key];
								let value = '';
								// Case 1: Global config (has enable/description)
								if (adminData && typeof adminData === 'object') {
									value = adminData.description || '';
								}
								else {
									value = field.fallback;
								}

								return (
									<View style={styles.headerDetails} key={field.key}>
										<Text style={styles.boldText}>{field.label} </Text>
										<Text>{value}</Text>
									</View>
								);
							})}
						</View>
						{/* right section end */}
					</View>
					{/* header end*/}

					{/* table section start */}
					<View
						id="invoice-table-wrapper"
						style={{
							margin: '20px',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<View
							id="invoice-table-header"
							style={{
								display: 'flex',
								flexDirection: 'row',
								paddingVertical: 8,
							}}
						>
							{/* Description */}
							<View style={{ flex: 4 }}>
								<Text style={{ fontWeight: 600 }}>
									Order ID
								</Text>
							</View>

							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Date
							</Text>
							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Order Amount
							</Text>
							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Store Earning
							</Text>
							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Marketplace Earning
							</Text>
							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Shipping Tax
							</Text>
							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Shipping Amount
							</Text>
						</View>
						{rows.map((row, index) => {
							return (
								<View
									id="invoice-table-row"
									key={index}
									style={{
										display: 'flex',
										flexDirection: 'row',
										paddingVertical: 8,
										borderTop: '1px solid #eee',
									}}
								>
									{/* Description */}
									<View style={{ flex: 2 }}>
										<Text>{row.orderID}</Text>
									</View>

									<Text
										style={{ flex: 2, textAlign: 'right' }}
									>
										{row.date}
									</Text>

									{/* Unit Price */}
									<Text
										style={{ flex: 2, textAlign: 'right' }}
									>
										{row.orderAmount}
									</Text>

									<Text
										style={{ flex: 2, textAlign: 'right' }}
									>
										{row.storeEarning}
									</Text>
									<Text
										style={{ flex: 2, textAlign: 'right' }}
									>
										{row.marketplaceEarning}
									</Text>
									<Text
										style={{ flex: 2, textAlign: 'right' }}
									>
										{row.shippingTax}
									</Text>
									<Text
										style={{ flex: 2, textAlign: 'right' }}
									>
										{row.shippingAmount}
									</Text>
								</View>
							);
						})}
					</View>
					{/* table section end  */}

					{/* total section start */}
					<View
						id="total-section"
						style={{
							margin: '20px',
							marginTop: '10px',
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '20px',
							flexDirection: 'row',
						}}
					>
						<View
							style={{
								border: '1px solid #ccc',
								borderRadius: '5px',
								padding: '10px',
								backgroundColor: '#f9f9f9',
								width: '50%',
								alignSelf: 'flex-end',
							}}
						>
							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
									borderBottom: `1px solid #ccc`,
									paddingBottom: '8px',
									marginBottom: '8px',
								}}
							>
								<Text
									style={{
										fontSize: '12px',
										fontWeight: 'bold',
									}}
								>
									Settlement summary
								</Text>
								{/* <Text style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "10px" }}>$69.62</Text> */}
							</View>

							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
									marginBottom: '8px',
								}}
							>
								<Text style={{ fontSize: '12px' }}>
									Total sales:
								</Text>
								<Text
									style={{
										fontSize: '12px',
										fontWeight: 'bold',
										marginLeft: '10px',
									}}
								>
									$20.50
								</Text>
							</View>
							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
									marginBottom: '8px',
								}}
							>
								<Text style={{ fontSize: '12px' }}>
									Commission (15%):
								</Text>
								<Text
									style={{
										fontSize: '12px',
										fontWeight: 'bold',
										marginLeft: '10px',
									}}
								>
									$5.00
								</Text>
							</View>
							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
									marginBottom: '8px',
								}}
							>
								<Text style={{ fontSize: '12px' }}>
									Platform fee:
								</Text>
								<Text
									style={{
										fontSize: '12px',
										fontWeight: 'bold',
										marginLeft: '10px',
									}}
								>
									$7.50
								</Text>
							</View>
						</View>
					</View>
					{/* total section end */}

					{/* tax information */}
					{/* <View
						id="tax-information"
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							gap: '16px',
							padding: '10px',
							backgroundColor: '#f9f9f9',
							margin: '20px',
							border: `1px solid #ccc`,
							borderRadius: '5px',
						}}
					>
						<View
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '5px',
							}}
						>
							<Text style={{ fontSize: '10px' }}>
								Payment Method
							</Text>
							<Text
								style={{ fontSize: '10px', fontWeight: 'bold' }}
							>
								Credit Card ****5678
							</Text>
						</View>
						<View
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '5px',
							}}
						>
							<Text style={{ fontSize: '10px' }}>
								Transaction ID
							</Text>
							<Text
								style={{ fontSize: '10px', fontWeight: 'bold' }}
							>
								TXN-20260122-ABC123
							</Text>
						</View>
						<View
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '5px',
							}}
						>
							<Text style={{ fontSize: '10px' }}>
								Payment Reference
							</Text>
							<Text
								style={{ fontSize: '10px', fontWeight: 'bold' }}
							>
								REF-MKT-2026-001234
							</Text>
						</View>
						<View
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '5px',
							}}
						>
							<Text style={{ fontSize: '10px' }}>
								Payment Status
							</Text>
							<Text
								style={{
									fontSize: '10px',
									fontWeight: 'bold',
									color: '#1bc006ff',
									backgroundColor: '#00ff221f',
									padding: '2px 6px',
									borderRadius: '3px',
									textAlign: 'center',
								}}
							>
								Confirmed & Settled
							</Text>
						</View>
						<View
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '5px',
							}}
						>
							<Text style={{ fontSize: '10px' }}>
								Payment Date
							</Text>
							<Text
								style={{ fontSize: '10px', fontWeight: 'bold' }}
							>
								22 Jan 2026
							</Text>
						</View>
						<View
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '5px',
							}}
						>
							<Text style={{ fontSize: '10px' }}>
								Total Amount Paid
							</Text>
							<Text
								style={{
									fontSize: '10px',
									fontWeight: 'bold',
									color: colors.colorPrimary,
								}}
							>
								$240.50
							</Text>
						</View>
					</View> */}
					{/* tax information end*/}

					{/* note section start */}
					<View
						style={{
							padding: '10px',
							display: 'flex',
							justifyContent: 'center',
							borderLeft: `3px solid ${colors.colorPrimary}`,
							margin: '20px',
							backgroundColor: '#f9f9f9',
						}}
					>
						<Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
							Admin Note:{' '}
							<Text style={{ fontSize: '10px' }}>
								This is an internal administrative copy of the
								marketplace order invoice. This document
								contains the complete financial breakdown
								including marketplace revenue, seller payouts,
								and tax information. All amounts are in USD.
								This invoice is for internal accounting and
								reconciliation purposes only.
							</Text>
						</Text>
					</View>
					{/* note section end */}
				</View>
			</Page>
		</Document>
	);
};

export default adminCommissionDefault;
