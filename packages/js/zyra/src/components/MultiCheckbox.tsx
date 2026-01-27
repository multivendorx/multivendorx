import React, { useState, ChangeEvent, MouseEvent } from 'react';

// Types
interface Option {
    key?: string;
    value: string;
    label?: string;
    img1?: string;
    img2?: string;
    name?: string;
    proSetting?: boolean;
    moduleEnabled?: string;
    hints?: string;
    desc?: string;
    edit?: boolean;
    preText?: string;
    postText?: string;
}

interface MultiCheckBoxProps {
    wrapperClass?: string;
    selectDeselect?: boolean;
    addNewBtn?: string;
    selectDeselectClass?: string;
    selectDeselectValue?: string;
    onMultiSelectDeselectChange?: (
        e:
            | ChangeEvent< HTMLInputElement >
            | MouseEvent< HTMLButtonElement | HTMLInputElement >
    ) => void;
    options: Option[];
    value?: string[];
    inputWrapperClass?: string;
    rightContent?: boolean;
    rightContentClass?: string;
    inputInnerWrapperClass?: string;
    tour?: string;
    inputClass?: string;
    idPrefix?: string;
    type?: 'checkbox' | 'radio' | 'checkbox-custom-img';
    onChange?: ( e: ChangeEvent< HTMLInputElement > | string[] ) => void;
    proChanged?: () => void;
    onOptionsChange?: ( option: any ) => void;
    moduleChange: ( module: string ) => void;
    modules: string[];
    module: string;
    proSetting?: boolean;
    hintOuterClass?: string;
    description?: string;
    descClass?: string;
    hintInnerClass?: string;
    khali_dabba: boolean;
    moduleEnabled?: boolean;
    preText?: string;
    postText?: string;
}

