import React, { useState, useEffect } from 'react';
import '../styles/web/NestedComponent.scss';
import ToggleSetting from './ToggleSetting';
import BasicInput from './BasicInput';
import SelectInput from './SelectInput';
import MultiCheckBox from './MultiCheckbox';
import TextArea from './TextArea';

type RowType = Record< string, string | number | boolean | string[] >;

type SelectOption = {
    value: string;
    label: string;
};

interface NestedFieldOption {
    key?: string;
    value: string;
    label: string;
    proSetting?: boolean;
    check?: boolean;
}

interface NestedField {
    lock: string;
    treeData: never[];
    multiple: boolean;
    key: string;
    type:
        | 'number'
        | 'select'
        | 'text'
        | 'url'
        | 'treeselect'
        | 'dropdown'
        | 'time'
        | 'checkbox'
        | 'textarea'
        | 'checklist'
        | 'setup'
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

declare const appLocalizer: { khali_dabba?: boolean };
declare function setModelOpen( value: boolean ): void;

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
    khali_dabba?: boolean;
    modules?: string[];
}

const NestedComponent: React.FC< NestedComponentProps > = ( {
    id,
    fields,
    value = [],
    onChange,
    addButtonLabel = 'Add',
    deleteButtonLabel = 'Delete',
    single = false,
    description,
    wrapperClass,
    khali_dabba,
    modules,
} ) => {
    function hasFieldAccess( field: NestedField ) {
        // PRO CHECK
        if ( field.proSetting ) {
            if ( ! khali_dabba ) {
                return false;
            }
        }

        // MODULE CHECK
        if ( field.moduleEnabled ) {
            // modules is an array of enabled module names
            if (
                ! Array.isArray( modules ) ||
                ! modules.includes( field.moduleEnabled )
            ) {
                return false; // module not active
            }
        }

        return true; // access allowed
    }

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
            if ( f.skipFirstRow && lastRowIndex === 0 ) {
                return true;
            }
            if ( f.firstRowOnly && lastRowIndex > 0 ) {
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
        if ( rowIndex === 0 && field.skipFirstRow ) {
            return null;
        }
        if ( rowIndex > 0 && field.firstRowOnly ) {
            return null;
        }

        const val = row[ field.key ] ?? '';

        // dependency check
        if ( field.dependent ) {
            const depVal = row[ field.dependent.key ];
            const depActive = Array.isArray( depVal )
                ? depVal.includes( field.dependent.value )
                : depVal === field.dependent.value;

            if (
                ( field.dependent.set && ! depActive ) ||
                ( ! field.dependent.set && depActive )
            ) {
                return null;
            }
        }

        switch ( field.type ) {
            case 'select':
                return (
                    <>
                        { ! ( rowIndex === 0 && field.skipLabel ) &&
                            field.label && <label>{ field.label }</label> }
                        <ToggleSetting
                            key={ field.key }
                            options={ field.options || [] }
                            value={
                                typeof val === 'string' || Array.isArray( val )
                                    ? val
                                    : ''
                            }
                            onChange={ ( newVal ) => {
                                if ( ! hasFieldAccess( field ) ) {
                                    return;
                                }
                                handleChange( rowIndex, field.key, newVal );
                            } }
                            preText={ field.preText }
                            postText={ field.postText }
                        />
                    </>
                );

            case 'number':
            case 'text':
            case 'url':
            case 'time':
                return (
                    <>
                        { ! ( rowIndex === 0 && field.skipLabel ) &&
                            field.label && <label>{ field.label }</label> }
                        <BasicInput
                            type={ field.type }
                            descClass="settings-metabox-description"
                            id={ `${ field.key }-${ rowIndex }` }
                            name={ field.key }
                            value={
                                typeof val === 'string' ||
                                typeof val === 'number'
                                    ? val
                                    : undefined
                            }
                            preInsideText={ field.preInsideText }
                            postInsideText={ field.postInsideText }
                            preText={
                                rowIndex === 0
                                    ? field.preTextFirstRow ?? field.preText
                                    : field.preText
                            }
                            postText={
                                rowIndex === 0
                                    ? field.postTextFirstRow ?? field.postText
                                    : field.postText
                            }
                            min={ field.min ?? 0 }
                            description={ field.desc }
                            size={ field.size }
                            placeholder={ field.placeholder }
                            onChange={ ( e ) => {
                                if ( ! hasFieldAccess( field ) ) {
                                    return;
                                }
                                handleChange(
                                    rowIndex,
                                    field.key,
                                    e.target.value
                                );
                            } }
                        />
                    </>
                );

            case 'textarea':
                return (
                    <>
                        { ! ( rowIndex === 0 && field.skipLabel ) &&
                            field.label && <label>{ field.label }</label> }
                        <TextArea
                            id={ `${ field.key }-${ rowIndex }` }
                            name={ field.key }
                            value={ typeof val === 'string' ? val : '' }
                            placeholder={ field.placeholder }
                            rowNumber={ 4 }
                            colNumber={ 50 }
                            description={ field.desc }
                            descClass="settings-metabox-description"
                            onChange={ ( e ) => {
                                if ( ! hasFieldAccess( field ) ) {
                                    return;
                                }
                                handleChange(
                                    rowIndex,
                                    field.key,
                                    e.target.value
                                );
                            } }
                        />
                    </>
                );

            case 'dropdown':
                return (
                    <>
                        { ! ( rowIndex === 0 && field.skipLabel ) &&
                            field.label && <label>{ field.label }</label> }
                        <SelectInput
                            wrapperClass="form-select-field-wrapper"
                            descClass="settings-metabox-description"
                            name={ field.key }
                            description={ field.desc }
                            inputClass={ field.className }
                            preText={ field.preText }
                            postText={ field.postText }
                            options={
                                Array.isArray( field.options )
                                    ? field.options.map( ( opt ) => ( {
                                          value: String( opt.value ),
                                          label:
                                              opt.label ?? String( opt.value ),
                                      } ) )
                                    : []
                            }
                            value={ typeof val === 'object' ? val.value : val }
                            onChange={ (
                                newVal: SelectOption | SelectOption[] | null
                            ) => {
                                if ( ! hasFieldAccess( field ) ) {
                                    return;
                                }

                                if ( ! newVal ) {
                                    handleChange( rowIndex, field.key, '' );
                                } else if ( Array.isArray( newVal ) ) {
                                    handleChange(
                                        rowIndex,
                                        field.key,
                                        newVal.map( ( v ) => v.value )
                                    );
                                } else {
                                    handleChange(
                                        rowIndex,
                                        field.key,
                                        newVal.value
                                    );
                                }
                            } }
                        />
                    </>
                );

            case 'checkbox': {
                const look = ( field.look || field.lock ) ?? '';
                let normalizedValue: string[] = [];

                if ( Array.isArray( val ) ) {
                    normalizedValue = val.filter(
                        ( v: string ) => v && v.trim() !== ''
                    );
                } else if ( typeof val === 'string' && val.trim() !== '' ) {
                    normalizedValue = [ val ];
                } else {
                    normalizedValue = [];
                }

                return (
                    <>
                        { ! ( rowIndex === 0 && field.skipLabel ) &&
                            field.label && <label>{ field.label }</label> }

                        <MultiCheckBox
                            khali_dabba={ appLocalizer?.khali_dabba ?? false }
                            wrapperClass={
                                look === 'toggle'
                                    ? 'toggle-btn'
                                    : field.selectDeselect === true
                                    ? 'checkbox-list-side-by-side'
                                    : 'simple-checkbox'
                            }
                            descClass="settings-metabox-description"
                            description={ field.desc }
                            selectDeselectClass="admin-btn btn-purple select-deselect-trigger"
                            inputWrapperClass="toggle-checkbox-header"
                            inputInnerWrapperClass={
                                look === 'toggle'
                                    ? 'toggle-checkbox'
                                    : 'default-checkbox'
                            }
                            inputClass={ look }
                            tour={ field.tour }
                            hintOuterClass="settings-metabox-description"
                            hintInnerClass="hover-tooltip"
                            idPrefix={ `${ field.key }-${ rowIndex }` }
                            selectDeselect={ field.selectDeselect }
                            selectDeselectValue="Select / Deselect All"
                            rightContentClass="settings-metabox-description"
                            rightContent={ field.rightContent }
                            options={
                                Array.isArray( field.options )
                                    ? field.options.map( ( opt ) => ( {
                                          ...opt,
                                          value: String( opt.value ),
                                      } ) )
                                    : []
                            }
                            value={ normalizedValue }
                            onChange={ ( e ) => {
                                if ( ! hasFieldAccess( field ) ) {
                                    return;
                                }
                                if ( Array.isArray( e ) ) {
                                    handleChange(
                                        rowIndex,
                                        field.key,
                                        e.length > 0 ? e : []
                                    );
                                } else if ( 'target' in e ) {
                                    const target = e.target as HTMLInputElement;
                                    handleChange(
                                        rowIndex,
                                        field.key,
                                        target.checked ? [ target.value ] : []
                                    );
                                }
                            } }
                            onMultiSelectDeselectChange={ () =>
                                handleChange(
                                    rowIndex,
                                    field.key,
                                    Array.isArray( field.options )
                                        ? field.options.map( ( opt ) =>
                                              String( opt.value )
                                          )
                                        : []
                                )
                            }
                            proChanged={ () => setModelOpen( true ) }
                        />
                    </>
                );
            }
            case 'checklist':
                return (
                    <ul className="checklist" key={ field.key }>
                        { Array.isArray( field.options ) &&
                            field.options.map( ( opt, i ) => (
                                <li key={ i }>
                                    <i
                                        className={
                                            opt.check
                                                ? 'check adminfont-icon-yes'
                                                : 'close adminfont-cross'
                                        }
                                    ></i>
                                    { opt.label ?? opt.value }
                                </li>
                            ) ) }
                    </ul>
                );

            case 'setup':
                return (
                    <>
                        <div className="wizard-step">
                            <div className="step-info">
                                <div className="step-text">
                                    <span className="step-title">
                                        { field.label }
                                    </span>
                                    <span className="desc">{ field.desc }</span>
                                </div>
                            </div>
                            { field.link && (
                                <a
                                    href={ field.link }
                                    className="admin-btn btn-purple"
                                >
                                    Set Up{ ' ' }
                                    <i className="adminfont-arrow-right"></i>{ ' ' }
                                </a>
                            ) }
                        </div>
                    </>
                );
            case 'divider':
                return <span className="divider" key={ field.key }></span>;

            default:
                return null;
        }
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

export default NestedComponent;
