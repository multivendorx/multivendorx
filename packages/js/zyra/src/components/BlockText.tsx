/**
 * External dependencies
 */
import React from 'react';

// Types
interface BlockTextProps {
    blockTextClass: string;
    value: string;
}

const BlockText: React.FC<BlockTextProps> = ({ blockTextClass, value }) => {
    return (
        <>
            <div className={blockTextClass}>
                <i className="adminlib-info"></i>
                <p
                    dangerouslySetInnerHTML={{ __html: value }}
                ></p>
            </div>
        </>
    );
};

export default BlockText;
