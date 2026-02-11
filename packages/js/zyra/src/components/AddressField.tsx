//External Dependencies
import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import MultipleOptions from './MultipleOption';
import { BasicInputUI } from './BasicInput';
import { FieldComponent } from './types';

interface SubField {
    id: number;
    key: string;
    label: string;
    type: 'text' | 'select';
    placeholder?: string;
    options?: string[];
    required?: boolean;
    readonly?: boolean;
    parentId?: number;
}

export interface AddressFormField {
    id: number;
    type: string;
    label: string;
    fields?: SubField[];
    value?: Record< string, string >;
    readonly?: boolean;
}

interface AddressFieldProps {
    formField: AddressFormField;
    // onChange: ( key: 'fields', value: SubField[] ) => void;
    opendInput: SubField | null;
    setOpendInput: React.Dispatch< React.SetStateAction< SubField | null > >;
}

const AddressFieldUI: React.FC< AddressFieldProps > = ( {
    formField,
    // onChange,
    opendInput,
    setOpendInput,
} ) => {
    const [ subFields, setSubFields ] = useState< SubField[] >(
        formField.fields || []
    );

    useEffect( () => {
        setSubFields( formField.fields || [] );
    }, [ formField.fields ] );

    // Update parent
    const updateParent = ( updated: SubField[] ) => {
        setSubFields( updated );
        // onChange( 'fields', updated );
    };

    const FieldRenderers = {
        text: (f: SubField) => (
            <>
                <p>{f.label}</p>
                <BasicInputUI
                    type= "text"
                    placeholder= {f.placeholder}
                />
            </>
        ),
        select: (field: SubField) => (
            <MultipleOptions
                formField={{
                    label: field.label,
                    type: 'dropdown',
                    options: field.options?.map((opt) => ({
                        id: opt,
                        value: opt,
                        label: opt,
                    })) || [],
                }}
                type="dropdown"
                selected={false}
                // onChange={() => {}}
            />
        ),
    };

    if(!subFields.length){
        return null;
    }

    return (
        <div className="address-field-wrapper">
            <ReactSortable
                list={ subFields }
                setList={ updateParent }
                handle=".drag-handle"
                animation={ 150 }
            >
                { subFields.map( ( field ) => (
                    <div
                        key={ field.id }
                        className={ `form-field ${
                            opendInput?.id === field.id ? 'active' : ''
                        }` }
                        onClick={ ( e ) => {
                            e.stopPropagation();
                            setOpendInput( {
                                ...field,
                                readonly: formField.readonly,
                                parentId: formField.id,
                            } );
                        } }
                    >
                        <div className="meta-menu">
                            <span className="admin-badge blue drag-handle">
                                <i className="admin-font adminfont-drag"></i>
                            </span>
                        </div>

                        {FieldRenderers[field.type]?.(field)}

                    </div>
                ) ) }
            </ReactSortable>
        </div>
    );
};

const AddressField: FieldComponent = {
    render: ( { field, value, onChange, canAccess, appLocalizer } ) => {
        const [ openedInput, setOpenedInput ] = useState< SubField | null >( null );

        return (
            <AddressFieldUI
                formField={ field as AddressFormField }
                opendInput={ openedInput }
                setOpendInput={ setOpenedInput }
            />
        );
    },
};
export default AddressField;
