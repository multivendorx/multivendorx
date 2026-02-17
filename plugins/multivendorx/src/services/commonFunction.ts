export function truncateText(text: string, maxLength: number) {
	if (!text) {
		return '-';
	}
	return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
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
	const date = new Date(dateString);
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
	return format.replace(
	  /YYYY|MMMM|MMM|MM|DD|D|YY|HH|mm|ss/g,
	  (token: string | number) => map[token] ?? token
	);
}  