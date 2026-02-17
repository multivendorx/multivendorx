export function truncateText(text: string, maxLength: number) {
	if (!text) {
		return '-';
	}
	return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export function formatCurrency(amount: number | string): string {
	if (!amount && amount !== 0) {
		return '-';
	}

	const {
		currency_symbol = '',
		price_format = '%1$s%2$s',
		decimal_sep = '.',
		thousand_sep = ',',
		decimals = 2,
	} = appLocalizer || {};

	const num = parseFloat(String(amount));
	if (isNaN(num)) {
		return '-';
	}

	const isNegative = num < 0;
	const absNum = Math.abs(num);

	const formattedNumber = absNum
		.toFixed(decimals)
		.replace('.', decimal_sep)
		.replace(/\B(?=(\d{3})+(?!\d))/g, thousand_sep);

	//Apply symbol & number
	let formatted = price_format
		.replace('%1$s', currency_symbol)
		.replace('%2$s', formattedNumber)
		.replace(/&nbsp;/g, ' ')
		.trim();

	//For negative numbers, show as "-$271" instead of "$-271"
	if (isNegative) {
		formatted = `-${formatted.replace('-', '')}`;
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

export function formatWordpressDate(
	dateString: string | null | undefined,
  ): string {
	if (!dateString) return '-';
	console.log('dateString', dateString);
	const date = new Date(dateString);
	console.log('date', date);
	if (isNaN(date.getTime())) return '-';
  
	const map: Record<string, string> = {
	  YYYY: String(date.getFullYear()),
	  YY: String(date.getFullYear()).slice(-2),
  
	  MMMM: date.toLocaleString(undefined, { month: 'long' }),
	  MMM: date.toLocaleString(undefined, { month: 'short' }),
	  MM: String(date.getMonth() + 1).padStart(2, '0'),
  
	  DD: String(date.getDate()).padStart(2, '0'),
	  D: String(date.getDate()),
  
	  HH: String(date.getHours()).padStart(2, '0'),
	  mm: String(date.getMinutes()).padStart(2, '0'),
	  ss: String(date.getSeconds()).padStart(2, '0'),
	};
  
	const format = appLocalizer.date_format || 'YYYY-MM-DD';
	console.log('format', format);
	console.log('map', map);
	console.log('format.replace', format.replace(
	  /YYYY|MMMM|MMM|MM|DD|D|YY|HH|mm|ss/g,
	  (token: string | number) => map[token] ?? token
	));
	return format.replace(
	  /YYYY|MMMM|MMM|MM|DD|D|YY|HH|mm|ss/g,
	  (token: string | number) => map[token] ?? token
	);
}  