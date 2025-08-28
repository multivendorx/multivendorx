/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/ShortCodeTable.scss';

// Types
interface Option {
    label?: string;
    desc?: string;
}

interface ShortCodeTableProps {
    descClass: string;
    description?: string;
    options: Option[];
    optionLabel?: string[];
    icon?: string; // Icon as string
}

const ShortCodeTable: React.FC<ShortCodeTableProps> = (props) => {
    const { descClass, description, options, optionLabel, icon } = props;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <>
            <table className="shortcode-table">
                <thead>
                    <tr>
                        {optionLabel && optionLabel.length > 0 ? (
                            optionLabel.map((label, index) => (
                                <th key={index}>{label}</th>
                            ))
                        ) : (
                            <th>No Labels</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {options && options.length > 0 ? (
                        options.map((option, index) => (
                            <tr key={index}>
                                <td onClick={() => handleCopy(option.label!)}>
                                    <code>{option.label}</code>
                                    {icon && option.label && (
                                        <i className="adminlib-vendor-form-copy"></i>
                                    )}
                                </td>
                                <td>{option.desc}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={2}>No Options Available</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {description && (
                <p
                    className={descClass}
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}
        </>
    );
};

export default ShortCodeTable;
