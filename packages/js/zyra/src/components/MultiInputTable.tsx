// External dependencies
import React, { useState } from 'react';

// Internal dependencies
import '../styles/web/MultiInputTable.scss';
import { FieldComponent, FIELD_REGISTRY, ZyraVariable } from './fieldUtils';

export type SettingValue = string[] | boolean;
export type RowChanges = Record<string, SettingValue>;
type FieldSetting = Record<string, SettingValue>;

interface Row {
    key: string;
    label: string;
    description?: string;
    enabledKey?: string;
    inactiveMessage?: string;
}

interface Column {
    key: string;
    label: string;
    type?: string;
    moduleEnabled?: string;
    proSetting?: string;
    visibleWhen?: {
        key: string;
        value: string | boolean;
    };
    fields?: {
        key: string;
        type: string;
    }[];
}

interface CapabilityGroup {
    label: string;
    desc: string;
    capability: Record<string, string>;
}

type GroupedRows = Record<string, CapabilityGroup>;

// ── Component props ───────────────────────────────────────────────────────────

export interface MultiInputTableUIProps {
    rows: Row[] | GroupedRows;
    columns: Column[];
    setting: FieldSetting;
    /** Global settings used for `visibleWhen` column lookups — keys like
     *  `enable_store_time` live here, NOT inside the field's own value. */
    visibilityContext?: FieldSetting;
    onChange: (
        subKeyOrBatch: string | RowChanges,
        value?: SettingValue
    ) => void;
    proSetting?: boolean;
    modules: string[];
    storeTabSetting: Record<string, string[]>;
    khali_dabba: boolean;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}

interface TableCellProps {
    type: string;
    fieldKey: string;
    rowKey: string;
    column: Column;
    rowLabel: string;
    value: SettingValue;
    disabled?: boolean;
    onChange: (key: string, value: SettingValue) => void;
    modules: string[];
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}

function isBlocked(
    opt: Option,
    modules: string[],
    onBlocked?: MultiCheckBoxProps['onBlocked']
): boolean {
    if (opt.proSetting && !ZyraVariable?.khali_dabba) {
        onBlocked?.('pro');
        return true;
    }
    if (opt.moduleEnabled && !modules.includes(opt.moduleEnabled)) {
        onBlocked?.('module', opt.moduleEnabled);
        return true;
    }
    return false;
}

export const TableCell: React.FC<TableCellProps> = ({
    type,
    fieldKey,
    rowKey,
    column,
    rowLabel,
    value,
    disabled,
    onChange,
    modules,
    onBlocked,
}) => {
    const comp = FIELD_REGISTRY[type];

    if (!comp) {
        return <td key={fieldKey}>—</td>;
    }

    const Render = comp.render;

    // Pass EVERYTHING through - no hardcoded props
    const fieldConfig = {
        key: fieldKey,
        type: type,
        label: column.label ?? rowLabel,
        ...column, // All column props pass through
        rowKey: rowKey, // Row context
        rowLabel: rowLabel,
        disabled: disabled,
    };

    return (
        <Render
            field={fieldConfig}
            value={value}
            modules={modules}
            // appLocalizer={appLocalizer}
            onBlocked={onBlocked}
            canAccess={!disabled}
            onChange={(newValue: SettingValue) => {
                onChange(fieldKey, newValue);
            }}
        />
    );
};

