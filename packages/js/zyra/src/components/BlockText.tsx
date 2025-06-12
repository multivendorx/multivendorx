/**
 * External dependencies
 */
import React from 'react';

// Types
interface BlockTextProps {
	blockTextClass: string;
	value: string;
}

const BlockText: React.FC< BlockTextProps > = ( { blockTextClass, value } ) => {
	return (
		<>
			<p
				className={ blockTextClass }
				dangerouslySetInnerHTML={ { __html: value } }
			></p>
		</>
	);
};

export default BlockText;
