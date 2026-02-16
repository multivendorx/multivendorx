//External Dependencies
import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import { SelectInputUI } from './SelectInput';
import { BasicInputUI } from './BasicInput';
import { FieldComponent } from './types';

// Constants for default address fields with sequential IDs
const DEFAULT_ADDRESS_FIELDS = [
    { id: 1, key: 'address_1', label: 'Address Line 1', type: 'text', placeholder: 'Address Line 1', required: true },
    { id: 2, key: 'address_2', label: 'Address Line 2', type: 'text', placeholder: 'Address Line 2', required: false },
    { id: 3, key: 'city', label: 'City', type: 'text', placeholder: 'City', required: true },
    { 
        id: 4, key: 'state', label: 'State', type: 'select', 
        options: ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu'],
        required: false 
    },
    { 
        id: 5, key: 'country', label: 'Country', type: 'select', 
        options: ['India', 'USA', 'UK', 'Canada'],
        required: false 
    },
    { id: 6, key: 'postcode', label: 'Postal Code', type: 'text', placeholder: 'Postal Code', required: true },
];

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
    context?: string; // Add context to determine when to use defaults
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
    // Use default fields if no fields are provided and context is registration
    const [ subFields, setSubFields ] = useState< SubField[] >(
        formField.fields?.length ? formField.fields : 
        (formField.context === 'registration' ? DEFAULT_ADDRESS_FIELDS : [])
    );

    useEffect( () => {
        // Update local state when formField.fields changes
        // If no fields and context is registration, use defaults
        if (formField.fields?.length) {
            setSubFields(formField.fields);
        } else if (!formField.fields?.length && formField.context === 'registration') {
            setSubFields(DEFAULT_ADDRESS_FIELDS);
        } else {
            setSubFields([]);
        }
    }, [ formField.fields, formField.context ] );

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