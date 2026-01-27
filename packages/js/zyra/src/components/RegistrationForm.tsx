/**
 * External dependencies
 */
import React, { useEffect, useRef, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import '../styles/web/RegistrationForm.scss';

/**
 * Internal dependencies
 */
import ButtonCustomizer from './ButtonCustomiser';
import Elements from './Elements';
import SettingMetaBox from './SettingMetaBox';
import SimpleInput from './SimpleInput';
import MultipleOptions from './MultipleOption';
import Attachment from './Attachment';
import Recaptcha from './Recaptcha';
import Datepicker from './DatePicker';
import TimePicker from './TimePicker';
import TemplateSection from './EmailTemplate/TemplateSection';
import BlockLayout from './EmailTemplate/BlockLayout';
import ImageGallery from './EmailTemplate/ImageGallery';
import AddressField, { AddressFormField } from './AddressField';
import TemplateTextArea from './EmailTemplate/TemplateTextArea';

// Types
export type FieldValue =
    | string
    | number
    | boolean
    | FieldValue[]
    | { [ key: string ]: FieldValue };

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
    name?: string;
}

interface ImageItem {
    id: string;
    url: string;
    alt: string;
    caption?: string;
}

export interface FormField {
    id: number;
    type: string;
    label: string;
    required: boolean;
    name: string;
    placeholder?: string;
    options?: Option[];
    sitekey?: string;
    readonly?: boolean;
    images?: ImageItem[];
    layout?: { blocks?: Array< Record< string, unknown > > };
    charlimit?: number;
    row?: number;
    column?: number;
    filesize?: number;
    disabled?: boolean;
    parentId?: number;
    isStore?: boolean;
    fields?: Array< {
        id: string | number;
        key: string;
        label: string;
        type: 'text' | 'select';
        placeholder?: string;
        options?: string[];
        required?: boolean;
    } >;
    value?: Record< string, unknown >;
}

interface ButtonSetting {
    button_text?: string;
    button_style?: string;
    button_color?: string;
    button_background?: string;
}

interface FormSetting {
    formfieldlist?: FormField[];
    butttonsetting?: ButtonSetting;
}

