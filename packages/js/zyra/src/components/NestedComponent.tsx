// External dependencies
import React, { useState, useEffect } from 'react';

// Internal dependencies
import '../styles/web/NestedComponent.scss';
import { FieldComponent } from './types';
import { FIELD_REGISTRY } from './FieldRegistry';

type RowType = Record< string, string | number | boolean | string[] >;


interface NestedFieldOption {
    key?: string;
    value: string;
    label: string;
    proSetting?: boolean;
    check?: boolean;
}

interface NestedField {
    lock: string;
    multiple: boolean;
    key: string;
    type:
        | 'number'
        | 'setting-toggle'
        | 'text'
        | 'select'
        | 'time'
        | 'checkbox'
        | 'textarea'
        | 'checklist'
        | 'divider';
    label?: string;
    placeholder?: string;
    options?: NestedFieldOption[];
    dependent?: { key: string; set: boolean; value: string };
    firstRowOnly?: boolean;
    skipFirstRow?: boolean;
    skipLabel?: boolean;
    postInsideText?: string;
    preInsideText?: string;
    preText?: string;
    postText?: string;
    preTextFirstRow?: string;
    postTextFirstRow?: string;
    desc?: string;
    size?: string;
    min?: number;
    defaultValue?: string;
    className?: string;
    proSetting?: boolean;

    // for checkbox fields
    selectDeselect?: boolean;
    tour?: string;
    rightContent?: boolean;
    moduleEnabled?: string;
    dependentSetting?: string;
    dependentPlugin?: string;

    hideCheckbox?: boolean;
    link?: string;
}

interface NestedComponentProps {
    id: string;
    label?: string;
    fields: NestedField[];
    value: RowType[];
    addButtonLabel?: string;
    deleteButtonLabel?: string;
    onChange: ( value: RowType[] ) => void;
    single?: boolean;
    description?: string;
    wrapperClass?: string;
    canAccess?: boolean;
    appLocalizer?: any;
}

