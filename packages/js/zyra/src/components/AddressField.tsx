import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import SimpleInput from './SimpleInput';
import MultipleOptions from './MultipleOption';


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
    onChange: ( key: 'fields', value: SubField[] ) => void;
    opendInput: SubField | null;
    setOpendInput: React.Dispatch< React.SetStateAction< SubField | null > >;
}

const AddressField: React.FC< AddressFieldProps > = ( {
    formField,
    onChange,
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
        onChange( 'fields', updated );
    };

    return (
        <div className="address-field-wrapper">
            <ReactSortable
                list={ subFields }
                setList={ updateParent }
                handle=".drag-handle"
                animation={ 150 }
            >
                { subFields.map( ( f ) => (
                    <div
                        key={ f.id }
                        className={ `form-field ${
                            opendInput?.id === f.id ? 'active' : ''
                        }` }
                        onClick={ ( e ) => {
                            e.stopPropagation();
                            setOpendInput( {
                                ...f,
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

                        { f.type === 'text' && (
                            <SimpleInput
                                formField={ {
                                    label: f.label,
                                    placeholder: f.placeholder,
                                } }
                            />
                        ) }

                        { f.type === 'select' && (
                            <MultipleOptions
                                formField={ {
                                    label: f.label,
                                    type: 'dropdown',
                                    options:
                                        f.options?.map( ( opt ) => ( {
                                            id: opt,
                                            value: opt,
                                            label: opt,
                                        } ) ) || [],
                                } }
                                type="dropdown"
                                selected={ false }
                                onChange={ () => {} }
                            />
                        ) }
                    </div>
                ) ) }
            </ReactSortable>
        </div>
    );
};

export default AddressField;
