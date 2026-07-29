import { applyFilters } from '@wordpress/hooks';

/**
 * Same `require.context`-based settings-tab discovery
 * `vulopilot/src/services/templateService.ts` (and the free multivendorx
 * plugin's own templateService.ts) uses — react-frontend.md's
 * "declarative settings-config pattern". Settings.tsx used to import a
 * single hardcoded `{ name, type, content }` entry directly (there was
 * exactly one tab file, General.ts) — now that there are 12 tab files
 * under `../settings`, that one-off allowance no longer applies, so this
 * scans the folder instead, same as every sibling plugin with more than
 * one settings tab already does. `vulocart_settings_context` is this
 * plugin's own filter name (not multivendorx's/vulopilot's), so a future
 * vulocart-pro settings tab (e.g. Passport-specific fields) registers
 * into a filter actually scoped to this plugin family.
 */
const contexts: Record< string, any > = {
	settings: require.context( '../settings', true, /\.ts$/ ),
};

type SettingNode = {
	name: string;
	type: 'folder' | 'file';
	content: SettingNode[] | any;
	folderPriority?: number;
};

const importAll = ( inpContext: any ): SettingNode[] => {
	const folderStructure: SettingNode[] = [];
	const folderPriorityMap: Record< string, number > = {};

	inpContext.keys().forEach( ( key: string ) => {
		if ( key.endsWith( 'FolderPriority.ts' ) ) {
			const folderPath = key
				.replace( './', '' )
				.replace( '/FolderPriority.ts', '' );
			const priorityData = inpContext( key )?.default;
			if ( priorityData && typeof priorityData.priority === 'number' ) {
				folderPriorityMap[ folderPath ] = priorityData.priority;
			}
		}
	} );

	const formatFolderName = ( name: string ): string => {
		return name
			.replace( /[_-]/g, ' ' )
			.replace( /([a-z])([A-Z])/g, '$1 $2' )
			.replace( /([A-Z]+)([A-Z][a-z])/g, '$1 $2' )
			.replace( /\s+/g, ' ' )
			.trim();
	};

	inpContext.keys().forEach( ( key: string ) => {
		const path = key.substring( 2 );
		const parts = path.split( '/' );
		const fileName = parts.pop();
		let currentFolder = folderStructure;
		let fullPath = '';

		parts.forEach( ( folder ) => {
			fullPath = fullPath ? `${ fullPath }/${ folder }` : folder;

			const formattedFolderName = formatFolderName( folder );

			let folderObject = currentFolder.find(
				( item ) =>
					item.name === formattedFolderName && item.type === 'folder'
			) as SettingNode | undefined;

			if ( ! folderObject ) {
				folderObject = {
					name: formattedFolderName,
					type: 'folder',
					content: [],
					folderPriority: folderPriorityMap[ fullPath ],
				};
				currentFolder.push( folderObject );
			}

			currentFolder = folderObject.content;
		} );

		if ( fileName !== 'FolderPriority.ts' ) {
			currentFolder.push( {
				name: fileName!.replace( '.ts', '' ),
				type: 'file',
				content: inpContext( key ).default,
			} );
		}
	} );

	const sortStructure = ( nodes: SettingNode[] ): SettingNode[] => {
		return nodes
			.sort( ( a, b ) => {
				const getPriority = ( node: SettingNode ): number => {
					if ( node.type === 'file' ) {
						return node.content?.priority ?? Infinity;
					}
					return node.folderPriority ?? Infinity;
				};

				return getPriority( a ) - getPriority( b );
			} )
			.map( ( node ) => {
				if ( node.type === 'folder' ) {
					return { ...node, content: sortStructure( node.content ) };
				}
				return node;
			} );
	};

	return sortStructure( folderStructure );
};

const getTemplateData = ( type: 'settings' ): SettingNode[] => {
	let ctx = contexts[ type ];

	if ( ! ctx ) {
		// eslint-disable-next-line no-console
		console.warn( `No context found for type: ${ type }` );
		return [];
	}

	ctx = applyFilters( 'vulocart_settings_context', ctx, type ) as typeof ctx;

	return importAll( ctx );
};

export { getTemplateData };
export default getTemplateData;