export const NestedComponentUI: React.FC< NestedComponentProps > = ( {
    id,
    fields,
    value = [],
    onChange,
    addButtonLabel = 'Add',
    deleteButtonLabel = 'Delete',
    single = false,
    description,
    wrapperClass,
    canAccess,
    appLocalizer
} ) => {
    
    const [ rows, setRows ] = useState< RowType[] >( [] );

    // sync value → state
    useEffect( () => {
        setRows(
            single
                ? value.length
                    ? [ value[ 0 ] ]
                    : [ {} ]
                : value.length
                ? value
                : [ {} ]
        );
    }, [ value, single ] );

    function updateAndSave( updated: RowType[] ) {
        setRows( updated );
        onChange( updated );
    }

    function handleChange(
        rowIndex: number,
        key: string,
        value: string | number | boolean | string[]
    ) {
        updateAndSave(
            rows.map( ( row, i ) =>
                i === rowIndex ? { ...row, [ key ]: value } : row
            )
        );
    }

    function isLastRowComplete() {
        if ( rows.length === 0 ) {
            return true;
        }
        const lastRowIndex = rows.length - 1;
        const lastRow = rows[ lastRowIndex ] || {};

        if ( lastRowIndex === 0 ) {
            return true;
        }

        return fields.every( ( f ) => {
            if ( 
                f.skipFirstRow && 
                lastRowIndex === 0 
            ) {
                return true;
            }
            if ( 
                f.firstRowOnly && 
                lastRowIndex > 0 
            ) {
                return true;
            }

            const val = lastRow[ f.key ];

            // dependency check
            if ( f.dependent ) {
                const depVal = lastRow[ f.dependent.key ];
                const depActive = Array.isArray( depVal )
                    ? depVal.includes( f.dependent.value )
                    : depVal === f.dependent.value;

                if (
                    ( f.dependent.set && ! depActive ) ||
                    ( ! f.dependent.set && depActive )
                ) {
                    return true;
                }
            }

            return val !== undefined && val !== '';
        } );
    }

    function addRow() {
        if ( single ) {
            return;
        }
        if ( ! isLastRowComplete() ) {
            return;
        }
        updateAndSave( [ ...rows, {} ] );
    }

    function removeRow( index: number ) {
        if ( ! single ) {
            updateAndSave( rows.filter( ( _, i ) => i !== index ) );
        }
    }
    
    function renderField( field: NestedField, row: RowType, rowIndex: number ) {
        if (
            rowIndex === 0 && 
            field.skipFirstRow
        ) {
            return null;
        }
        if ( 
            rowIndex > 0 && 
            field.firstRowOnly 
        ) {
            return null;
        }

        // dependency check
        // if ( field.dependent ) {
        //     const depVal = row[ field.dependent.key ];
        //     const depActive = Array.isArray( depVal )
        //         ? depVal.includes( field.dependent.value )
        //         : depVal === field.dependent.value;

        //     if (
        //         ( field.dependent.set && ! depActive ) ||
        //         ( ! field.dependent.set && depActive )
        //     ) {
        //         return null;
        //     }
        // }

        const fieldComponent = FIELD_REGISTRY[field.type];
        if (!fieldComponent) return null;

        const Render = fieldComponent.render;
        const fieldValue = row[ field.key ];
            
        const handleInternalChange = (val: any) => {
            handleChange( rowIndex, field.key, val )
            return;            
        };

        return (
            <>
                { ! ( rowIndex === 0 && field.skipLabel ) &&
                    field.label && <label>{ field.label }</label> }
                <Render
                    field={field}
                    value={fieldValue}
                    onChange={handleInternalChange}
                    canAccess={canAccess}
                    appLocalizer={appLocalizer}
                />
            </>
        );
    }

    return (
        <div className="nested-wrapper" id={ id }>
            { rows.map( ( row, rowIndex ) => (
                <div
                    key={ `nested-row-${ rowIndex }` }
                    className={ `nested-row ${
                        single ? '' : 'multiple'
                    } ${ wrapperClass }` }
                >
                    { fields.map( ( field ) =>
                        renderField( field, row, rowIndex )
                    ) }
                    { ! single && (
                        <div className="buttons-wrapper">
                            { /* Add button only on last row */ }
                            { rowIndex === rows.length - 1 && (
                                <button
                                    type="button"
                                    className="admin-btn btn-purple"
                                    onClick={ addRow }
                                    disabled={ ! isLastRowComplete() }
                                >
                                    <i className="adminfont-plus"></i>{ ' ' }
                                    { addButtonLabel }
                                </button>
                            ) }

                            { /* Delete button on all rows except row 0 */ }
                            { rows.length > 1 && rowIndex > 0 && (
                                <button
                                    type="button"
                                    className="admin-btn btn-red"
                                    onClick={ () => removeRow( rowIndex ) }
                                >
                                    <i className="adminfont-delete"></i>{ ' ' }
                                    { deleteButtonLabel }
                                </button>
                            ) }
                        </div>
                    ) }
                </div>
            ) ) }
            { description && (
                <p
                    className="settings-metabox-description"
                    dangerouslySetInnerHTML={ { __html: description } }
                />
            ) }
        </div>
    );
};

const NestedComponent: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <NestedComponentUI
            key={field.key}
            id={field.key}
            label={field.label}
            description={field.desc}
            fields={field.nestedFields ?? []} //The list of inner fields that belong to this section.
            value={value}
            wrapperClass={field.rowClass}
            addButtonLabel={field.addButtonLabel} //The text shown on the button to add a new item.
            deleteButtonLabel={field.deleteButtonLabel} //The text shown on the button to remove an item.
            single={field.single} //If set to true, only one item is allowed.
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val)
            }}
            canAccess={canAccess}
            appLocalizer={appLocalizer}
        />
    ),

    validate: (field, value) => {
        return null;
    },

};

export default NestedComponent;
