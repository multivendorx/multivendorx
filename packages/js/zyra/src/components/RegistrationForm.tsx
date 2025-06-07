import React, { useEffect, useRef, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import ButtonCustomizer from "./ButtonCustomiser";
import Elements from "./Elements";
import SettingMetaBox from "./SettingMetaBox";
import SimpleInput from "./SimpleInput";
import MultipleOptions from "./MultipleOption";
import TemplateTextArea from "./TemplateTextArea";
import Attachment from "./Attachment";
import Recaptcha from "./Recaptcha";
import Datepicker from "./DatePicker";
import TimePicker from "./TimePicker";
import Divider from "./Divider";
import TemplateSection from "./TemplateSection";

export interface Option {
    id: string;
    label: string;
    value: string;
    isdefault?: boolean;
}

export interface SelectOption {
    icon: string;
    value: string;
    label: string;
}

// Props interface for AddNewBtn
interface AddNewBtnProps {
    onAddNew?: () => void;
    large?: boolean;
}

// Props interface for DeleteBtn
interface DeleteBtnProps {
    onDelete?: () => void;
    hideDelete?: boolean;
}

// Default values for input options
export const DEFAULT_OPTIONS: Option[] = [
    { id: "1", label: "Manufacture", value: "manufacture" },
    { id: "2", label: "Trader", value: "trader" },
    { id: "3", label: "Authorized Agent", value: "authorized_agent" },
];

// Utility functions for default placeholders and labels
export const DEFAULT_PLACEHOLDER = ( type: string ): string => `${ type }`;
export const DEFAULT_LABEL_SIMPLE = ( type: string ): string =>
    `Enter your ${ type }`;
export const DEFAULT_LABEL_SELECT = "Nature of Business";
export const DEFAULT_FORM_TITLE = "Demo Form";

// Select options list
export const selectOptions: SelectOption[] = [
    {
        icon: "adminLib-t-letter-bold icon-form-textbox",
        value: "text",
        label: "Textbox",
    },
    { icon: "adminLib-unread icon-form-email", value: "email", label: "Email" },
    {
        icon: "adminLib-text icon-form-textarea",
        value: "textarea",
        label: "Textarea",
    },
    {
        icon: "adminLib-checkbox icon-form-checkboxes",
        value: "checkboxes",
        label: "Checkboxes",
    },
    {
        icon: "adminLib-multi-select icon-form-multi-select",
        value: "multiselect",
        label: "Multi Select",
    },
    { icon: "adminLib-radio icon-form-radio", value: "radio", label: "Radio" },
    {
        icon: "adminLib-dropdown-checklist icon-form-dropdown",
        value: "dropdown",
        label: "Dropdown",
    },
    {
        icon: "adminLib-captcha-automatic-code icon-form-recaptcha",
        value: "recaptcha",
        label: "reCaptcha v3",
    },
    {
        icon: "adminLib-submission-message icon-form-attachment",
        value: "attachment",
        label: "Attachment",
    },
    {
        icon: "adminLib-form-section icon-form-section",
        value: "section",
        label: "Section",
    },
    {
        icon: "adminLib-calendar icon-form-store-description",
        value: "datepicker",
        label: "Date Picker",
    },
    {
        icon: "adminLib-alarm icon-form-address01",
        value: "TimePicker",
        label: "Time Picker",
    },
    {
        icon: "adminLib-divider icon-form-address01",
        value: "divider",
        label: "Divider",
    },
];

/**
 * Component that renders an action section for adding new items.
 */
export const AddNewBtn: React.FC< AddNewBtnProps > = ( {
    onAddNew,
    large,
} ) => {
    return (
        <>
            { large ? (
                <div className="addnew">
                    <div onClick={ () => onAddNew?.() }>
                        <i className="admin-font adminLib-move"></i>
                    </div>
                    <p>{ "Click to add next text field" }</p>
                </div>
            ) : (
                <div
                    className="add-new-sections"
                    onClick={ () => onAddNew?.() }
                >
                    <div>
                        <span>
                            <i className="admin-font adminLib-move"></i>
                        </span>
                    </div>
                </div>
            ) }
        </>
    );
};

/**
 * Component that renders a delete button section.
 */
export const DeleteBtn: React.FC< DeleteBtnProps > = ( {
    onDelete,
    hideDelete,
} ) => {
    return (
        <div
            className={ `delete ${ hideDelete ? "disable" : "" }` }
            onClick={ () => onDelete?.() }
        >
            <i className="admin-font adminLib-close"></i>
        </div>
    );
};

interface FormField {
    id: number;
    type: string;
    label: string;
    required: boolean;
    name: string;
    placeholder?: string;
    options?: Option[];
    sitekey?: string;
}
interface ButtonSetting {}
interface CustomFormProps {
    onChange: ( data: {
        formfieldlist: FormField[];
        butttonsetting: ButtonSetting;
    } ) => void;
    name: string;
    proSettingChange: () => boolean;
    formTitlePlaceholder?: string;
    setting: Record< string, any >;
}
// props value
// 1. formTitlePlaceholder
// 2. formTitleDescription
// 3. formFieldTypes

const CustomFrom: React.FC< CustomFormProps > = ( {
    onChange,
    name,
    proSettingChange,
    setting,
    formTitlePlaceholder,
} ) => {
    ////////////// Define state variable here /////////////////
    const formSetting = setting[ name ] || {};

    const settingHasChanged = useRef( false );
    const firstTimeRender = useRef( true );

    // Contain list of selected form fields.
    const [ formFieldList, setFormFieldList ] = useState< FormField[] >( () => {
        // Form field list can't be empty it should contain atlest form title.
        // This action prevent any backend action for empty form field list.

        let inputList = formSetting[ "formfieldlist" ] || [];

        if ( ! Array.isArray( inputList ) || inputList.length <= 0 ) {
            return [
                {
                    id: 1,
                    type: "title",
                    label: DEFAULT_FORM_TITLE,
                    required: true,
                },
            ];
        }

        return inputList;
    } );

    const [ buttonSetting, setButtonSetting ] = useState(
        formSetting[ "butttonsetting" ] || {}
    );

    // State for hold id of opend input section.
    const [ opendInput, setOpendInput ] = useState< any >( null );

    const [ isInputBoxClick, SetIsInputBoxClick ] = useState( {
        click: false,
    } );

    // State variable for a random maximum id
    const [ randMaxId, setRendMaxId ] = useState< number >( 0 );

    useEffect( () => {
        const closePopup = ( event: MouseEvent ) => {
            if (
                ( event.target as HTMLElement ).closest(
                    ".meta-menu, .meta-setting-modal, .react-draggable"
                )
            ) {
                return;
            }
            SetIsInputBoxClick( { click: false } );
            setOpendInput( null );
        };
        document.body.addEventListener( "click", closePopup );
        return () => {
            document.body.removeEventListener( "click", closePopup );
        };
    }, [] );

    // Prepare random maximum id
    useEffect( () => {
        setRendMaxId(
            formFieldList.reduce(
                ( maxId, field ) => Math.max( maxId, field.id ),
                0
            ) + 1
        );
    }, [] );

    // Save button setting and formfieldlist setting
    useEffect( () => {
        if ( settingHasChanged.current ) {
            settingHasChanged.current = false;
            onChange( {
                formfieldlist: formFieldList,
                butttonsetting: buttonSetting,
            } );
        }
    }, [ buttonSetting, formFieldList ] );

    ////////////// Define functionality here /////////////////

    const getUniqueName = () => {
        return Date.now().toString( 36 ); // Convert timestamp to base 36
    };

    /**
     * Function generate a empty form field and return it.
     * By default it set the type to simple text
     */

    const getNewFormField = ( type: string = "text" ): FormField => {
        const newFormField: FormField = {
            id: randMaxId ?? 0, // Ensure randMaxId is a number (or fallback to 0)
            type: type,
            label: "",
            required: false,
            name: `${ type }-${ getUniqueName() }`,
        };

        if (
            [ "multiselect", "radio", "dropdown", "checkboxes" ].includes(
                type
            )
        ) {
            newFormField.label = DEFAULT_LABEL_SELECT;
            newFormField.options = DEFAULT_OPTIONS;
        } else {
            newFormField.label = DEFAULT_LABEL_SIMPLE( type );
            newFormField.placeholder = DEFAULT_PLACEHOLDER( type );
        }

        // update randMaxId by 1
        setRendMaxId( ( prev ) => ( prev ?? 0 ) + 1 );

        return newFormField;
    };

    /**
     * Function that append a new form field after a perticular index.
     * If form field list is empty it append at begining of form field list.
     */
    const appendNewFormField = ( index: number, type = "text" ) => {
        if ( proSettingChange() ) return;
        const newField = getNewFormField( type );

        // Create a new array with the new element inserted
        const newFormFieldList = [
            ...formFieldList.slice( 0, index + 1 ),
            newField,
            ...formFieldList.slice( index + 1 ),
        ];

        // Update the state with the new array
        settingHasChanged.current = true;
        setFormFieldList( newFormFieldList );

        return newField;
    };

    /**
     * Function that delete a particular form field
     * @param {*} index
     */
    const deleteParticularFormField = ( index: number ) => {
        if ( proSettingChange() ) return;

        // Create a new array without the element at the specified index
        const newFormFieldList = formFieldList.filter(
            ( _, i ) => i !== index
        );

        // Update the state with the new array
        settingHasChanged.current = true;
        setFormFieldList( newFormFieldList );
    };

    /**
     * Function handle indivisual form field changes
     */
    const handleFormFieldChange = (
        index: number,
        key: string,
        value: any
    ) => {
        if ( proSettingChange() ) return;
        // copy the form field before modify
        const newFormFieldList = [ ...formFieldList ];

        // Update the new form field list
        newFormFieldList[ index ] = {
            ...newFormFieldList[ index ],
            [ key ]: value,
        };

        // Update the state variable
        settingHasChanged.current = true;
        setFormFieldList( newFormFieldList );
    };

    /**
     * Function that handle type change for a particular form field
     * @param {*} index
     * @param {*} newType
     */
    const handleFormFieldTypeChange = ( index: number, newType: string ) => {
        if ( proSettingChange() ) return;

        // Get the input which one is selected
        const selectedFormField = formFieldList[ index ];

        // Check if selected type is previously selected type
        if ( selectedFormField.type == newType ) {
            return;
        }

        // Create a empty form field for that position
        const newFormField = getNewFormField( newType );
        newFormField.id = selectedFormField.id;

        // Replace the newly created form field with old one
        const newFormFieldList = [ ...formFieldList ];
        newFormFieldList[ index ] = newFormField;

        settingHasChanged.current = true;
        setFormFieldList( newFormFieldList );
    };

    return (
        // Render Registration form here
        <div className="registrationFrom-main-wrapper-section">
            { /* Render element type section */ }
            <Elements
                selectOptions={ selectOptions }
                onClick={ ( type ) => {
                    const newInput = appendNewFormField(
                        formFieldList.length - 1,
                        type
                    );
                    setOpendInput( newInput );
                } }
            />

            <div className="registration-form-main-section">
                { /* Render form title here */ }
                {
                    <div className="form-heading">
                        <input
                            type="text"
                            placeholder={ formTitlePlaceholder }
                            value={ formFieldList[ 0 ]?.label }
                            onChange={ ( event ) => {
                                handleFormFieldChange(
                                    0,
                                    "label",
                                    event.target.value
                                );
                            } }
                        />
                        <AddNewBtn
                            onAddNew={ () => {
                                const newInput = appendNewFormField( 0 );
                                setOpendInput( newInput );
                            } }
                        />
                    </div>
                }

                { /* Render form fields here */ }
                {
                    <ReactSortable
                        list={ formFieldList }
                        setList={ ( newList ) => {
                            if ( firstTimeRender.current ) {
                                firstTimeRender.current = false;
                                return;
                            }
                            if ( proSettingChange() ) return;
                            settingHasChanged.current = true;
                            setFormFieldList( newList );
                        } }
                        handle=".drag-handle"
                    >
                        { formFieldList.length > 0 &&
                            formFieldList.map( ( formField, index ) => {
                                if ( index === 0 ) {
                                    return (
                                        <div
                                            style={ { display: "none" } }
                                        ></div>
                                    );
                                }

                                return (
                                    <main
                                        className={ `form-field ${
                                            opendInput?.id == formField.id
                                                ? "active"
                                                : ""
                                        }` }
                                    >
                                        { /* Render dragable button */ }
                                        { opendInput?.id == formField.id && (
                                            <div className="bth-move drag-handle">
                                                <i className="admin-font adminLib-move"></i>
                                            </div>
                                        ) }

                                        { /* Render setting section */ }
                                        { opendInput?.id == formField.id && (
                                            <section className="meta-menu">
                                                <div className="btn-delete">
                                                    <DeleteBtn
                                                        onDelete={ () => {
                                                            deleteParticularFormField(
                                                                index
                                                            );
                                                            setOpendInput(
                                                                null
                                                            );
                                                        } }
                                                    />
                                                </div>
                                                <SettingMetaBox
                                                    formField={ formField }
                                                    opened={ isInputBoxClick }
                                                    onChange={ ( key, value ) =>
                                                        handleFormFieldChange(
                                                            index,
                                                            key,
                                                            value
                                                        )
                                                    }
                                                    onTypeChange={ (
                                                        newType
                                                    ) =>
                                                        handleFormFieldTypeChange(
                                                            index,
                                                            newType
                                                        )
                                                    }
                                                    inputTypeList={
                                                        selectOptions
                                                    }
                                                />
                                            </section>
                                        ) }

                                        { /* Render main content */ }
                                        <section
                                            className={ `${
                                                opendInput?.id != formField.id
                                                    ? "hidden-list"
                                                    : ""
                                            } form-field-container-wrapper` }
                                            onClick={ ( event ) => {
                                                event.stopPropagation();
                                                SetIsInputBoxClick( {
                                                    click: true,
                                                } );
                                                if (
                                                    opendInput?.id !=
                                                    formField.id
                                                ) {
                                                    setOpendInput( formField );
                                                }
                                            } }
                                        >
                                            { /* Render question name here */ }
                                            { ( formField.type == "text" ||
                                                formField.type == "email" ||
                                                formField.type ==
                                                    "number" ) && (
                                                <SimpleInput
                                                    formField={ formField }
                                                    onChange={ ( key, value ) =>
                                                        handleFormFieldChange(
                                                            index,
                                                            key,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) }
                                            { ( formField.type ==
                                                "checkboxes" ||
                                                formField.type ==
                                                    "multiselect" ||
                                                formField.type == "radio" ||
                                                formField.type ==
                                                    "dropdown" ) && (
                                                <MultipleOptions
                                                    formField={ formField }
                                                    type={ formField.type }
                                                    selected={
                                                        opendInput?.id ===
                                                        formField.id
                                                    }
                                                    onChange={ ( key, value ) =>
                                                        handleFormFieldChange(
                                                            index,
                                                            key,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) }
                                            { formField.type == "textarea" && (
                                                <TemplateTextArea
                                                    formField={ formField }
                                                    onChange={ ( key, value ) =>
                                                        handleFormFieldChange(
                                                            index,
                                                            key,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) }
                                            { formField.type ==
                                                "attachment" && (
                                                <Attachment
                                                    formField={ formField }
                                                    onChange={ ( key, value ) =>
                                                        handleFormFieldChange(
                                                            index,
                                                            key,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) }
                                            { formField.type == "recaptcha" && (
                                                <Recaptcha
                                                    formField={ formField }
                                                    onChange={ ( key, value ) =>
                                                        handleFormFieldChange(
                                                            index,
                                                            key,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) }
                                            { formField.type ==
                                                "datepicker" && (
                                                <Datepicker
                                                    formField={ formField }
                                                    onChange={ ( key, value ) =>
                                                        handleFormFieldChange(
                                                            index,
                                                            key,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) }
                                            { formField.type ==
                                                "TimePicker" && (
                                                <TimePicker
                                                    formField={ formField }
                                                    onChange={ ( key, value ) =>
                                                        handleFormFieldChange(
                                                            index,
                                                            key,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) }
                                            { formField.type == "section" && (
                                                <TemplateSection
                                                    formField={ formField }
                                                    onChange={ ( key, value ) =>
                                                        handleFormFieldChange(
                                                            index,
                                                            key,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) }
                                            { formField.type == "divider" && (
                                                <Divider />
                                            ) }
                                        </section>

                                        <AddNewBtn
                                            onAddNew={ () => {
                                                const newInput =
                                                    appendNewFormField( index );
                                                setOpendInput( newInput );
                                            } }
                                        />
                                    </main>
                                );
                            } ) }
                    </ReactSortable>
                }

                <section className="settings-input-content">
                    <ButtonCustomizer
                        text={
                            ( buttonSetting.button_text &&
                                buttonSetting.button_text ) ||
                            "Submit"
                        }
                        setting={ buttonSetting }
                        onChange={ (
                            key,
                            value,
                            isRestoreDefaults = false
                        ) => {
                            if ( proSettingChange() ) return;
                            settingHasChanged.current = true;
                            const previousSetting = buttonSetting || {};
                            if ( isRestoreDefaults ) {
                                setButtonSetting( value );
                            } else {
                                setButtonSetting( {
                                    ...previousSetting,
                                    [ key ]: value,
                                } );
                            }
                        } }
                    />
                </section>

                <AddNewBtn
                    large={ true }
                    onAddNew={ () => {
                        const newInput = appendNewFormField(
                            formFieldList.length - 1
                        );
                        setOpendInput( newInput );
                    } }
                />
            </div>
        </div>
    );
};

export default CustomFrom;
