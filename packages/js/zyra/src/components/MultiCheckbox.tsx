/**
 * External dependencies
 */
import React, { ChangeEvent, MouseEvent, useEffect, useRef } from 'react';

// Types
interface Option {
    key?: string;
    value: string;
    label?: string;
    img1?: string;
    img2?: string;
    name?: string;
    proSetting?: boolean;
    hints?: string;
    desc?:string;
}

interface MultiCheckBoxProps {
    wrapperClass?: string;
    selectDeselect?: boolean;
    selectDeselectClass?: string;
    selectDeselectValue?: string;
    onMultiSelectDeselectChange?: (
        e: ChangeEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement | HTMLInputElement>
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
    onChange?: (e: ChangeEvent<HTMLInputElement> | string[]) => void;
    proChanged?: () => void;
    proSetting?: boolean;
    hintOuterClass?: string;
    description?: string;
    descClass?: string;
    hintInnerClass?: string;
    khali_dabba: boolean;
}

const MultiCheckBox: React.FC<MultiCheckBoxProps> = (props) => {

    const allSelected = props.value?.length === props.options.length;
    const selectedCount = props.value?.length ?? 0;

    const handleCheckboxChange = (
        directionValue: string,
        isChecked: boolean
    ) => {
        let updatedValue = [...(props.value as string[])];
        updatedValue = updatedValue.filter(
            (element) => element !== directionValue
        );

        if (isChecked) {
            updatedValue.push(directionValue);
        }

        if (props.onChange) {
            props.onChange(updatedValue);
        }
    };

    return (
        <div className={props.wrapperClass}>
            {props.selectDeselect && (
                <div className="checkbox-list-header">
                    <div className="checkbox">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => props.onMultiSelectDeselectChange?.(e)}
                            className={ !allSelected && selectedCount > 0 ? 'sdhgf':'v'}
                        />
                        <span className="">{selectedCount} items</span>
                    </div>
                </div>
            )}

            {props.options.map((option) => {
                const checked = props.value?.includes(option.value) ?? false;

                return (
                    <div
                        key={option.key}
                        className={props.inputWrapperClass}
                    >
                        {props.rightContent && (
                            <p
                                className={props.rightContentClass}
                                dangerouslySetInnerHTML={{
                                    __html: option.label ?? '',
                                }}
                            ></p>
                        )}
                        <div
                            className={props.inputInnerWrapperClass}
                            data-tour={props.tour}
                        >
                            <input
                                className={props.inputClass}
                                id={`${props.idPrefix}-${option.key}`}
                                type={
                                    props.type?.split('-')[0] || 'checkbox'
                                }
                                name={option.name || 'basic-input'}
                                value={option.value}
                                checked={checked}
                                onChange={(e) => {
                                    if (
                                        props.type === 'checkbox-custom-img'
                                    ) {
                                        handleCheckboxChange(
                                            option.value,
                                            e.target.checked
                                        );
                                    } else if (
                                        option.proSetting &&
                                        !props.khali_dabba
                                    ) {
                                        props.proChanged?.();
                                    } else {
                                        props.onChange?.(e);
                                    }
                                }}
                            />
                            { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                            {props.type === 'checkbox-custom-img' ? (
                                <>
                                    <div
                                        className="custom-img-meta-wrapper"
                                        key={`${option.key}-img-wrp`}
                                    >
                                        <img src={option.img1} alt="" />
                                        <i className="admin-font adminlib-arrow-right"></i>
                                        <img src={option.img2} alt="" />
                                    </div>
                                    <p className="custom-img-label">
                                        {option.label}
                                    </p>
                                </>
                            ) : (
                                // eslint-disable-next-line jsx-a11y/label-has-associated-control
                                <label
                                    htmlFor={`${props.idPrefix}-${option.key}`}
                                >{option.label }</label>
                            )}
                        </div>

                        {!props.rightContent &&
                            props.type !== 'checkbox-custom-img' && (
                                <p
                                    className={props.rightContentClass}
                                    dangerouslySetInnerHTML={{
                                        __html: option.desc ?? '',
                                    }}
                                ></p>
                            )}
                        {option.proSetting && !props.khali_dabba && (
                            <span className="admin-pro-tag">pro</span>
                        )}
                        {option.hints && (
                            <span
                                className={props.hintOuterClass}
                                dangerouslySetInnerHTML={{
                                    __html: option.hints,
                                }}
                            ></span>
                        )}
                        {props.proSetting && <span className="admin-pro-tag">pro</span>}
                    </div>
                );
            })}
            {props.description && (
                <p
                    className={props.descClass}
                    dangerouslySetInnerHTML={{ __html: props.description }}
                ></p>
            )}
        </div>
    );
};

export default MultiCheckBox;