interface CustomFormProps {
    onChange: ( data: {
        formfieldlist: FormField[];
        butttonsetting: ButtonSetting;
    } ) => void;
    name: string;
    proSettingChange: () => boolean;
    formTitlePlaceholder?: string;
    setting: Record< string, FormSetting >;
}
// Default values for input options
const DEFAULT_OPTIONS: Option[] = [
    { id: '1', label: 'Manufacture', value: 'manufacture' },
    { id: '2', label: 'Trader', value: 'trader' },
    { id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
];

const DEFAULT_PLACEHOLDER = ( type: string ): string => `${ type }`;

const DEFAULT_LABEL_SIMPLE = (
    type: string,
    isStore: boolean = false,
    name: string = ''
): string => {
    const cleanType = String( type || '' )
        .trim()
        .toLowerCase();
    if ( isStore ) {
        const storeLabelMap: Record< string, string > = {
            name: 'Enter your store name',
            description: 'Enter your store description',
            phone: 'Enter your store phone',
            paypal_email: 'Enter your store PayPal email',
            address: 'Enter your store address',
        };
        // return mapped label or fallback generic
        return storeLabelMap[ name ];
    }

    return `Enter your ${ cleanType }`;
};

const DEFAULT_LABEL_SELECT = 'Nature of Business';
const DEFAULT_FORM_TITLE = 'Demo Form';

// Example select options
const selectOptions: SelectOption[] = [
    {
        icon: 'adminfont-t-letter-bold icon-form-textbox',
        value: 'text',
        label: 'Textbox',
    },
    {
        icon: 'adminfont-unread icon-form-email',
        value: 'email',
        label: 'Email',
    },
    {
        icon: 'adminfont-text icon-form-textarea',
        value: 'textarea',
        label: 'Textarea',
    },
    {
        icon: 'adminfont-checkbox icon-form-checkboxes',
        value: 'checkboxes',
        label: 'Checkboxes',
    },
    {
        icon: 'adminfont-multi-select icon-form-multi-select',
        value: 'multiselect',
        label: 'Multi Select',
    },
    { icon: 'adminfont-radio icon-form-radio', value: 'radio', label: 'Radio' },
    {
        icon: 'adminfont-dropdown-checklist icon-form-dropdown',
        value: 'dropdown',
        label: 'Dropdown',
    },
    {
        icon: 'adminfont-captcha-automatic-code icon-form-recaptcha',
        value: 'recaptcha',
        label: 'reCaptcha v3',
    },
    {
        icon: 'adminfont-submission-message icon-form-attachment',
        value: 'attachment',
        label: 'Attachment',
    },
    {
        icon: 'adminfont-form-section icon-form-section',
        value: 'section',
        label: 'Section',
    },
    {
        icon: 'adminfont-calendar icon-form-store-description',
        value: 'datepicker',
        label: 'Date Picker',
    },
    {
        icon: 'adminfont-alarm icon-form-address',
        value: 'TimePicker',
        label: 'Time Picker',
    },
    {
        icon: 'adminfont-divider icon-form-address',
        value: 'divider',
        label: 'Divider',
    },
];

const selectOptionsStore: SelectOption[] = [
    {
        icon: 'adminfont-t-letter-bold icon-form-textbox',
        value: 'text',
        label: 'Store Name',
        name: 'name',
    },
    {
        icon: 'adminfont-text icon-form-textarea',
        value: 'textarea',
        label: 'Store Desc',
        name: 'description',
    },
    {
        icon: 'adminfont-t-letter-bold icon-form-textbox',
        value: 'text',
        label: 'Store Phone',
        name: 'phone',
    },
    {
        icon: 'adminfont-unread icon-form-email',
        value: 'email',
        label: 'Store Paypal Email',
        name: 'paypal_email',
    },
    {
        icon: 'adminfont-divider icon-form-address',
        value: 'address',
        label: 'Store Address',
        name: 'address',
    },
];

// Component
const CustomForm: React.FC< CustomFormProps > = ( {
    onChange,
    name,
    proSettingChange,
    setting,
    formTitlePlaceholder,
} ) => {
    const formSetting = setting[ name ] || {};
    const settingHasChanged = useRef( false );
    const firstTimeRender = useRef( true );

    const [ formFieldList, setFormFieldList ] = useState< FormField[] >( () => {
        const inputList = formSetting.formfieldlist || [];
        if ( ! Array.isArray( inputList ) || inputList.length <= 0 ) {
            return [
                {
                    id: 1,
                    type: 'title',
                    label: DEFAULT_FORM_TITLE,
                    required: true,
                    name: 'FORM_TITLE',
                },
            ];
        }
        return inputList;
    } );

    const [ buttonSetting, setButtonSetting ] = useState< ButtonSetting >(
        formSetting.butttonsetting || {}
    );
    const [ opendInput, setOpendInput ] = useState< FormField | null >( null );
    const [ randMaxId, setRendMaxId ] = useState< number >( 0 );

    // State for image gallery
    const [ showImageGallery, setShowImageGallery ] = useState( false );
    const [ selectedFieldForGallery, setSelectedFieldForGallery ] =
        useState< FormField | null >( null );

    useEffect( () => {
        setRendMaxId(
            formFieldList.reduce(
                ( maxId, field ) => Math.max( maxId, field.id ),
                0
            ) + 1
        );
    }, [ formFieldList ] );

    useEffect( () => {
        if ( settingHasChanged.current ) {
            settingHasChanged.current = false;
            onChange( {
                formfieldlist: formFieldList,
                butttonsetting: buttonSetting,
            } );
        }
    }, [ buttonSetting, formFieldList ] );

    const getUniqueName = () => Date.now().toString( 36 );

    const getNewFormField = (
        type = 'text',
        fixedName?: string,
        isStore: boolean = false
    ): FormField => {
        const newFormField: FormField = {
            id: randMaxId ?? 0,
            type,
            label: '',
            required: false,
            name: fixedName ?? `${ type }-${ getUniqueName() }`,
        };

        if (
            [ 'multiselect', 'radio', 'dropdown', 'checkboxes' ].includes(
                type
            )
        ) {
            newFormField.label = DEFAULT_LABEL_SELECT;
            newFormField.options = DEFAULT_OPTIONS;
        } else if ( type === 'title' ) {
            newFormField.label = DEFAULT_FORM_TITLE;
        } else if ( type === 'image-gallery' ) {
            newFormField.label = 'Image Gallery';
            newFormField.images = [];
        } else if ( type === 'block-layout' ) {
            newFormField.label = 'Content Block';
            newFormField.layout = { blocks: [] };
        } else if ( type === 'address' ) {
            newFormField.label = 'Address';
            newFormField.fields = [
                {
                    id: randMaxId + 1,
                    key: 'address_1',
                    label: 'Address Line 1',
                    type: 'text',
                    placeholder: 'Address Line 1',
                    required: true,
                },
                {
                    id: randMaxId + 2,
                    key: 'address_2',
                    label: 'Address Line 2',
                    type: 'text',
                    placeholder: 'Address Line 2',
                },
                {
                    id: randMaxId + 3,
                    key: 'city',
                    label: 'City',
                    type: 'text',
                    placeholder: 'City',
                    required: true,
                },
                {
                    id: randMaxId + 4,
                    key: 'state',
                    label: 'State',
                    type: 'select',
                    options: [
                        'Karnataka',
                        'Maharashtra',
                        'Delhi',
                        'Tamil Nadu',
                    ],
                },
                {
                    id: randMaxId + 5,
                    key: 'country',
                    label: 'Country',
                    type: 'select',
                    options: [ 'India', 'USA', 'UK', 'Canada' ],
                },
                {
                    id: randMaxId + 6,
                    key: 'postcode',
                    label: 'Postal Code',
                    type: 'text',
                    placeholder: 'Postal Code',
                    required: true,
                },
            ];
            newFormField.value = {}; // optional, to hold user-entered values later
        } else {
            newFormField.label = DEFAULT_LABEL_SIMPLE(
                type,
                isStore,
                fixedName
            );
            newFormField.placeholder = DEFAULT_PLACEHOLDER( type );
        }

        setRendMaxId( ( prev ) => ( prev ?? 0 ) + 1 );
        return newFormField;
    };

    const appendNewFormField = (
        index: number,
        type = 'text',
        fixedName?: string,
        readonly = false,
        isStore = false
    ) => {
        if ( proSettingChange() ) {
            return;
        }
        const newField: FormField = getNewFormField( type, fixedName, isStore );
        if ( readonly ) {
            newField.readonly = true;
        }
        // const newFormFieldList = [...formFieldList.slice(0, index + 1), newField, ...formFieldList.slice(index + 1)];

        const currentIndex = opendInput
            ? formFieldList.findIndex( ( field ) => field.id === opendInput.id )
            : -1;
        const insertIndex =
            currentIndex !== -1 ? currentIndex + 1 : formFieldList.length;
        const newFormFieldList = [
            ...formFieldList.slice( 0, insertIndex ),
            newField,
            ...formFieldList.slice( insertIndex ),
        ];

        settingHasChanged.current = true;
        setFormFieldList( newFormFieldList );
        setOpendInput( newField );
        return newField;
    };

    const deleteParticularFormField = ( index: number ) => {
        if ( proSettingChange() ) {
            return;
        }
        const newFormFieldList = formFieldList.filter(
            ( _, i ) => i !== index
        );
        settingHasChanged.current = true;
        setFormFieldList( newFormFieldList );
        if ( opendInput?.id === formFieldList[ index ].id ) {
            setOpendInput( null );
        }
    };

    const handleFormFieldChange = (
        index: number,
        key: string,
        value: FieldValue,
        parentId: number = -1
    ) => {
        if ( proSettingChange() ) {
            return;
        }

        const newFormFieldList = [ ...formFieldList ];

        if ( parentId !== -1 ) {
            // Handle subfield
            const parentIndex = newFormFieldList.findIndex(
                ( f ) => f.id === parentId
            );
            if ( parentIndex >= 0 ) {
                const parentField = { ...newFormFieldList[ parentIndex ] };
                parentField.fields = parentField.fields?.map( ( f ) =>
                    f.id === index ? { ...f, [ key ]: value } : f
                );

                // Update parent value object
                parentField.value = parentField.value || {};
                const changedSubField = parentField.fields?.find(
                    ( f ) => f.id === index
                );
                if ( changedSubField?.key ) {
                    parentField.value[ changedSubField.key ] = value;
                }

                newFormFieldList[ parentIndex ] = parentField;
                setFormFieldList( newFormFieldList );
                settingHasChanged.current = true;

                // Update opened input if it's the same subfield
                if ( opendInput?.id === index ) {
                    setOpendInput( { ...opendInput, [ key ]: value } );
                }

                return;
            }
        }

        // Top-level field
        newFormFieldList[ index ] = {
            ...newFormFieldList[ index ],
            [ key ]: value,
        };
        setFormFieldList( newFormFieldList );
        settingHasChanged.current = true;

        // Update opened input if it's the same field
        if ( opendInput?.id === newFormFieldList[ index ].id ) {
            setOpendInput( newFormFieldList[ index ] );
        }
    };

    const handleFormFieldTypeChange = ( index: number, newType: string ) => {
        if ( proSettingChange() ) {
            return;
        }
        const selectedFormField = formFieldList[ index ];
        if ( selectedFormField.type === newType ) {
            return;
        }

        const newFormField = getNewFormField( newType );
        newFormField.id = selectedFormField.id;

        // Preserve some properties if needed
        if ( selectedFormField.readonly ) {
            newFormField.readonly = true;
        }

        const newFormFieldList = [ ...formFieldList ];
        newFormFieldList[ index ] = newFormField;
        settingHasChanged.current = true;
        setFormFieldList( newFormFieldList );
        setOpendInput( newFormField );
    };

    const handleImageSelect = ( images: ImageItem[] ) => {
        if ( ! selectedFieldForGallery ) {
            return;
        }

        const index = formFieldList.findIndex(
            ( f ) => f.id === selectedFieldForGallery.id
        );
        if ( index >= 0 ) {
            handleFormFieldChange( index, 'images', images );
        }

        setShowImageGallery( false );
        setSelectedFieldForGallery( null );
    };

    // Image Gallery Field Component
    const ImageGalleryField: React.FC< {
        formField: FormField;
        onChange: ( key: string, value: FieldValue ) => void;
    } > = ( { formField, onChange } ) => {
        return (
            <div className="image-gallery-field">
                <label>{ formField.label }</label>
                <div className="gallery-preview">
                    { formField.images && formField.images.length > 0 ? (
                        <div className="selected-images">
                            { formField.images.map( ( image, index ) => (
                                <div key={ index } className="image-thumbnail">
                                    <img src={ image.url } alt={ image.alt } />
                                    <button
                                        className="remove-image"
                                        onClick={ () => {
                                            const newImages =
                                                formField.images?.filter(
                                                    ( _, i ) => i !== index
                                                ) || [];
                                            onChange( 'images', newImages );
                                        } }
                                    >
                                        <i className="admin-font adminfont-delete"></i>
                                    </button>
                                </div>
                            ) ) }
                        </div>
                    ) : (
                        <div className="empty-gallery">
                            <i className="admin-font adminfont-image"></i>
                            <p>No images selected</p>
                        </div>
                    ) }
                </div>
                <button
                    className="admin-btn btn-purple"
                    onClick={ () => {
                        setSelectedFieldForGallery( formField );
                        setShowImageGallery( true );
                    } }
                >
                    <i className="admin-font adminfont-plus-circle"></i>
                    Select Images
                </button>
            </div>
        );
    };

    // Tabs configuration
    const activeTab = 'blocks';
    const tabs = [
        {
            id: 'blocks',
            label: 'Blocks',
            content: (
                <>
                    <Elements
                        label="General"
                        selectOptions={ selectOptions }
                        onClick={ ( type ) => {
                            const newInput = appendNewFormField(
                                formFieldList.length - 1,
                                type
                            );
                            if ( newInput ) {
                                setOpendInput( newInput );
                            }
                        } }
                    />
                    <Elements
                        label="Let’s get your store ready!"
                        selectOptions={ selectOptionsStore }
                        onClick={ ( type ) => {
                            const option = selectOptionsStore.find(
                                ( o ) => o.value === type
                            );
                            const fixedName = option?.name;
                            appendNewFormField(
                                formFieldList.length - 1,
                                type,
                                fixedName,
                                true,
                                true
                            );
                            setOpendInput( null );
                        } }
                    />
                </>
            ),
        },
    ];

    return (
        <div className="registration-from-wrapper">
            <div className="elements-wrapper">
                <div className="tab-contend">
                    { tabs.map(
                        ( tab ) =>
                            activeTab === tab.id && (
                                <div key={ tab.id } className="tab-panel">
                                    { tab.content }
                                </div>
                            )
                    ) }
                </div>
            </div>

            <div className="registration-form-main-section">
                <div
                    className={ `form-heading ${
                        formFieldList[ 0 ]?.disabled ? 'disable' : ''
                    }` }
                >
                    <input
                        type="text"
                        className="basic-input"
                        placeholder={ formTitlePlaceholder }
                        value={ formFieldList[ 0 ]?.label }
                        onChange={ ( e ) => {
                            if ( ! formFieldList[ 0 ]?.disabled ) {
                                handleFormFieldChange(
                                    0,
                                    'label',
                                    e.target.value
                                );
                            }
                        } }
                    />
                    <i
                        className={ `adminfont-${
                            formFieldList[ 0 ]?.disabled ? 'eye-blocked' : 'eye'
                        }` }
                        title={
                            formFieldList[ 0 ]?.disabled
                                ? 'Show Title'
                                : 'Hide Title'
                        }
                        onClick={ () => {
                            const newDisabled = ! formFieldList[ 0 ]?.disabled;
                            handleFormFieldChange( 0, 'disabled', newDisabled );
                        } }
                    ></i>
                </div>

                { /* Form Fields */ }
                <ReactSortable
                    list={ formFieldList }
                    setList={ ( newList ) => {
                        if ( firstTimeRender.current ) {
                            firstTimeRender.current = false;
                            return;
                        }
                        if ( proSettingChange() ) {
                            return;
                        }
                        settingHasChanged.current = true;
                        setFormFieldList( newList );
                    } }
                    handle=".drag-handle"
                >
                    { formFieldList.map( ( formField, index ) => {
                        if ( index === 0 ) {
                            return (
                                <div
                                    key={ index }
                                    style={ { display: 'none' } }
                                ></div>
                            );
                        }
                        return (
                            <main
                                key={ formField.id }
                                className={ `form-field 
                                                ${
                                                    opendInput?.id ===
                                                    formField.id
                                                        ? 'active drag-handle'
                                                        : ''
                                                }` }
                                onClick={ ( e ) => {
                                    e.stopPropagation();
                                    setOpendInput( formField );
                                } }
                            >
                                { opendInput?.id === formField.id && (
                                    <section className="meta-menu">
                                        <span
                                            onClick={ () => {
                                                const index =
                                                    formFieldList.findIndex(
                                                        ( f ) =>
                                                            f.id ===
                                                            opendInput.id
                                                    );
                                                if ( index >= 0 ) {
                                                    deleteParticularFormField(
                                                        index
                                                    );
                                                }
                                                setOpendInput( null );
                                            } }
                                            className="admin-badge red"
                                        >
                                            <i className="admin-font adminfont-delete"></i>
                                        </span>
                                    </section>
                                ) }
                                <section
                                    className={ `form-field-container-wrapper` }
                                >
                                    { [ 'text', 'email', 'number' ].includes(
                                        formField.type
                                    ) && (
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
                                    { [
                                        'radio',
                                        'dropdown',
                                        'multiselect',
                                        'checkboxes',
                                    ].includes( formField.type ) && (
                                        <MultipleOptions
                                            formField={ formField }
                                            onChange={ ( key, value ) =>
                                                handleFormFieldChange(
                                                    index,
                                                    key,
                                                    value
                                                )
                                            }
                                            type={
                                                formField.type as
                                                    | 'radio'
                                                    | 'checkboxes'
                                                    | 'dropdown'
                                                    | 'multiselect'
                                            }
                                            selected={ false }
                                        />
                                    ) }
                                    { formField.type === 'datepicker' && (
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
                                    { formField.type === 'TimePicker' && (
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
                                    { formField.type === 'attachment' && (
                                        <Attachment />
                                    ) }
                                    { formField.type === 'section' && (
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
                                    { formField.type === 'block-layout' && (
                                        <BlockLayout />
                                    ) }
                                    { formField.type === 'image-gallery' && (
                                        <ImageGalleryField
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
                                    { formField.type === 'textarea' && (
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
                                    { formField.type === 'recaptcha' && (
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
                                    { formField.type === 'address' && (
                                        <AddressField
                                            formField={
                                                formField as AddressFormField
                                            }
                                            onChange={ ( key, value ) =>
                                                handleFormFieldChange(
                                                    index,
                                                    key,
                                                    value
                                                )
                                            }
                                            opendInput={ opendInput } // pass current opened input
                                            setOpendInput={ setOpendInput } // allow subfields to set it
                                        />
                                    ) }
                                    { formField.type === 'divider' && (
                                        <div className="divider-field">
                                            <hr />
                                            <span>{ formField.label }</span>
                                        </div>
                                    ) }
                                </section>
                            </main>
                        );
                    } ) }
                </ReactSortable>

                <ButtonCustomizer
                    text={
                        ( buttonSetting.button_text &&
                            buttonSetting.button_text ) ||
                        'Submit'
                    }
                    setting={ buttonSetting }
                    onChange={ ( key, value, isRestoreDefaults = false ) => {
                        if ( proSettingChange() ) {
                            return;
                        }
                        settingHasChanged.current = true;
                        const previousSetting = buttonSetting || {};
                        if ( isRestoreDefaults ) {
                            setButtonSetting( value as ButtonSetting );
                        } else {
                            setButtonSetting( {
                                ...previousSetting,
                                [ key ]: value,
                            } );
                        }
                    } }
                />
            </div>

            { /* Meta Setting Modal outside registration-form-main-section */ }
            <div className="registration-edit-form-wrapper">
                { opendInput && (
                    <>
                        <div className="registration-edit-form">
                            { opendInput.readonly ? (
                                // MultivendorX Free field: allow only label & placeholder
                                <SettingMetaBox
                                    formField={ opendInput }
                                    opened={ { click: true } }
                                    metaType="setting-meta"
                                    inputTypeList={ [] }
                                    onChange={ ( key, value ) => {
                                        if (
                                            key !== 'label' &&
                                            key !== 'placeholder' &&
                                            key !== 'disabled'
                                        ) {
                                            return;
                                        }

                                        if ( opendInput?.parentId ) {
                                            // Subfield case
                                            handleFormFieldChange(
                                                opendInput.id,
                                                key,
                                                value,
                                                opendInput.parentId
                                            );
                                        } else {
                                            // Top-level field case
                                            const index =
                                                formFieldList.findIndex(
                                                    ( f ) =>
                                                        f.id === opendInput.id
                                                );
                                            if ( index >= 0 ) {
                                                handleFormFieldChange(
                                                    index,
                                                    key,
                                                    value
                                                );
                                                setOpendInput( {
                                                    ...formFieldList[ index ],
                                                    [ key ]: value,
                                                } );
                                            }
                                        }
                                    } }
                                />
                            ) : (
                                // Normal fields: full edit box
                                <SettingMetaBox
                                    formField={ opendInput }
                                    opened={ { click: true } }
                                    onChange={ ( key, value ) => {
                                        const index = formFieldList.findIndex(
                                            ( f ) => f.id === opendInput.id
                                        );
                                        if ( index >= 0 ) {
                                            handleFormFieldChange(
                                                index,
                                                key,
                                                value
                                            );
                                            setOpendInput( {
                                                ...formFieldList[ index ],
                                                [ key ]: value,
                                            } );
                                        }
                                    } }
                                    onTypeChange={ ( newType ) => {
                                        const index = formFieldList.findIndex(
                                            ( f ) => f.id === opendInput.id
                                        );
                                        if ( index >= 0 ) {
                                            handleFormFieldTypeChange(
                                                index,
                                                newType
                                            );
                                            setOpendInput( {
                                                ...formFieldList[ index ],
                                                type: newType,
                                            } );
                                        }
                                    } }
                                    inputTypeList={ selectOptions }
                                />
                            ) }
                        </div>
                    </>
                ) }
            </div>

            { /* Image Gallery Modal */ }
            { showImageGallery && (
                <div className="modal-overlay">
                    <div className="modal-content large">
                        <div className="modal-header">
                            <h3>Select Images</h3>
                            <button
                                className="close-btn"
                                onClick={ () => {
                                    setShowImageGallery( false );
                                    setSelectedFieldForGallery( null );
                                } }
                            >
                                <i className="admin-font adminfont-close"></i>
                            </button>
                        </div>
                        <ImageGallery
                            onImageSelect={ handleImageSelect }
                            multiple={ true }
                            selectedImages={
                                selectedFieldForGallery?.images || []
                            }
                        />
                    </div>
                </div>
            ) }
        </div>
    );
};

export default CustomForm;
