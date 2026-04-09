// External dependencies
import React, { useState } from 'react';
import { FieldComponent } from '../fieldUtils';
import '../../styles/web/UI/CopyToClipboard.scss';
import Tooltip from './Tooltip';

// Types
interface CopyToClipboardProps {
    text?: string;
    variant?: 'code' | 'button' | 'icon';
    copyButtonLabel?: string;
    copiedLabel?: string;
    onCopy?: () => string | void;
}

export const CopyToClipboardUI: React.FC<CopyToClipboardProps> = ({
    text,
    variant = 'code',
    copyButtonLabel = 'Copy',
    copiedLabel = 'Copied!',
    onCopy,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            let valueToCopy = text;
            if (onCopy) {
                const result = onCopy();
                if (typeof result === 'string') {
                    valueToCopy = result;
                }
            }

            if (!valueToCopy) return;

            await navigator.clipboard.writeText(valueToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    if (variant === 'button') {
        return (
            <div className="buttons-wrapper">
                <div
                    className="admin-btn btn-purple"
                    onClick={handleCopy}
                >
                    <i className="adminfont-vendor-form-copy"></i>

                    <span className="copy-success">
                        {copied ? copiedLabel : copyButtonLabel}
                    </span>
                </div>
            </div>
        );
    }

    if (variant === 'icon') {
    return (
        <Tooltip className={copied ? "copied" : ""} text={copied ? copiedLabel : copyButtonLabel}>
            <i
                className={
                    copied
                        ? 'adminfont-check'
                        : 'adminfont-vendor-form-copy'
                }
                onClick={handleCopy}
            />
        </Tooltip>
    );
}

    return (
        <div className="copy-to-clipboard">
            <code>{text}</code>

            <Tooltip className={copied ? "copied" : ""} text={copied ? copiedLabel : copyButtonLabel}>
                <i
                    className={
                        copied
                            ? 'adminfont-check'
                            : 'adminfont-vendor-form-copy'
                    }
                    onClick={handleCopy}
                />
            </Tooltip>
        </div>
    );
};

const CopyToClipboard: FieldComponent = {
    render: ({ field }) => (
        <CopyToClipboardUI
            text={field.text}
            variant={field.variant || 'code'}
            copyButtonLabel={field.copyButtonLabel}
            copiedLabel={field.copiedLabel}
            onCopy={field.onCopy}
        />
    ),
    validate: () => null,
};

export default CopyToClipboard;