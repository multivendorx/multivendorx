import DisplayButton from '../../DisplayButton';
import { generateRandomKey } from './utils';
import { useState, MouseEvent } from 'react';

export const GeneratableInput = ({
  value,
  onChange,
}: {
  value?: string | number | Record<string, any>;
  onChange?: (value: any) => void;
}) => {
  const [copied, setCopied] = useState(false);

  const generate = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const key = generateRandomKey();
    onChange?.(key);
  };

const clear = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onChange?.('');
  };

  const copy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!value) return;
    await navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 10000);
  };

  return (
    <>
      {!value || value === '' ? (
        <DisplayButton
          wraperClass="admin-btn btn-purple input-btn"
          onClick={generate}
        >
          <>
            <i className="adminfont-star-icon"></i>
            <span className="text">Generate</span>
          </>
        </DisplayButton>
      ) : (
        <>
          <DisplayButton wraperClass="clear-btn" onClick={clear}>
            <i className="adminfont-delete"></i>
          </DisplayButton>

          <DisplayButton wraperClass="copy-btn" onClick={copy}>
            <>
              <i className="adminfont-vendor-form-copy"></i>
              <span className={copied ? 'tooltip tool-clip' : 'tooltip'}>
                {copied ? (
                  <>
                    <i className="adminfont-success-notification"></i>
                    Copied
                  </>
                ) : (
                  'Copy to clipboard'
                )}
              </span>
            </>
          </DisplayButton>
        </>
      )}
    </>
  );
};
