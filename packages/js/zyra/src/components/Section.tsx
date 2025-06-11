/**
 * External dependencies
 */
import React from 'react';

// Types
export interface SectionProps {
	wrapperClass: string;
	hint?: string;
	value?: string;
}

const Section: React.FC< SectionProps > = ( { wrapperClass, hint, value } ) => {
	return (
		<>
			<div className={ wrapperClass }>
				{ value && <span>{ value }</span> }
				{ hint && (
					<p
						className="section-hint"
						dangerouslySetInnerHTML={ { __html: hint } }
					></p>
				) }
			</div>
		</>
	);
};

export default Section;
