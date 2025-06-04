import React from "react";
import BasicInput from "./BasicInput";
import { SelectOptions } from "./SelectInput";

interface ParentOption {
    label: string;
    key: string;
    type: "text" | "number" | "checkbox" | "select" | "select2nd" | "country";
    options: SelectOptions[]; // Define proper type if available
}

interface Option {
    [ key: string ]: any; // Allows dynamic keys for nested data
}

interface NestedInputProps {
    wrapperClass?: string;
    ParentWrapperClass?: string;
    innerParentWrapperClass?: string;
    parentLabelClass?: string;
    parentInputClass?: string;
    value: Option[];
    parentOptions: ParentOption[];
    parentOnchage: (
        e: React.ChangeEvent< HTMLInputElement >,
        option?: any
    ) => void;
}

const NestedInput: React.FC< NestedInputProps > = ( props ) => {
    return (
        <div className={ props.wrapperClass }>
            { props.value &&
                props.value.map( ( option, index ) => (
                    <div key={ index } className={ props.ParentWrapperClass }>
                        { props.parentOptions.map( ( parentOption, i ) => (
                            <div
                                key={ i }
                                className={ props.innerParentWrapperClass }
                            >
                                <label className={ props.parentLabelClass }>
                                    <p>{ parentOption.label }</p>
                                </label>

                                { parentOption.type === "text" ||
                                parentOption.type === "number" ? (
                                    <BasicInput
                                        inputClass={ props.parentInputClass }
                                        type={ parentOption.type }
                                        value={ option[ parentOption.key ] }
                                        onChange={ ( e ) =>
                                            props.parentOnchage( e )
                                        }
                                    />
                                ) : // : parentOption.type === "checkbox" ? (
                                //     <CheckBox
                                //         inputClass={props.parentInputClass}
                                //         type="text"
                                //         value="true"
                                //         checked={option[parentOption.key]}
                                //         onChange={(e) => props.parentOnchage(e)}
                                //     />
                                // )
                                // : parentOption.type === "select" ||
                                //   parentOption.type === "select2nd" ||
                                //   parentOption.type === "country" ? (
                                //     <SelectInput
                                //         inputClass={props.parentInputClass}
                                //         value={option[parentOption.key]}
                                //         options={parentOption.options}
                                //         onChange={(e, opt) => props.parentOnchage(e, opt)}
                                //     />
                                // )
                                null }
                            </div>
                        ) ) }
                    </div>
                ) ) }
        </div>
    );
};

export default NestedInput;
