import {
    ChangeEvent,
    MouseEvent,
    FocusEvent,
    useState,
    forwardRef,
    ReactNode,
} from 'react';
import DisplayButton from './DisplayButton';
import SelectInput from './SelectInput';

interface InputFeedback {
    type: string;
    message: string;
}

interface SelectOption {
    value: string;
    label: string;
}

type Addon =
    | string
    | ReactNode
    | {
          type: 'select';
          key: string;
          options: SelectOption[];
          value?: string;
          size?: string;
      };

type InputValue = string | Record< string, string >;

interface BasicInputProps {
    wrapperClass?: string;
    inputLabel?: string;
    inputClass?: string;
    id?: string;
    type?:
        | 'text'
        | 'button'
        | 'number'
        | 'color'
        | 'password'
        | 'email'
        | 'file'
        | 'range'
        | 'time'
        | 'url';
    name?: string;
    value?: string | number;
    placeholder?: string;
    min?: number;
    max?: number;
    onChange?: ( value: InputValue ) => void;
    onClick?: ( e: MouseEvent< HTMLInputElement > ) => void;
    onMouseOver?: ( e: MouseEvent< HTMLInputElement > ) => void;
    onMouseOut?: ( e: MouseEvent< HTMLInputElement > ) => void;
    onFocus?: ( e: FocusEvent< HTMLInputElement > ) => void;
    onBlur?: ( e: FocusEvent< HTMLInputElement > ) => void;
    generate?: string;
    clickBtnName?: string;
    feedback?: InputFeedback;
    onclickCallback?: ( e: MouseEvent< HTMLButtonElement > ) => void;
    proSetting?: boolean;
    description?: string;
    rangeUnit?: string;
    disabled?: boolean;
    readOnly?: boolean;
    size?: string;
    required?: boolean;
    preText?: string | ReactNode;
    postText?: string | ReactNode;
    preInsideText?: string | ReactNode;
    postInsideText?: string | ReactNode;
}

