// External dependencies
import React from 'react';

// Internal dependencies
import '../styles/web/DynamicRowSetting.scss';
import '../styles/web/ToggleSetting.scss';
import { SelectInputUI } from './SelectInput';
import { FIELD_REGISTRY } from './FieldRegistry';
import { AdminButtonUI } from './AdminButton';

// Types
type FieldType = 'text' | 'number' | 'file' | 'select' | 'button';

type RowValue = Record<string, string | number | File | RowValue[] | null>;

interface FieldConfig {
    key: string;
    label?: string;
    type: FieldType;
    placeholder?: string;
    options?: { label: string; value: string; children?: RowValue[] }[];
    width?: string;
    onClick?: (params: {
        row: RowValue;
        rowIndex: number;
        updateRow: (patch: Partial<RowValue>) => void;
    }) => void;
}

interface RowConfig {
    fields: FieldConfig[];
}

export interface DynamicRowSettingProps {
    wrapperClass?: string;
    keyName: string;
    template: RowConfig;
    value: RowValue[];
    onChange: (rows: RowValue[]) => void;
    addLabel?: string;
    childrenRenderer?: (
        row: RowValue,
        rowIndex: number
    ) => React.ReactNode | false;
    canAccess?: boolean;
}

const DynamicRowSetting: React.FC<DynamicRowSettingProps> = ({
    wrapperClass = '',
    template,
    value,
    onChange,
    addLabel = 'Add New',
    childrenRenderer = () => false,
    canAccess = true
}) => {
    const handleAdd = () => {
        const emptyRow: RowValue = {};
        template.fields.forEach((field) => {
            emptyRow[field.key] = field.type === 'file' ? null : '';
        });
        onChange([...value, emptyRow]);
    };

    const handleChange = (
        rowIndex: number,
        fieldKey: string,
        newVal: string | number | File | RowValue[] | null
    ) => {
        const updatedRows = [...value];
        updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            [fieldKey]: newVal,
        };
        onChange(updatedRows);
    };

    const handleDelete = (rowIndex: number) => {
        onChange(value.filter((_, i) => i !== rowIndex));
    };

    function renderField(field: FieldConfig, row: RowValue, rowIndex: number) {
        const fieldComponent = FIELD_REGISTRY[field.type];
        if (!fieldComponent) return null;
        const Render = fieldComponent.render;
        const fieldValue = row?.[field.key];

        const handleInternalChange = (val: any) => {
            handleChange(rowIndex, field.key, val)
            return;
        };

        return (
            <>
                <label>{field.label}</label>
                <Render
                    field={field}
                    value={fieldValue}
                    onChange={handleInternalChange}
                    canAccess={canAccess}
                />
            </>
        );
    }
    return (
        <>
            <div className={`repeater-field-wrapper ${wrapperClass}`}>
                {value.map((row, rowIndex) => (
                    <div key={rowIndex} className="repeater-field">
                        <div className="field">
                            {template.fields.map((field) => (
                                renderField(field, row, rowIndex)
                            ))}

                            <AdminButtonUI
                                position="left"
                                buttons={[
                                    {
                                        icon: 'delete',
                                        text: 'Delete',
                                        color: 'purple',
                                        onClick: (e) => handleDelete(rowIndex),
                                    },
                                ]}
                            />
                        </div>
                        {(() => {
                            const nestedChildren = childrenRenderer?.(
                                row,
                                rowIndex
                            );
                            return nestedChildren ? (
                                <div className="repeater-field-nested">
                                    {nestedChildren}
                                </div>
                            ) : null;
                        })()}
                    </div>
                ))}

                <AdminButtonUI
                    position="left"
                    buttons={[
                        {
                            icon: 'plus',
                            text: addLabel,
                            color: 'purple',
                            onClick: handleAdd,
                        },
                    ]}
                />
            </div>
        </>
    );
};

export default DynamicRowSetting;
