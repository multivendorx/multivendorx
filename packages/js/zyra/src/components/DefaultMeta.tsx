/**
 * External dependencies
 */
import React from "react";

// Types
interface DefaultMetaProps {
    defaultvalue: string;
    name: string;
    deactive: boolean;
    onChange: (
        field: "deactive" | "name" | "defaultvalue",
        value: boolean | string
    ) => void;
    hideDefaultValue?: boolean;
    hideName?: boolean;
    hideDeactive?: boolean;
}
const DefaultMeta: React.FC< DefaultMetaProps > = ( {
    defaultvalue,
    name,
    deactive,
    onChange,
    hideDefaultValue,
    hideName,
    hideDeactive,
} ) => {
    return (
        <>
            { ! hideDeactive && (
                <div className="deactive">
                    <span>Deactive</span>
                    <input
                        type="checkbox"
                        checked={ deactive }
                        onChange={ ( event ) => {
                            onChange( "deactive", ! event.target.checked );
                        } }
                    />
                </div>
            ) }
            { ! hideName && (
                <div className="name">
                    <span>Set name</span>
                    <input
                        type="text"
                        value={ name }
                        onChange={ ( event ) => {
                            onChange( "name", ! event.target.name );
                        } }
                    />
                </div>
            ) }
            { ! hideDefaultValue && (
                <div className="default-value">
                    <span>Set Defaut Value</span>
                    <input
                        type="text"
                        value={ defaultvalue }
                        onChange={ ( event ) => {
                            onChange( "defaultvalue", ! event.target.name );
                        } }
                    />
                </div>
            ) }
        </>
    );
};

export default DefaultMeta;
