/**
 * CSV helpers for the subscriber and stock lists. The single copy: Notifima's own Subscribers screen uses it, and
 * Notifima Pro imports it from this package (`notifima/src/services/csv`, a workspace dependency) for its Subscribers,
 * Manage Stock and MultiVendorX store subscriber lists.
 */

interface CsvHeaderColumn {
	label: string;
	/** `false` leaves the column out of the export. */
	csvDisplay?: boolean;
	[key: string]: unknown;
}

type CsvHeaders = Record<string, CsvHeaderColumn>;

type CsvRow = Record<string, string | number | boolean | null | undefined>;

/** A date as `YYYY-MM-DD` for the REST date filters; empty when there is no date. */
export const formatLocalDate = (date?: Date) =>
	date ? date.toISOString().split('T')[0] : '';

/** Builds a CSV from `rows` (one column per header not marked `csvDisplay: false`) and downloads it. */
export const downloadCSV = (
	headers: CsvHeaders,
	rows: CsvRow[],
	filename: string = 'export.csv'
) => {
	if (!rows || rows.length === 0) {
		return;
	}

	// Only include headers with csv: true
	const csvColumns = Object.entries(headers)
		.filter(([, h]) => h.csvDisplay !== false)
		.map(([key, h]) => ({ key, label: h.label }));

	// Header row
	const csvRows = [csvColumns.map((c) => `"${c.label}"`).join(',')];

	// Data rows
	rows.forEach((row) => {
		const rowData = csvColumns
			.map((col) => {
				const value = row[col.key];
				return `"${value != null ? value : ''}"`;
			})
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
