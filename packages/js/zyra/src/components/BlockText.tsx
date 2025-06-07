/**
 * External dependencies
 */
import React from "react";

// Types
export interface BlockTextProps {
    wrapperClass: string;
    blockTextClass: string;
    value: string;
}

const BlockText: React.FC< BlockTextProps > = ( {
    wrapperClass,
    blockTextClass,
    value,
} ) => {
    return (
        <>
            <div className={ wrapperClass }>
                <p
                    className={ blockTextClass }
                    dangerouslySetInnerHTML={ { __html: value } }
                ></p>
            </div>
        </>
    );
};

export default BlockText;
