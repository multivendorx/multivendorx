//External Dependencies
import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import { SelectInputUI } from './SelectInput';
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
    value?: string | string[]; // Add value to store selected option
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
    opendInput: SubField | null;
    setOpendInput: React.Dispatch< React.SetStateAction< SubField | null > >;
}

const AddressFieldUI: React.FC< AddressFieldProps > = ( {
    formField,
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
    };

    const FieldRenderers = {
        text: (field: SubField) => (
            <>
                <p>{field.label}</p>
                <BasicInputUI
                    type= "text"
                    placeholder= {field.placeholder}
                />
            </>
        ),
        select: (field: SubField) => {
            return (
                <div className="address-field-item">
                    <label className="field-label">{field.label}</label>
                    <SelectInputUI
                        options={field.options?.map((opt) => ({
                            value: opt,
                            label: opt,
                        })) || []}
                    />
                </div>
            );
        }
    };

    if(!subFields.length){
        return null;
    }

    return (
        <div className="address-field-wrapper">
            <h4 className="address-section-title">{formField.label}</h4>
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