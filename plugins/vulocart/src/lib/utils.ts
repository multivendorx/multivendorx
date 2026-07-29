import clsx, { type ClassValue } from 'clsx';

/**
 * shadcn/ui's usual `cn()` helper is `clsx` + `tailwind-merge` — this repo
 * deliberately has no Tailwind toolchain (styles are plain SCSS per
 * component instead), so `tailwind-merge` isn't useful here and is
 * dropped; `clsx` alone is still the right tool for conditionally joining
 * class names from a `cva()` variant call.
 */
export function cn( ...inputs: ClassValue[] ): string {
	return clsx( ...inputs );
}

/**
 * Client-side CSV export for a zyra `TableCard` — same shape/behavior as
 * `multivendorx/src/services/commonFunction.ts`'s `downloadCSV()` (that
 * plugin's own Commissions.tsx CSV export, a real, working reference for
 * `TableCard`'s `onSelectCsvDownloadApply`/`buttonActions` props). Ported
 * rather than imported since it's plugin-local, not part of `zyra`'s own
 * exports.
 */
export function downloadCSV(
	headers: Record< string, { label?: string; csvDisplay?: boolean } >,
	rows: Array< Record< string, unknown > >,
	filename: string = 'export.csv'
) {
	if ( ! rows || rows.length === 0 ) {
		return;
	}

	const csvColumns = Object.entries( headers )
		.filter( ( [ , header ] ) => header.csvDisplay !== false )
		.map( ( [ key, header ] ) => ( { key, label: header.label } ) );

	const csvRows = [ csvColumns.map( ( column ) => `"${ column.label }"` ).join( ',' ) ];

	rows.forEach( ( row ) => {
		const rowData = csvColumns
			.map( ( column ) => {
				const value = row[ column.key ];
				return `"${ value != null ? value : '' }"`;
			} )
			.join( ',' );
		csvRows.push( rowData );
	} );

	const csvContent = csvRows.join( '\n' );
	const blob = new Blob( [ csvContent ], { type: 'text/csv;charset=utf-8;' } );
	const url = URL.createObjectURL( blob );
	const link = document.createElement( 'a' );
	link.href = url;
	link.setAttribute( 'download', filename );
	document.body.appendChild( link );
	link.click();
	document.body.removeChild( link );
	URL.revokeObjectURL( url );
}
