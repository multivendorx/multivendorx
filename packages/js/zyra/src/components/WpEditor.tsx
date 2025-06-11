// Check in MVX

/**
 * External dependencies
 */
import { Editor } from '@tinymce/tinymce-react';
import React from 'react';

// Types
export interface WpEditorProps {
	apiKey: string;
	value: string;
	onEditorChange: ( content: string ) => void;
}

const WpEditor: React.FC< WpEditorProps > = ( {
	apiKey,
	value,
	onEditorChange,
} ) => {
	return (
		<>
			<Editor
				apiKey={ apiKey }
				value={ value }
				init={ {
					height: 200,
					plugins: 'media',
				} }
				onEditorChange={ ( content: string ) =>
					onEditorChange( content )
				}
			/>
		</>
	);
};

export default WpEditor;
