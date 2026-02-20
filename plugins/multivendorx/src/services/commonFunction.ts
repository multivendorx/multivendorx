export function truncateText(text: string, maxLength: number) {
	if (!text) {
		return '-';
	}
	return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export function formatCurrency(amount: number | string): string {
	if (amount === null || amount === undefined || amount === '') {
		return '-';
	}

	const num = parseFloat(String(amount));
	if (isNaN(num)) {
		return '-';
	}

	const {
		currency_symbol = '',
		price_decimals = 2,
		decimal_separator = '.',
		thousand_separator = ',',
		currency_position = 'left',
	} = appLocalizer || {};

	const isNegative = num < 0;
	const absNum = Math.abs(num);

	// Format number with decimals and separators
	const parts = absNum.toFixed(price_decimals).split('.');
	const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand_separator);
	const decimalPart = parts[1] ? decimal_separator + parts[1] : '';
	const formattedNumber = intPart + decimalPart;

	// Apply currency symbol based on four possible positions using if/else
	let formatted: string;
	if (currency_position === 'left') {
		formatted = `${currency_symbol}${formattedNumber}`;
	} else if (currency_position === 'right') {
		formatted = `${formattedNumber}${currency_symbol}`;
	} else if (currency_position === 'left_space') {
		formatted = `${currency_symbol} ${formattedNumber}`;
	} else if (currency_position === 'right_space') {
		formatted = `${formattedNumber} ${currency_symbol}`;
	} else {
		formatted = `${currency_symbol}${formattedNumber}`;
	}

	// Add negative sign for negative numbers
	if (isNegative) {
		formatted = `-${formatted}`;
	}

	return formatted;
}

export function formatTimeAgo(dateString: string) {
	// Force UTC
	const date = new Date(dateString + 'Z');

	const diff = Math.floor((Date.now() - date.getTime()) / 1000);

	if (diff < 60) return 'Just now';
	if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;
	return `${Math.floor(diff / 86400)} day ago`;
}

// This function only removes time from the date-time object and return the formatted date.
export const formatLocalDate = (date?: Date) =>
	date ? date.toISOString().split('T')[0] : '';

export function printContent(divId: string) {
	const source = document.getElementById(divId) as HTMLElement;
	const printWindow = window.open('', '_blank');
	if (!printWindow) {
		return;
	}
	const cloned = source.cloneNode(true) as HTMLElement;
	printWindow.document.write(cloned.innerHTML);
	printWindow.focus();
	printWindow.print();
	printWindow.close();
}

export const formatDate = (date?: string): string => {
	if (!date) return '-';

	const d = new Date(date);
	if (isNaN(d.getTime())) return '-';

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(d);
};

export const toWcIsoDate = (
	date: Date,
	type: 'start' | 'end'
): string => {
	const d = new Date(date);

	if (type === 'start') {
		d.setHours(0, 0, 0, 0);
	} else {
		d.setHours(23, 59, 59, 999);
	}

	return d.toISOString();
};

export const downloadCSV = (
  headers: Record<string, any>,
  rows: Record<string, any>[],
  filename: string = 'export.csv'
) => {
  if (!rows || rows.length === 0) return;

  // Only include headers with csv: true
  const csvColumns = Object.entries(headers)
    .filter(([_, h]) => h.csvDisplay !== false)
    .map(([key, h]) => ({ key, label: h.label }));

  // Header row
  const csvRows = [csvColumns.map(c => `"${c.label}"`).join(',')];

  // Data rows
  rows.forEach(row => {
    const rowData = csvColumns
      .map(col => `"${row[col.key] != null ? row[col.key] : ''}"`)
      .join(',');
    csvRows.push(rowData);
  });

  // Trigger download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
