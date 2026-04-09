import React from 'react';

// Internal dependencies
import { Notice } from '../Notice';

type FormGroupProps = {
    label?: React.ReactNode;
    htmlFor?: string;
    desc?: React.ReactNode;
    icon?: string;
    iconRight?: string;
    children: React.ReactNode;
    className?: string;
    cols?: 1 | 2 | 3 | 4;
    labelDes?: string;
    row?: boolean;
    notice?: string;
    noticeType?: 'error' | 'success' | 'warning' | 'info';
};

const FormGroup: React.FC<FormGroupProps> = ({
    label,
    desc = '',
    icon,
    iconRight,
    htmlFor = '',
    children,
    className = '',
    labelDes,
    cols = 1,
    row = false,
    notice,
    noticeType = 'error',
}) => {
    return (
        <div
            className={`form-group ${row ? 'row' : ''} ${className}`}
            data-cols={cols}
        >
            {label && (
                <label className="settings-form-label" htmlFor={htmlFor}>
                    <div className="title">
                        { icon && (
                            <i className={ `adminfont-${ icon } ${icon} form-icon` } />
                        ) }
                        { label }
                        { iconRight && (
                            <i className={ `adminfont-${ iconRight } form-icon` } />
                        ) }
                    </div>
                    {labelDes && (
                        <div className="settings-metabox-description">
                            {labelDes}
                        </div>
                    )}
                </label>
            )}
            <div className="settings-input-content">
                {children}

                {notice && (
                    <Notice
                        type={noticeType}
                        message={notice}
                        displayPosition="inline"
                    />
                )}

                {desc && (
                    <>
                        {/* Check if desc is a string or React node */}
                        {typeof desc === 'string' ? (
                            <div className="settings-metabox-description" dangerouslySetInnerHTML={{ __html: desc }} />
                        ) : (
                            // Render React nodes directly
                           <div className="settings-metabox-description"> {desc} </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FormGroup;
