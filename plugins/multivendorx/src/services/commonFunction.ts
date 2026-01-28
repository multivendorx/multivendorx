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

export const formatWcShortDate = (dateString: any) => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
};

export function formatTimeAgo(dateString: string) {
	// Force UTC
	const date = new Date(dateString + 'Z');

	const diff = Math.floor((Date.now() - date.getTime()) / 1000);

	if (diff < 60) return 'Just now';
	if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;
	return `${Math.floor(diff / 86400)} day ago`;
}


export const formatLocalDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};
