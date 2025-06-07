/**
 * External dependencies
 */
import React, { useState, useEffect, useRef } from "react";

/**
 * Internal dependencies
 */
import "../styles/web/MergeComponent.scss";

// Types
interface Field {
    name: string;
    type: "select" | "number" | "text"; // Include "text" in the type property
    options?: { value: string; label: string }[]; // For select fields
    placeholder?: string;
}
interface MergeComponentProps {
    wrapperClass?: string;
    descClass?: string;
    description?: string;
    onChange: ( data: Record< string, string | number > ) => void;
    value: Record< string, string | number >;
    proSetting?: boolean;
    fields: Field[];
}

const MergeComponent: React.FC< MergeComponentProps > = ( {
    wrapperClass = "",
    descClass = "",
    description,
    onChange,
    value,
    proSetting = false,
    fields = [],
} ) => {
    const firstRender = useRef( true );

    // Initialize state dynamically based on field names
    const initialState = fields.reduce< Record< string, string | number > >(
        ( acc, field ) => {
            acc[ field.name ] = value[ field.name ] || "";
            return acc;
        },
        {} as Record< string, string | number >
    );

    const [ data, setData ] = useState( initialState );

    const handleOnChange = ( key: string, value: string | number ) => {
        setData( ( prev ) => ( { ...prev, [ key ]: value } ) );
    };

    useEffect( () => {
        if ( firstRender.current ) {
            firstRender.current = false;
            return; // Skip the initial render
        }
        onChange( data );
    }, [ data ] );

    return (
        <main className={ wrapperClass }>
            <section className="select-input-section merge-components">
                { fields.map( ( field ) => {
                    const {
                        name,
                        type,
                        options = [],
                        placeholder = "Enter a value",
                    } = field;

                    if ( type === "select" ) {
                        return (
                            <select
                                key={ name }
                                id={ name }
                                value={ data[ name ] }
                                onChange={ ( e ) =>
                                    handleOnChange( name, e.target.value )
                                }
                            >
                                <option value="">Select</option>
                                { options.map( ( option ) => (
                                    <option
                                        key={ option.value }
                                        value={ option.value }
                                    >
                                        { option.label }
                                    </option>
                                ) ) }
                            </select>
                        );
                    } else if ( type === "number" ) {
                        return (
                            <input
                                key={ name }
                                type={ type }
                                id={ name }
                                placeholder={ placeholder }
                                value={ data[ name ] }
                                min={ 1 }
                                onChange={ ( e ) =>
                                    handleOnChange(
                                        name,
                                        Number( e.target.value )
                                    )
                                }
                            />
                        );
                    }

                    return null; // Return null for unsupported types
                } ) }
            </section>

            { description && (
                <p
                    className={ descClass }
                    dangerouslySetInnerHTML={ { __html: description } }
                />
            ) }
            { proSetting && <span className="admin-pro-tag">pro</span> }
        </main>
    );
};

export default MergeComponent;
