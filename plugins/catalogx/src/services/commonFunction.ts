/** `Y-m-d` for a date, without the time (for date-range filters sent to the REST API). */
export const formatLocalDate = (date?: Date) =>
	date ? date.toISOString().split('T')[0] : '';

/** "May 12, 2026" for a date string, or "-" when there is none or it can't be read. */
export const formatDate = (date?: string): string => {
	if (!date) {
		return '-';
	}

	const d = new Date(date);
	if (isNaN(d.getTime())) {
		return '-';
	}

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(d);
};
