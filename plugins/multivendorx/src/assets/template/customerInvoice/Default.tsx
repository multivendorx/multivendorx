import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@/services/commonFunction';
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
	const subtotal = (order?.total || 0) - (order?.total_tax || 0) - (order?.shipping_total || 0);
	const mainOrSub = appLocalizer?.invoice_creation_basis === 'main-order';

	const taxDetails = mainOrSub
		? appLocalizer?.tax_details
		: order?.store_tax_details;

	const taxFields = [
		{ key: 'vat_number', label: 'VAT:', fallback: 'GB123456789' },
		{ key: 'tax_id', label: 'Tax ID:', fallback: 'TRN-2024-SELL-9012' },
		{ key: 'registration_number', label: 'Marketplace Registration Number:', fallback: 'TRN-2024-SELL-9012' },
		{ key: 'company_number', label: 'Company registration number:', fallback: 'TRN-2024-SELL-9012' },
	];
	const isAdmin = window.location.pathname.includes('/wp-admin');
	const rows: Row[] = invoiceRows || [
		{
			description: 'Product A',
			qty: 2,
			unitPrice: '$250.00',
			subtotal: '$500.00',
		},
		{
			description: 'Product B',
			qty: 1,
			unitPrice: '$850.00',
			subtotal: '$850.00',
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
		headerDetails: {
			textAlign: 'right',
			fontSize: 14,
			color: '#555',
			display: 'flex',
			flexDirection: 'column',
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
			paddingVertical: 15,
			paddingHorizontal: 10,
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
		tableRowText:{
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
			borderTop: `0.188rem solid #1e2a38`,
			paddingTop: 12,
		},
		total: {
			fontSize: 16,
			fontWeight: 600,
			color: '#1e2a38',
		},
	});
	const styles = createStyles(colors);
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header start */}
				<View style={styles.header}>
					<Text style={styles.headerTitle}>INVOICE</Text>

					<View style={styles.headerDetails}>
						<Text style={styles.boldText}> {isAdmin ? ('MarketKit Ltd.0f b') : order?.billing?.invoice_name}</Text>
						<Text>{isAdmin ? ('123 Elm Street, Suite 400') : order?.billing?.invoice_address}</Text>
						<Text>{isAdmin ? ('London') : order?.invoice_phone} {isAdmin ? ('EC1A 1BB') : order?.invoice_email}</Text>
					</View>
				</View>
				{/* Header end */}

				{/* Invoice Info Section start */}
				<View style={styles.boxDetails}>
					<View style={styles.box}>
						<Text style={styles.boxTitle}> {__('Invoice Details:', 'multivendorx')}  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}> {__('Invoice Number:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {isAdmin ? __('INV-2025-', 'multivendorx') : appLocalizer.invoice_prefix} {isAdmin ? ('091') : order?.id}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Order Number:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {isAdmin ? __('ORD-2025-456', 'multivendorx') : order?.id}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Invoice Date:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {isAdmin ? __('October 9, 2025', 'multivendorx') : order?.date_created ? formatDate(order.date_created) : ''}</Text>
						</View>
					</View>

					<View style={styles.box}>
						<Text style={styles.boxTitle}> {__('Bill To:', 'multivendorx')}  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{isAdmin ? __('Jane Doe', 'multivendorx') : order?.billing?.first_name && order?.billing?.last_name ? `${order.billing.first_name} ${order.billing.last_name}` : ''}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {isAdmin ? __('john.smith@email.com', 'multivendorx') : order?.billing?.email}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {isAdmin ? __('456 Oak Avenue', 'multivendorx') : order?.billing?.address_1}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {isAdmin ? __('Springfield', 'multivendorx') : order?.billing?.city}</Text>
							<Text style={styles.detailsValue}> {isAdmin ? __('IL', 'multivendorx') : order?.billing?.state}</Text>
							<Text style={styles.detailsValue}> {isAdmin ? __('62701', 'multivendorx') : order?.billing?.postcode}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Email:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {isAdmin ? __('jane.doe@acme.co', 'multivendorx') : order?.billing?.email}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{__('Phone:', 'multivendorx')}</Text>
							<Text style={styles.detailsValue}> {isAdmin ? ('(555) 123-4567') : order?.billing?.phone}</Text>
						</View>
					</View>

					<View style={styles.box}>
						<Text style={styles.boxTitle}> {__('Ship To:', 'multivendorx')}  </Text>
						<View style={styles.boxValueWrapper}>
							<Text style={styles.boldText}>{isAdmin ? __('Jane Doe', 'multivendorx') : order?.shipping?.first_name && order?.shipping?.last_name ? `${order.shipping.first_name} ${order.shipping.last_name}` : ''}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {isAdmin ? __('789 Distribution Road', 'multivendorx') : order?.shipping?.address_1}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {isAdmin ? __('Springfield', 'multivendorx') : order?.shipping?.city}</Text>
							<Text style={styles.detailsValue}> {isAdmin ? __('IL', 'multivendorx') : order?.shipping?.state}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {isAdmin ? __('62701', 'multivendorx') : order?.shipping?.postcode}</Text>
						</View>

						<View style={styles.boxValueWrapper}>
							<Text style={styles.detailsValue}> {isAdmin ? __('United Kingdom', 'multivendorx') : order?.shipping?.country}</Text>
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
						// Calculate total if not provided
						const qty = typeof row.qty === 'number' ? row.qty : parseFloat(row.qty as string) || 0;
						const price = parseFloat(row.unitPrice?.replace('$', '').replace(',', '') || '0');
						const total = row.subtotal || `$${(qty * price).toFixed(2)}`;

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
						<Text style={styles.subTotal}> {isAdmin ? __('$4,500.00', 'multivendorx') : order?.currency_symbol}{subtotal ? formatCurrency(subtotal) : ''} </Text>
					</View>
					<View style={styles.totalDetails}>
						<Text style={styles.subTotal}> {__('Tax Subtotal:', 'multivendorx')}</Text>
						<Text style={styles.subTotal}> {isAdmin ? __('$4,500.00', 'multivendorx') : order?.currency_symbol}{order?.total_tax ? formatCurrency(order?.total_tax) : ''} </Text>
					</View>
					<View style={styles.totalDetails}>
						<Text style={styles.subTotal}> {__('Shipping (Seller Portion):', 'multivendorx')}</Text>
						<Text style={styles.subTotal}> {isAdmin ? __('$0.00', 'multivendorx') : order?.currency_symbol}{order?.shipping_total ? formatCurrency(order?.shipping_total) : ''} </Text>
					</View>
					<View style={styles.totalWrapper}>
						<Text style={styles.total}> {__('Shipping (Seller Portion):', 'multivendorx')}</Text>
						<Text style={styles.total}> {isAdmin ? __('$6000.00', 'multivendorx') : order?.currency_symbol}{order?.total ? formatCurrency(order?.total) : ''} </Text>
					</View>
				</View>
				{/* Total Section end */}
			</Page>
		</Document>
	);
};

export default Default;