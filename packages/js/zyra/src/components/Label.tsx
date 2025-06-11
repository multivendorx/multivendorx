// Check In MVX

/**
 * External dependencies
 */
import React from 'react';

// Types
export interface LabelProps {
	wrapperClass: string;
	descClass: string;
	description?: string;
	value: string;
}

const Label: React.FC< LabelProps > = ( {
	wrapperClass,
	descClass,
	description,
	value,
} ) => {
	return (
		<>
			<div className={ wrapperClass }>
				<label htmlFor={ descClass }>{ value }</label>
				<p className={ descClass }>{ description }</p>
			</div>
		</>
	);
};

export default Label;