const MultiCheckBox: React.FC< MultiCheckBoxProps > = ( props ) => {
    const [ localOptions, setLocalOptions ] = useState< Option[] >(
        props.options
    );
    const [ showNewInput, setShowNewInput ] = useState( false );
    const [ newOptionValue, setNewOptionValue ] = useState( '' );
    const [ editIndex, setEditIndex ] = useState< number | null >( null );
    const [ editValue, setEditValue ] = useState( '' );

    const allSelected = props.value?.length === localOptions.length;
    const selectedCount = props.value?.length ?? 0;

    const handleCheckboxChange = (
        directionValue: string,
        isChecked: boolean
    ) => {
        let updatedValue = [ ...( props.value as string[] ) ];
        updatedValue = updatedValue.filter(
            ( element ) => element !== directionValue
        );

        if ( isChecked ) {
            updatedValue.push( directionValue );
        }

        if ( props.onChange ) {
            props.onChange( updatedValue );
        }
    };

    const handleAddNewClick = () => {
        setShowNewInput( true );
    };

    const handleSaveNewOption = () => {
        if ( ! newOptionValue.trim() ) {
            return;
        }

        const value = newOptionValue
            .trim()
            .toLowerCase()
            .replace( /\s+/g, '_' );
        const newOption: Option = {
            key: value,
            value: value,
            label: newOptionValue.trim(),
            edit: true,
        };

        const updatedOptions = [ ...localOptions, newOption ];
        props.onOptionsChange?.( updatedOptions );

        setLocalOptions( updatedOptions );
        setNewOptionValue( '' );
        setShowNewInput( false );

        props.onChange?.( {
            target: {
                value,
                checked: true,
            },
        } as React.ChangeEvent< HTMLInputElement > );
    };

    const saveEditedOption = ( index: number ) => {
        if ( ! editValue.trim() ) {
            return;
        }

        const updatedOptions = [ ...localOptions ];
        updatedOptions[ index ] = {
            ...updatedOptions[ index ],
            label: editValue.trim(),
        };

        setLocalOptions( updatedOptions );
        setEditIndex( null );
        setEditValue( '' );

        props.onOptionsChange?.( updatedOptions );
    };

    const deleteOption = ( index: number ) => {
        const option = localOptions[ index ];
        const shouldBlockForPro =
            props.proSetting !== undefined &&
            props.proSetting &&
            ! props.khali_dabba;

        if ( shouldBlockForPro ) {
            props.proChanged?.();
            return;
        }

        const shouldBlockForModule =
            props.moduleEnabled !== undefined && ! props.moduleEnabled;

        if ( shouldBlockForModule ) {
            props.moduleChange?.( props.module || '' );
            return;
        }

        const updatedOptions = localOptions.filter( ( _, i ) => i !== index );
        setLocalOptions( updatedOptions );

        props.onChange?.( {
            target: {
                value: option.value,
                checked: false,
            },
        } as React.ChangeEvent< HTMLInputElement > );

        props.onOptionsChange?.( updatedOptions );
    };

    return (
        <>
            <div className={ props.wrapperClass }>
                { props.selectDeselect && (
                    <div className="checkbox-list-header">
                        <div className="checkbox">
                            <input
                                type="checkbox"
                                checked={ allSelected }
                                onChange={ ( e ) => {
                                    // If locked, show popup and stop
                                    const shouldBlockForPro =
                                        props.proSetting !== undefined &&
                                        props.proSetting &&
                                        ! props.khali_dabba;

                                    const shouldBlockForModule =
                                        props.moduleEnabled !== undefined &&
                                        ! props.moduleEnabled;

                                    if (
                                        shouldBlockForPro ||
                                        shouldBlockForModule
                                    ) {
                                        e.preventDefault();
                                        props.proChanged?.();
                                        return;
                                    }
                                    // Otherwise, perform normal select/deselect behavior
                                    props.onMultiSelectDeselectChange?.( e );
                                } }
                                className={
                                    ! allSelected && selectedCount > 0
                                        ? 'minus-icon'
                                        : ''
                                }
                            />
                            <span>{ selectedCount } items</span>
                        </div>
                    </div>
                ) }

                { localOptions.map( ( option, index ) => {
                    const checked =
                        props.value?.includes( option.value ) ?? false;

                    return (
                        <>
                            { props.preText && (
                                <span
                                    className="before"
                                    dangerouslySetInnerHTML={ {
                                        __html: props.preText,
                                    } }
                                />
                            ) }
                            <div
                                key={ option.key }
                                className={ props.inputWrapperClass }
                                onClick={ ( e ) => {
                                    const tag = ( e.target as HTMLElement )
                                        .tagName;
                                    if (
                                        tag === 'INPUT' ||
                                        tag === 'LABEL' ||
                                        tag === 'BUTTON'
                                    ) {
                                        return;
                                    }

                                    if (
                                        props.type === 'checkbox-custom-img'
                                    ) {
                                        handleCheckboxChange(
                                            option.value,
                                            ! checked
                                        );
                                    } else if (
                                        option.proSetting &&
                                        ! props.khali_dabba
                                    ) {
                                        props.proChanged?.();
                                    } else if (
                                        option.moduleEnabled &&
                                        ! props.modules.includes(
                                            option.moduleEnabled
                                        )
                                    ) {
                                        props.moduleChange?.(
                                            option.moduleEnabled
                                        );
                                        return;
                                    } else {
                                        const syntheticEvent = {
                                            target: {
                                                value: option.value,
                                                checked: ! checked,
                                            },
                                        } as ChangeEvent< HTMLInputElement >;
                                        props.onChange?.( syntheticEvent );
                                    }
                                } }
                            >
                                { props.rightContent && (
                                    <p
                                        className={ props.rightContentClass }
                                        dangerouslySetInnerHTML={ {
                                            __html: option.label ?? '',
                                        } }
                                    ></p>
                                ) }

                                <div
                                    className={ props.inputInnerWrapperClass }
                                    data-tour={ props.tour }
                                >
                                    <input
                                        className={ props.inputClass }
                                        id={ `${ props.idPrefix }-${ option.key }` }
                                        type={
                                            props.type?.split( '-' )[ 0 ] ||
                                            'checkbox'
                                        }
                                        name={ option.name || 'basic-input' }
                                        value={ option.value }
                                        checked={ checked }
                                        onChange={ ( e ) => {
                                            if (
                                                props.type ===
                                                'checkbox-custom-img'
                                            ) {
                                                handleCheckboxChange(
                                                    option.value,
                                                    e.target.checked
                                                );
                                            } else if (
                                                option.proSetting &&
                                                ! props.khali_dabba
                                            ) {
                                                props.proChanged?.();
                                            } else if (
                                                option.moduleEnabled &&
                                                ! props.modules.includes(
                                                    option.moduleEnabled
                                                )
                                            ) {
                                                props.moduleChange?.(
                                                    option.moduleEnabled
                                                );
                                                return;
                                            } else {
                                                props.onChange?.( e );
                                            }
                                        } }
                                    />

                                    { editIndex === index ? (
                                        <div className="edit-option-wrapper">
                                            <div className="edit-option">
                                                <input
                                                    type="text"
                                                    value={ editValue }
                                                    onChange={ ( e ) =>
                                                        setEditValue(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={ ( e ) => {
                                                        if (
                                                            e.key === 'Enter'
                                                        ) {
                                                            e.preventDefault();
                                                            saveEditedOption(
                                                                index
                                                            );
                                                        }
                                                    } }
                                                    className="basic-input"
                                                />
                                                <div className="edit-icon">
                                                    <span
                                                        className="admin-badge green border adminfont-check"
                                                        onClick={ ( e ) => {
                                                            e.stopPropagation();
                                                            const shouldBlockForPro =
                                                                props.proSetting !==
                                                                    undefined &&
                                                                props.proSetting &&
                                                                ! props.khali_dabba;

                                                            const shouldBlockForModule =
                                                                props.moduleEnabled !==
                                                                    undefined &&
                                                                ! props.moduleEnabled;

                                                            if (
                                                                shouldBlockForPro ||
                                                                shouldBlockForModule
                                                            ) {
                                                                e.preventDefault();
                                                                props.proChanged?.();
                                                                return;
                                                            }
                                                            saveEditedOption(
                                                                index
                                                            );
                                                        } }
                                                    ></span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <label
                                                className="checkbox-label"
                                                htmlFor={ `${ props.idPrefix }-${ option.key }` }
                                            >
                                                { option.label }
                                                { option.proSetting &&
                                                    ! props.khali_dabba && (
                                                        <span className="admin-pro-tag">
                                                            <i className="adminfont-pro-tag"></i>
                                                            Pro
                                                        </span>
                                                    ) }
                                                { ( ( option.proSetting &&
                                                    props?.khali_dabba ) ||
                                                    ! option.proSetting ) &&
                                                    option.moduleEnabled &&
                                                    ! props.modules.includes(
                                                        option.moduleEnabled
                                                    ) && (
                                                        <span className="admin-pro-tag module">
                                                            <i
                                                                className={ `adminfont-${ option.moduleEnabled }` }
                                                            ></i>
                                                            { String(
                                                                option.moduleEnabled
                                                            )
                                                                .split( '-' )
                                                                .map(
                                                                    (
                                                                        word: string
                                                                    ) =>
                                                                        word
                                                                            .charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase() +
                                                                        word.slice(
                                                                            1
                                                                        )
                                                                )
                                                                .join( ' ' ) }
                                                            <i className="adminfont-lock"></i>
                                                        </span>
                                                    ) }
                                                <div className="label-des">
                                                    { option.desc }
                                                </div>
                                            </label>
                                            { option.edit && (
                                                <div className="edit-icon">
                                                    <span
                                                        onClick={ ( e ) => {
                                                            e.stopPropagation();
                                                            setEditIndex(
                                                                index
                                                            );
                                                            setEditValue(
                                                                option.label ||
                                                                    option.value
                                                            );
                                                        } }
                                                        className="admin-badge blue border adminfont-edit"
                                                    ></span>
                                                    <span
                                                        onClick={ ( e ) => {
                                                            e.stopPropagation();
                                                            deleteOption(
                                                                index
                                                            );
                                                        } }
                                                        className="admin-badge red border adminfont-delete"
                                                    ></span>
                                                </div>
                                            ) }
                                        </>
                                    ) }
                                </div>
                            </div>
                            { props.postText && (
                                <span
                                    className="after"
                                    dangerouslySetInnerHTML={ {
                                        __html: props.postText,
                                    } }
                                />
                            ) }
                        </>
                    );
                } ) }

                { props.description && (
                    <p
                        className={ props.descClass }
                        dangerouslySetInnerHTML={ {
                            __html: props.description,
                        } }
                    ></p>
                ) }
            </div>

            { /* Add New Section */ }
            { props.addNewBtn &&
                ( showNewInput ? (
                    <div className="add-new-option">
                        <input
                            type="text"
                            value={ newOptionValue }
                            onChange={ ( e ) =>
                                setNewOptionValue( e.target.value )
                            }
                            onKeyDown={ ( e ) => {
                                if ( e.key === 'Enter' ) {
                                    e.preventDefault();
                                    handleSaveNewOption();
                                }
                            } }
                            placeholder="Enter new option"
                            className="basic-input"
                        />
                        <button
                            className="admin-btn btn-green"
                            onClick={ ( e ) => {
                                e.preventDefault();
                                handleSaveNewOption();
                            } }
                        >
                            <i className="adminfont-active"></i> Save
                        </button>
                    </div>
                ) : (
                    <div className="add-new-option">
                        <div
                            className="admin-btn btn-purple"
                            onClick={ handleAddNewClick }
                        >
                            <i className="adminfont-plus"></i>{ ' ' }
                            { props.addNewBtn }
                        </div>
                    </div>
                ) ) }
        </>
    );
};

export default MultiCheckBox;
