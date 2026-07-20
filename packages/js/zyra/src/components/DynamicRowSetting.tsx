// External dependencies
import React from 'react';

// Internal dependencies
import '../styles/web/DynamicRowSetting.scss';
import { FIELD_REGISTRY } from './fieldUtils';
import { ButtonInputUI } from './ButtonInput';
import { Notice } from './Notice';

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
    emptyText?: string;
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
    emptyText = 'No items added yet',
    childrenRenderer = () => false,
    canAccess = true,
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
        if (!fieldComponent) {
            return null;
        }
        const Render = fieldComponent.render;
        const fieldValue = row?.[field.key];

        const handleInternalChange = (
            val: string | number | File | RowValue[] | null
        ) => {
            handleChange(rowIndex, field.key, val);
            return;
        };

        const updateRow = (patch: Partial<RowValue>) => {
            const updatedRows = [...value];
            updatedRows[rowIndex] = {
                ...updatedRows[rowIndex],
                ...patch,
            };
            onChange(updatedRows);
        };

        return (
            <>
                {field.label && <label>{field.label}</label>}
                <Render
                    field={{
                        ...field,
                        onClick: field.onClick
                            ? () =>
                                  field.onClick({
                                      row,
                                      rowIndex,
                                      updateRow,
                                  })
                            : field.onClick,
                    }}
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
                {value.length === 0 ? (
                    <Notice
							type="info"
							displayPosition="inline-notice"
							message={emptyText}
						/>
                ) : (
                    value.map((row, rowIndex) => {
                        const nestedChildren = childrenRenderer?.(
                            row,
                            rowIndex
                        );

                        return (
                            <div key={rowIndex} className="repeater-field">
                                <div className="field">
                                    {template.fields.map((field) =>
                                        renderField(field, row, rowIndex)
                                    )}

                                    <ButtonInputUI
                                        position="left"
                                        buttons={[
                                            {
                                                icon: 'delete',
                                                text: 'Delete',
                                                color: 'red',
                                                onClick: () =>
                                                    handleDelete(rowIndex),
                                            },
                                        ]}
                                    />
                                </div>

                                {nestedChildren && (
                                    <div className="repeater-field-nested">
                                        {nestedChildren}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                <ButtonInputUI
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