const BasicInput = forwardRef< HTMLInputElement, BasicInputProps >(
    (
        {
            wrapperClass,
            inputLabel,
            inputClass,
            id,
            type = 'text',
            name = 'basic-input',
            value,
            placeholder,
            min,
            max,
            onChange,
            onClick,
            onMouseOver,
            onMouseOut,
            onFocus,
            onBlur,
            postInsideText,
            size,
            preText,
            postText,
            generate,
            clickBtnName,
            onclickCallback,
            feedback,
            description,
            rangeUnit,
            disabled = false,
            readOnly = false,
            preInsideText,
            required = false,
        },
        ref
    ) => {
        const [ copied, setCopied ] = useState( false );

        const generateRandomKey = ( length = 8 ): string => {
            const characters =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            return Array.from( { length } )
                .map( () =>
                    characters.charAt(
                        Math.floor( Math.random() * characters.length )
                    )
                )
                .join( '' );
        };

        const generateSSOKey = ( e: MouseEvent< HTMLButtonElement > ) => {
            e.preventDefault();
            const key = generateRandomKey( 8 );
            if ( onChange ) {
                const event = {
                    target: { value: key },
                } as ChangeEvent< HTMLInputElement >;
                onChange( event );
            }
        };

        const handleCopy = ( e: MouseEvent< HTMLButtonElement > ) => {
            e.preventDefault();
            if ( value ) {
                navigator.clipboard.writeText( String( value ) ).then( () => {
                    setCopied( true );
                    setTimeout( () => setCopied( false ), 10000 );
                } );
            }
        };

        const handleClear = ( e: MouseEvent< HTMLButtonElement > ) => {
            e.preventDefault();
            if ( onChange ) {
                const event = {
                    target: { value: '' },
                } as ChangeEvent< HTMLInputElement >;
                onChange( event );
            }
        };

        const renderAddon = (
            addon: Addon,
            parentValue: string | Record< string, string >
        ) => {
            if ( ! addon ) {
                return null;
            }

            if ( typeof addon === 'string' || typeof addon !== 'object' ) {
                return typeof addon === 'string' ? (
                    <span dangerouslySetInnerHTML={ { __html: addon } } />
                ) : (
                    addon
                );
            }

            if ( addon.type === 'select' && addon.options?.length ) {
                return (
                    <SelectInput
                        wrapperClass=""
                        name={ addon.key || '' }
                        options={ addon.options.map(
                            ( opt: SelectOption ) => ( {
                                value: opt.value,
                                label: opt.label || opt.value,
                            } )
                        ) }
                        value={
                            parentValue?.[ addon.key ] || addon.value || ''
                        }
                        size={ addon.size || undefined }
                        onChange={ ( newValue ) => {
                            if ( typeof onChange === 'function' ) {
                                onChange( {
                                    ...parentValue, // preserve other keys
                                    [ addon.key ]: newValue.value, // set selected key
                                } );
                            }
                        } }
                    />
                );
            }

            return null;
        };

        return (
            <>
                <div
                    className={ `setting-form-input ${ wrapperClass || '' } ${
                        clickBtnName || generate ? 'input-button' : ''
                    } ${
                        preInsideText || postInsideText ? 'inner-input' : ''
                    }` }
                >
                    { inputLabel && (
                        <label htmlFor={ id }>{ inputLabel }</label>
                    ) }

                    { type === 'button' ? (
                        <DisplayButton
                            wraperClass={
                                inputClass || 'admin-btn default-btn'
                            }
                            onClick={ ( e ) => {
                                e.preventDefault();

                                if ( onclickCallback ) {
                                    onclickCallback( e );
                                    return;
                                }

                                if ( onClick ) {
                                    onClick(
                                        e as MouseEvent< HTMLInputElement >
                                    );
                                }
                            } }
                        >
                            <span className="text">{ name }</span>
                        </DisplayButton>
                    ) : (
                        <>
                            { preText && (
                                <span className="before">
                                    { renderAddon( preText, value ) }
                                </span>
                            ) }
                            <div
                                className="input-wrapper"
                                style={ { width: size || '100%' } }
                            >
                                { preInsideText && (
                                    <span className="pre">
                                        { renderAddon( preInsideText, value ) }
                                    </span>
                                ) }
                                <input
                                    ref={ ref }
                                    className={ [
                                        'basic-input',
                                        inputClass,
                                    ].join( ' ' ) }
                                    id={ id }
                                    type={ type }
                                    name={ name }
                                    placeholder={ placeholder }
                                    min={
                                        [ 'number', 'range' ].includes( type )
                                            ? min
                                            : undefined
                                    }
                                    max={
                                        [ 'number', 'range' ].includes( type )
                                            ? max
                                            : undefined
                                    }
                                    value={
                                        typeof value === 'object'
                                            ? value.value ?? ''
                                            : value ?? ''
                                    }
                                    onChange={ ( e ) => {
                                        const newVal = e.target.value;

                                        const hasObjectAddon =
                                            ( preText &&
                                                typeof preText === 'object' ) ||
                                            ( postText &&
                                                typeof postText ===
                                                    'object' ) ||
                                            ( postInsideText &&
                                                typeof postInsideText ===
                                                    'object' ) ||
                                            ( preInsideText &&
                                                typeof preInsideText ===
                                                    'object' );

                                        if ( hasObjectAddon ) {
                                            // Save as object with main value
                                            const base =
                                                typeof value === 'object'
                                                    ? value
                                                    : {
                                                          value:
                                                              typeof value ===
                                                              'string'
                                                                  ? value
                                                                  : '',
                                                      };
                                            onChange( {
                                                ...base,
                                                value: newVal,
                                            } );
                                        } else {
                                            onChange( e );
                                        }
                                    } }
                                    onClick={ onClick }
                                    onMouseOver={ onMouseOver }
                                    onMouseOut={ onMouseOut }
                                    onFocus={ onFocus }
                                    onBlur={ onBlur }
                                    disabled={ disabled }
                                    readOnly={ readOnly }
                                    required={ required }
                                />
                                { type === 'color' && (
                                    <div className="color-value">{ value }</div>
                                ) }

                                { postInsideText && (
                                    <span className="parameter">
                                        { renderAddon( postInsideText, value ) }
                                    </span>
                                ) }

                                { clickBtnName && (
                                    <DisplayButton
                                        wraperClass="admin-btn btn-purple input-btn"
                                        onClick={ onclickCallback }
                                    >
                                        <>{ clickBtnName }</>
                                    </DisplayButton>
                                ) }
                                { generate &&
                                    ( ! value || value === '' ? (
                                        <DisplayButton
                                            wraperClass="admin-btn btn-purple input-btn"
                                            onClick={ generateSSOKey }
                                        >
                                            <>
                                                <i className="adminfont-star-icon"></i>
                                                <span className="text">
                                                    Generate
                                                </span>
                                            </>
                                        </DisplayButton>
                                    ) : (
                                        <>
                                            <DisplayButton
                                                wraperClass="clear-btn"
                                                onClick={ handleClear }
                                            >
                                                <i className="adminfont-delete"></i>
                                            </DisplayButton>

                                            <DisplayButton
                                                wraperClass="copy-btn"
                                                onClick={ handleCopy }
                                            >
                                                <>
                                                    <i className="adminfont-vendor-form-copy"></i>
                                                    <span
                                                        className={
                                                            ! copied
                                                                ? 'tooltip'
                                                                : 'tooltip tool-clip'
                                                        }
                                                    >
                                                        { copied ? (
                                                            <>
                                                                <i className="adminfont-success-notification"></i>
                                                                Copied
                                                            </>
                                                        ) : (
                                                            'Copy to clipboard'
                                                        ) }
                                                    </span>
                                                </>
                                            </DisplayButton>
                                        </>
                                    ) ) }
                            </div>
                            { postText && (
                                <span className="after">
                                    { renderAddon( postText, value ) }
                                </span>
                            ) }
                        </>
                    ) }
                    { type === 'range' && (
                        <output className="settings-metabox-description">
                            { value ?? 0 }
                            { rangeUnit }
                        </output>
                    ) }
                </div>

                { description && (
                    <p
                        className="settings-metabox-description"
                        dangerouslySetInnerHTML={ { __html: description } }
                    />
                ) }
                { feedback && (
                    <div className={ feedback.type }>{ feedback.message }</div>
                ) }
            </>
        );
    }
);

export default BasicInput;
