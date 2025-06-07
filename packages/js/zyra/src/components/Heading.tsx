/**
 * External dependencies
 */
import React from "react";

// Types
export interface HeadingProps {
    wrapperClass?: string;
    blocktext?: string;
}

export const Heading: React.FC< HeadingProps > = ( {
    wrapperClass,
    blocktext,
} ) => {
    return (
        <div className={ wrapperClass }>
            { blocktext && (
                <h5 dangerouslySetInnerHTML={ { __html: blocktext } }></h5>
            ) }
        </div>
    );
};

export default Heading;
