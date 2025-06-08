/**
 * External dependencies
 */
import React, { ChangeEvent, MouseEvent } from "react";

// Types
export interface Option {
    key?: string;
    value: string;
    label?: string;
    name?: string;
    proSetting?: boolean;
    hints?: string;
}

export interface MultiCheckBoxProps {
    wrapperClass?: string;
    selectDeselect?: boolean;
    selectDeselectClass?: string;
    selectDeselectValue?: string;
    onMultiSelectDeselectChange?: (
        e: MouseEvent< HTMLButtonElement >
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
    type?: "checkbox" | "radio";
    onChange?: ( e: ChangeEvent< HTMLInputElement > ) => void;
    proChanged?: () => void;
    proSetting?: boolean;
    hintOuterClass?: string;
    description?: string;
    descClass?: string;
    hintInnerClass?: string;
    khali_dabba: boolean;
}

const MultiCheckBox: React.FC< MultiCheckBoxProps > = ( props ) => {
    return (
        <div className={ props.wrapperClass }>
            { props.selectDeselect && (
                <button
                    className={ props.selectDeselectClass }
                    onClick={ ( e ) => {
                        e.preventDefault();
                        props.onMultiSelectDeselectChange?.( e );
                    } }
                >
                    { props.selectDeselectValue }
                </button>
            ) }
            <div className="wrapper">
                { props.options.map( ( option ) => {
                    const checked =
                        props.value?.includes( option.value ) ?? false;

                    return (
                        <div
                            key={ option.key }
                            className={ props.inputWrapperClass }
                        >
                            { props.rightContent && (
                                <p
                                    className={ props.rightContentClass }
                                    dangerouslySetInnerHTML={ {
                                        __html: option.label ?? "",
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
                                    type={ props.type || "checkbox" }
                                    name={ option.name || "basic-input" }
                                    value={ option.value }
                                    checked={ checked }
                                    onChange={ ( e ) => {
                                        if (
                                            option.proSetting &&
                                            ! props.khali_dabba
                                        ) {
                                            props.proChanged?.();
                                        } else {
                                            props.onChange?.( e );
                                        }
                                    } }
                                />
                                <label
                                    htmlFor={ `${ props.idPrefix }-${ option.key }` }
                                ></label>
                            </div>
                            { props.proSetting && (
                                <span className="admin-pro-tag">pro</span>
                            ) }
                            { ! props.rightContent && (
                                <p
                                    className={ props.rightContentClass }
                                    dangerouslySetInnerHTML={ {
                                        __html: option.label ?? "",
                                    } }
                                ></p>
                            ) }
                            { option.proSetting && ! props.khali_dabba && (
                                <span className="admin-pro-tag">pro</span>
                            ) }
                            { option.hints && (
                                <span
                                    className={ props.hintOuterClass }
                                    dangerouslySetInnerHTML={ {
                                        __html: option.hints,
                                    } }
                                ></span>
                            ) }
                        </div>
                    );
                } ) }
            </div>
            { props.description && (
                <p
                    className={ props.descClass }
                    dangerouslySetInnerHTML={ { __html: props.description } }
                ></p>
            ) }
        </div>
    );
};

export default MultiCheckBox;
