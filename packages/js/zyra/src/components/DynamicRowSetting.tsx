// External dependencies
import React from 'react';

// Internal dependencies
import '../styles/web/DynamicRowSetting.scss';
import '../styles/web/ToggleSetting.scss';
import { SelectInputUI } from './SelectInput';

// Types
type FieldType = 'text' | 'number' | 'file' | 'select' | 'button';

type RowValue = Record< string, string | number | File | RowValue[] | null >;

interface FieldConfig {
    key: string;
    label?: string;
    type: FieldType;
    placeholder?: string;
    options?: { label: string; value: string; children?: RowValue[] }[];
    width?: string;
    onClick?: ( params: {
        row: RowValue;
        rowIndex: number;
        updateRow: ( patch: Partial< RowValue > ) => void;
    } ) => void;
}

interface RowConfig {
    fields: FieldConfig[];
}

export interface DynamicRowSettingProps {
    wrapperClass?: string;
    keyName: string;
    template: RowConfig;
    value: RowValue[];
    onChange: ( rows: RowValue[] ) => void;
    addLabel?: string;
    childrenRenderer?: (
        row: RowValue,
        rowIndex: number
    ) => React.ReactNode | false;
}

const DynamicRowSetting: React.FC< DynamicRowSettingProps > = ( {
    wrapperClass = '',
    template,
    value,
    onChange,
    addLabel = 'Add New',
    childrenRenderer = () => false,
} ) => {
    const handleAdd = () => {
        const emptyRow: RowValue = {};
        template.fields.forEach( ( field ) => {
            emptyRow[ field.key ] = field.type === 'file' ? null : '';
        } );
        onChange( [ ...value, emptyRow ] );
    };

    const handleChange = (
        rowIndex: number,
        fieldKey: string,
        newVal: string | number | File | RowValue[] | null
    ) => {
        const updatedRows = [ ...value ];
        updatedRows[ rowIndex ] = {
            ...updatedRows[ rowIndex ],
            [ fieldKey ]: newVal,
        };
        onChange( updatedRows );
    };

    const handleDelete = ( rowIndex: number ) => {
        onChange( value.filter( ( _, i ) => i !== rowIndex ) );
    };

    const renderField = (
        row: RowValue,
        field: FieldConfig,
        rowIndex: number
    ) => {
        const val = row[ field.key ];

        switch ( field.type ) {
            case 'text':
            case 'number':
                return (
                    <input
                        type={ field.type }
                        placeholder={ field.placeholder }
                        className="basic-input"
                        value={ val as string | number }
                        onChange={ ( e ) =>
                            handleChange( rowIndex, field.key, e.target.value )
                        }
                    />
                );

            case 'file':
                return (
                    <input
                        type="file"
                        className="basic-input"
                        onChange={ (
                            e: React.ChangeEvent< HTMLInputElement >
                        ) => {
                            const file = e.target.files?.[ 0 ] || null;
                            handleChange( rowIndex, field.key, file );
                        } }
                    />
                );

            // Inside renderField:
            case 'select':
                // Transform options to SelectInput format
                const selectOptions: SelectOptions[] = (
                    field.options || []
                ).map( ( opt ) => ( { value: opt.value, label: opt.label } ) );

                return (
                    <div className="select-wrapper">
                        <SelectInputUI
                            name={ field.key }
                            value={ val as string }
                            options={ selectOptions }
                            inputClass="react-select"
                            onChange={ ( newValue ) => {
                                // react-select SingleValue type
                                const selected = newValue as any;
                                handleChange(
                                    rowIndex,
                                    field.key,
                                    selected?.value || ''
                                );

                                const children = field.options?.find(
                                    ( opt ) => opt.value === selected?.value
                                )?.children;

                                if ( children ) {
                                    handleChange(
                                        rowIndex,
                                        field.key + '_children',
                                        children
                                    );
                                }
                            } }
                        />
                    </div>
                );

            case 'button':
                return (
                    <button
                        type="button"
                        className="admin-btn btn-purple"
                        onClick={ () =>
                            field.onClick?.( {
                                row,
                                rowIndex,
                                updateRow: ( patch ) => {
                                    const updatedRows = [ ...value ];
                                    updatedRows[ rowIndex ] = {
                                        ...updatedRows[ rowIndex ],
                                        ...patch,
                                    };
                                    onChange( updatedRows );
                                },
                            } )
                        }
                    >
                        { field.label }
                    </button>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className={ `repeater-field-wrapper ${ wrapperClass }` }>
                { value.map( ( row, rowIndex ) => (
                        <div key={ rowIndex } className="repeater-field">
                            <div className="field">
                                { template.fields.map( ( field ) => (
                                    { renderField( row, field, rowIndex ) }
                                ) ) }

                                <span
                                    className="delete-icon adminfont-delete"
                                    onClick={ () => handleDelete( rowIndex ) }
                                ></span>
                            </div>
                            { ( () => {
                                const nestedChildren = childrenRenderer?.(
                                    row,
                                    rowIndex
                                );
                                return nestedChildren ? (
                                    <div className="repeater-field-nested">
                                        { nestedChildren }
                                    </div>
                                ) : null;
                            } )() }
                        </div>
                ) ) }

                <button
                    type="button"
                    className="admin-btn btn-purple-bg"
                    onClick={ handleAdd }
                >
                    <i className="adminfont-plus"></i> { addLabel }
                </button>
            </div>
        </>
    );
};

export default DynamicRowSetting;