export const MultiInputTableUI: React.FC<MultiInputTableUIProps> = ({
    rows,
    columns,
    setting,
    visibilityContext,
    onChange,
    storeTabSetting,
    proSetting,
    modules,
    onBlocked,
    khali_dabba,
}) => {
    const [openGroup, setOpenGroup] = useState<string | null>(() => {
        if (!Array.isArray(rows) && Object.keys(rows).length > 0) {
            return Object.keys(rows)[0];
        }
        return null;
    });

    const context = visibilityContext ?? setting;
    const isColumnVisible = (col: Column) => {
        if (!col.visibleWhen) {
            return true;
        }

        const { key, value } = col.visibleWhen;
        if (Array.isArray(value)) {
            return value.includes(context?.[key]);
        }
        return context?.[key] === value;
    };

    const visibleColumns = columns.filter(isColumnVisible);

    const renderCell = (
        column: Column,
        rowKey: string,
        rowLabel: string,
        isRowActive: boolean
    ) => {
        const fields = column.fields ?? [{ key: column.key, type: 'checkbox' }];
    
        return (
            <td key={`${column.key}_${rowKey}`}>
                <div className="multi-field-cell">
                    {fields.map((field) => {
                        if (column.type == "checkbox") {
                            const roleKey = column.key;
                            const currentValues: string[] = (setting['role_access_table']?.[roleKey] as string[]) ?? 
                                (setting[roleKey] as string[]) ?? 
                                [];
                            const checked = currentValues.includes(rowKey);
    
                            const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                const newValues = e.target.checked
                                    ? [...currentValues, rowKey]
                                    : currentValues.filter((k) => k !== rowKey);
    
                                onChange(roleKey, newValues);
                            };
    
                            return (
                                <input
                                    key={`${column.key}_${field.key}_${rowKey}`}
                                    type="checkbox"
                                    checked={checked}
                                    disabled={!isRowActive}
                                    onChange={(e) => {
                                        if (isBlocked(column, modules, onBlocked)) {
                                            return; // 🚫 block interaction
                                        }
                                        console.log("checkbox trigger");
                                        handleCheckboxChange(e); // ✅ use existing logic
                                    }}
                                />
                            );
                        } else {
                            const fieldKey = column.fields
                                ? `${column.key}_${field.key}_${rowKey}`
                                : `${column.key}`;

                            return (
                                <TableCell
                                    key={fieldKey}
                                    type={field.type}
                                    fieldKey={fieldKey}
                                    rowKey={rowKey}
                                    column={column}
                                    rowLabel={rowLabel}
                                    value={setting[fieldKey] ?? []}
                                    disabled={!isRowActive}
                                    onChange={onChange}
                                    modules={modules}
                                    onBlocked={onBlocked}
                                />
                            );
                        }
                    })}
                </div>
            </td>
        );
    };

    const renderFlatRows = (flatRows: Row[]) =>
        flatRows.map((row) => {
            const isRowActive = row.enabledKey
                ? ((setting[row.enabledKey] as string[] | undefined)?.includes(
                    row.key
                ) ?? false)
                : true;

            const handleRowToggle = (checked: boolean) => {
                const current = (setting[row.enabledKey!] as string[]) ?? [];
                onChange(
                    row.enabledKey!,
                    checked
                        ? [...current, row.key]
                        : current.filter((k) => k !== row.key)
                );
            };

            return (
                <tr
                    key={row.key}
                    className={
                        row.enabledKey && !isRowActive ? 'row-disabled' : ''
                    }
                >
                    <td>
                        {row.enabledKey ? (
                            <>
                                <input
                                    type="checkbox"
                                    id={`row-toggle_${row.key}`}
                                    checked={isRowActive}
                                    onChange={(e) =>
                                        handleRowToggle(e.target.checked)
                                    }
                                />
                                <span>{row.label}</span>
                            </>
                        ) : (
                            row.label
                        )}
                    </td>
                    {!isRowActive ? (
                        <td colSpan={visibleColumns.length}>
                            <span className="row-inactive-message">
                                {row.inactiveMessage ?? 'Inactive'}
                            </span>
                        </td>
                    ) : (
                        columns
                            .filter(isColumnVisible)
                            .map((col) =>
                                renderCell(col, row.key, row.label, true)
                            )
                    )}
                </tr>
            );
        });

    const renderGroupedRows = (groupedRows: GroupedRows) => {
        return Object.entries(groupedRows).map(([groupKey, group]) => {
            const isOpen = openGroup === groupKey;
            return (
                <React.Fragment key={groupKey}>
                    <div
                        className="toggle-header"
                        onClick={() => setOpenGroup(isOpen ? null : groupKey)}
                    >
                        <div className="header-title">
                            {group.label}
                            <i
                                className={`adminfont-${isOpen
                                        ? 'keyboard-arrow-down'
                                        : 'pagination-right-arrow'
                                    }`}
                            />
                        </div>
                    </div>
                    {isOpen &&
                        Object.entries(group.capability).map(
                            ([capKey, capLabel]) => {
                                const hasExists = Object.values(
                                    storeTabSetting
                                ).some((arr) => arr?.includes(capKey));
                                return (
                                    <tr key={capKey}>
                                        <td>{capLabel}</td>
                                        {columns
                                            .filter(isColumnVisible)
                                            .map((col) =>
                                                renderCell(
                                                    col,
                                                    capKey,
                                                    capLabel,
                                                    hasExists
                                                )
                                            )}
                                    </tr>
                                );
                            }
                        )}
                </React.Fragment>
            );
        });
    };

    return (
        <>
            {proSetting && (
                <span className="admin-pro-tag">
                    <i className="adminfont-pro-tag" /> Pro
                </span>
            )}

            <table className="grid-table">
                <thead>
                    <tr>
                        <th />
                        {columns.filter(isColumnVisible).map((column) => (
                            <th key={column.key}>
                                {column.label}
                                {column.proSetting && !khali_dabba && (
                                    <span className="admin-pro-tag">
                                        <i className="adminfont-pro-tag" /> Pro
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {Array.isArray(rows)
                        ? renderFlatRows(rows as Row[])
                        : renderGroupedRows(rows as GroupedRows)}
                </tbody>
            </table>
        </>
    );
};

// ─── FieldComponent wrapper ───────────────────────────────────────────────────

const MultiInputTable: FieldComponent = {
    render: ({
        field,
        value,
        onChange,
        canAccess,
        modules,
        settings,
        onBlocked,
        storeTabSetting,
    }) => {
        const currentSetting: FieldSetting =
            value && typeof value === 'object' && !Array.isArray(value)
                ? (value as FieldSetting)
                : {};

        const handleChange = (
            subKeyOrBatch: string | RowChanges,
            subVal?: SettingValue
        ) => {
            if (!canAccess) {
                return;
            }

            const patch =
                typeof subKeyOrBatch === 'object'
                    ? subKeyOrBatch
                    : { [subKeyOrBatch]: subVal };

            onChange({ ...currentSetting, ...patch });
        };

        return (
            <MultiInputTableUI
                khali_dabba={ZyraVariable?.khali_dabba ?? false}
                rows={field.rows ?? []}
                columns={field.columns ?? []}
                setting={settings || currentSetting}
                visibilityContext={settings as FieldSetting}
                storeTabSetting={storeTabSetting ?? {}}
                proSetting={field.proSetting ?? false}
                modules={modules ?? []}
                onBlocked={onBlocked}
                onChange={handleChange}
            />
        );
    },
    validate: () => null,
};

export default MultiInputTable;
