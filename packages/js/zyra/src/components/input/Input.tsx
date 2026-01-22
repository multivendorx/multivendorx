import { forwardRef } from 'react';
import {
  renderAddon,
  hasObjectAddon,
} from './_internal/InputWithAddons';
import { ButtonInput } from './_internal/ButtonInput';
import { TextInput } from './_internal/TextInput';
import { RangeInput } from './_internal/RangeInput';
import { GeneratableInput } from './_internal/GeneratableInput';
import { LabeledField } from './_internal/LabeledField';
import DisplayButton from '../DisplayButton';

const Input = forwardRef<HTMLInputElement, any>(
  (props, ref) => {
    const {
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
      generate,
      clickBtnName,
      onclickCallback,
      feedback,
      description,
      rangeUnit,
      disabled = false,
      readOnly = false,
      size,
      preText,
      postText,
      preInsideText,
      postInsideText,
      required = false,
    } = props;

    if (type === 'button') {
      return <ButtonInput {...props} />;
    }

    // Determine wrapper classes
    const wrapperClasses = [
      'setting-form-input',
      wrapperClass || '',
      (clickBtnName || generate) ? 'input-button' : '',
      (preInsideText || postInsideText) ? 'inner-input' : '',
    ].filter(Boolean).join(' ');

    // Determine if we need object value handling
    const needsObjectValue = hasObjectAddon(preText, postText, preInsideText, postInsideText);

    // Get actual display value
    const actualValue = typeof value === 'object' && value !== null && 'value' in value
      ? value.value
      : value;

    return (
      <div className={wrapperClasses}>
        <LabeledField
          label={inputLabel}
          id={id}
          description={description}
          feedback={feedback}
        >
          {preText && (
            <span className="before">
              {renderAddon(preText, value, onChange)}
            </span>
          )}

          <div
            className="input-wrapper"
            style={{ width: size || '100%' }}
          >
            {preInsideText && (
              <span className="pre">
                {renderAddon(preInsideText, value, onChange)}
              </span>
            )}

            <TextInput
              ref={ref}
              className={['basic-input', inputClass].filter(Boolean).join(' ')}
              id={id}
              type={type}
              name={name}
              placeholder={placeholder}
              min={['number', 'range'].includes(type) ? min : undefined}
              max={['number', 'range'].includes(type) ? max : undefined}
              value={value}
              onChange={onChange}
              onClick={onClick}
              onMouseOver={onMouseOver}
              onMouseOut={onMouseOut}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              needsObjectValue={needsObjectValue}
            />

            {type === 'color' && (
              <div className="color-value">{actualValue}</div>
            )}

            {postInsideText && (
              <span className="parameter">
                {renderAddon(postInsideText, value, onChange)}
              </span>
            )}

            {clickBtnName && (
              <DisplayButton
                wraperClass="admin-btn btn-purple input-btn"
                onClick={onclickCallback}
              >
                <>{clickBtnName}</>
              </DisplayButton>
            )}

            {generate && (
              <GeneratableInput
                value={actualValue}
                onChange={onChange}
              />
            )}
          </div>

          {postText && (
            <span className="after">
              {renderAddon(postText, value, onChange)}
            </span>
          )}

          {type === 'range' && (
            <RangeInput value={actualValue} unit={rangeUnit} />
          )}
        </LabeledField>
      </div>
    );
  }
);

export default Input;
