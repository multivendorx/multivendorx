// External dependencies
import React, { useState, useRef, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal dependencies
import HoverInputRender from './HoverInputRender';
import SettingMetaBox from './SettingMetaBox';

// Types
interface Option {
    id: string; 
    label: string;
    value: string;
    isdefault?: boolean;
}

interface MultipleOptionsFormField {
    label: string;
    type?: string;
    options?: Option[];
}
type MultipleOptionsValue = string | boolean | Option[];

interface MultipleOptionsProps {
    formField: MultipleOptionsFormField;
    onChange: ( key: string, value: MultipleOptionsValue ) => void;
    type: 'radio' | 'checkboxes' | 'dropdown' | 'multiselect';
    selected: boolean;
}

const MultipleOptions: React.FC< MultipleOptionsProps > = ( {
    formField,
    onChange,
    type,
} ) => {
    const settingHasChanged = useRef( false );
    const firstTimeRender = useRef( true );
    const [ openOption, setOpenOption ] = useState< number | null >( null );

    const [ options, setOptions ] = useState< Option[] >( () => {
        return Array.isArray( formField.options ) && formField.options.length
            ? formField.options
            : [];
    } );

    useEffect( () => {
        setOptions(
            Array.isArray( formField.options ) ? formField.options : []
        );
    }, [ formField.options ] );

    const renderInputFields = ( fieldType: string ) => {
        switch ( fieldType ) {
            case 'radio':
                return options.map( ( option, idx ) => (
                    <div className="radio-basic-input-wrap" key={ idx }>
                        <input
                            type="radio"
                            id={ `radio-${ idx }` }
                            value={ option.value }
                        />
                        <label htmlFor={ `radio-${ idx }` }>
                            { option.label }
                        </label>
                    </div>
                ) );
            case 'checkboxes':
                return options.map( ( option, idx ) => (
                    <div className="radio-basic-input-wrap" key={ idx }>
                        <input
                            type="checkbox"
                            id={ `checkbox-${ idx }` }
                            value={ option.value }
                        />
                        <label htmlFor={ `checkbox-${ idx }` }>
                            { option.label }
                        </label>
                    </div>
                ) );
            case 'dropdown':
            case 'multiselect':
                return (
                    <select className="basic-select">
                        <option>Select...</option>
                        { options.map( ( option, idx ) => (
                            <option key={ idx } value={ option.value }>
                                { option.label }
                            </option>
                        ) ) }
                    </select>
                );
            default:
                return <p>Unsupported input type</p>;
        }
    };

    const handleOptionFieldChange = (
        index: number,
        key: keyof Option,
        value: string | number | boolean | Option[]
    ) => {
        const newOptions = [ ...options ];
        newOptions[ index ] = { ...newOptions[ index ], [ key ]: value };
        setOptions( newOptions );
        onChange( 'options', newOptions );
    };

    const handleInsertOption = () => {
        const newOptions = [
            ...options,
            { id: crypto.randomUUID(), label: 'Option value', value: 'value' }, // Generate a unique ID
        ];
        setOptions( newOptions );
        onChange( 'options', newOptions );
    };

    const handleDeleteOption = ( index: number ) => {
        if ( options.length <= 1 ) {
            return;
        }
        const newOptions = options.filter( ( _, i ) => i !== index );
        setOptions( newOptions );
        onChange( 'options', newOptions );
    };

    return (
        <HoverInputRender
            label={ formField.label }
            onLabelChange={ ( newLabel ) => onChange( 'label', newLabel ) }
            renderStaticContent={ ( { label } ) => (
                <div className="edit-form-wrapper">
                    <p>{ label }</p>
                    <div className="settings-form-group-radio">
                        { renderInputFields( type ) }
                    </div>
                </div>
            ) }
            renderEditableContent={ ( { label, onLabelChange } ) => (
                <>
                    <input
                        className="basic-input multipleoption-label"
                        type="text"
                        value={ label }
                        onChange={ ( event ) =>
                            onLabelChange( event.target.value )
                        }
                        readOnly
                    />

                    <ReactSortable
                        className="multioption-wrapper"
                        list={ options }
                        setList={ ( newList: Option[] ) => {
                            if ( firstTimeRender.current ) {
                                firstTimeRender.current = false;
                                return;
                            }
                            setOptions( newList );
                            onChange( 'options', newList );
                        } }
                        handle=".drag-handle-option"
                    >
                        { options.map( ( option, index ) => (
                            <div
                                className="option-list-wrapper drag-handle-option"
                                key={ index }
                            >
                                <div className="option-label">
                                    <input
                                        type="text"
                                        className="basic-input"
                                        value={ option.label }
                                        onChange={ ( event ) => {
                                            settingHasChanged.current = true;
                                            handleOptionFieldChange(
                                                index,
                                                'label',
                                                event.target.value
                                            );
                                        } }
                                        readOnly
                                        onClick={ ( event ) => {
                                            setOpenOption( index );
                                            event.stopPropagation();
                                        } }
                                    />
                                </div>
                                <div className="option-control-section">
                                    <div
                                        role="button"
                                        className="delete-btn"
                                        tabIndex={ 0 }
                                        onClick={ () => {
                                            settingHasChanged.current = true;
                                            handleDeleteOption( index );
                                        } }
                                    >
                                        Delete
                                    </div>
                                    <SettingMetaBox
                                        opened={ {
                                            click: openOption === index,
                                        } }
                                        option={ option }
                                        onChange={ ( key, value ) => {
                                            settingHasChanged.current = true;
                                            handleOptionFieldChange(
                                                index,
                                                key as keyof Option,
                                                value ?? ''
                                            );
                                        } }
                                        metaType=""
                                        setDefaultValue={ () => {
                                            let defaultValueIndex:
                                                | number
                                                | null = null;
                                            options.forEach(
                                                ( eachOption, idx ) => {
                                                    if ( eachOption.isdefault ) {
                                                        defaultValueIndex = idx;
                                                    }
                                                }
                                            );
                                            if ( defaultValueIndex !== null ) {
                                                settingHasChanged.current =
                                                    true;
                                                handleOptionFieldChange(
                                                    defaultValueIndex,
                                                    'isdefault',
                                                    false
                                                );
                                            }
                                            handleOptionFieldChange(
                                                index,
                                                'isdefault',
                                                true
                                            );
                                        } }
                                    />
                                </div>
                            </div>
                        ) ) }

                        <div
                            className="add-more-option-section"
                            role="button"
                            tabIndex={ 0 }
                            onClick={ handleInsertOption }
                        >
                            Add new options{ ' ' }
                            <span>
                                <i className="admin-font adminfont-plus"></i>
                            </span>
                        </div>
                    </ReactSortable>
                </>
            ) }
        />
    );
};

export default MultipleOptions;
