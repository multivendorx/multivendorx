// External dependencies
import React, { useState } from 'react';

// Internal dependencies
import '../styles/web/MultiCheckboxTable.scss';
import { FieldComponent } from './types';
import { SelectInputUI } from './SelectInput';
import { PopupUI } from './Popup';
import { MultiCheckBoxUI } from './MultiCheckbox';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
    value: string | number;
    label: string;
}

interface Column {
    key: string;
    label: string;
    type?: 'checkbox' | 'description';
    moduleEnabled?: string;
    proSetting?: string;
}

interface Row {
    key: string;
    label: string;
    description?: string;
    options?: Option[];
    // When set, the label cell shows a toggle checkbox.
    // setting[enabledKey] is a string[] of active row.key values;
    // unchecked rows have all their cells disabled.
    enabledKey?: string;
}

interface CapabilityGroup {
    label: string;
    desc: string;
    capability: Record<string, string>;
}

type GroupedRows = Record<string, CapabilityGroup>;

// Keys: `${column.key}_${row.key}` → Option[]  (select-cell rows)
//       `${column.key}`            → string[]  (checkbox rows)
type FieldSetting = Record<string, string[] | Option[]>;

interface MultiCheckboxTableUIProps {
    rows: Row[] | GroupedRows;
    columns: Column[];
    onChange: (subKey: string, value: string[] | Option[]) => void;
    setting: FieldSetting;
    modules: string[];
    storeTabSetting: Record<string, string[]>;
    khali_dabba: boolean;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}

// ─── TableCheckbox ────────────────────────────────────────────────────────────
// label + input pair ensures the CSS pseudo-element tick always renders.

interface TableCheckboxProps {
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}

// const TableCheckbox: React.FC<TableCheckboxProps> = ({ id, checked, disabled = false, onChange }) => (
//     <div className="default-checkbox table-checkbox">
//         <input
//             type="checkbox"
//             id={id}
//             checked={checked}
//             disabled={disabled}
//             onChange={(e) => onChange(e.target.checked)}
//         />
//         <label htmlFor={id} className="checkbox-label" />
//     </div>
// );
const TableCheckbox: React.FC<TableCheckboxProps> = ({ checked, disabled = false, onChange }) => {
    const value = checked ? ['yes'] : [];

    const handleChange = (newValues: string[]) => {
        onChange(newValues.length > 0);
    };
    
    return (
        <MultiCheckBoxUI
            options={[
                { value: 'yes', label: '' }
            ]}
            value={value}
            onChange={handleChange}
        />
    );
};
// ─── TableCellSelect ──────────────────────────────────────────────────────────
// Multi-select cell for rows that have an options pool.
//
// Compact view: shows maxVisibleItems=2 chips + "+N" overflow badge.
// Overflow click: opens a PopupUI lightbox with the full uncapped select,
//                 so the user can review / add / remove all selections.

interface TableCellSelectProps {
    settingKey: string;
    rowLabel: string;       // used as popup header title
    rowOptions: Option[];
    currentValue: Option[];
    onChange: (key: string, value: Option[]) => void;
    isBlocked: () => boolean;
    disabled?: boolean;
}

const TableCellSelect: React.FC<TableCellSelectProps> = ({
    settingKey,
    rowLabel,
    rowOptions,
    currentValue,
    onChange,
    isBlocked,
    disabled = false,
}) => {
    const [popupOpen, setPopupOpen] = useState(false);

    // EnhancedSelectInputUI works with string[], so we convert both ways.
    const optionStrings = rowOptions.map((o) => ({ value: String(o.value), label: o.label }));
    const selectedStrings = currentValue.map((v) => String(v.value));

    const handleChange = (raw: string | string[]) => {
        if (isBlocked()) return;
        const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const resolved: Option[] = selected.map(
            (s) => rowOptions.find((o) => String(o.value) === s) ?? { value: s, label: s }
        );
        onChange(settingKey, resolved);
    };

    const sharedSelectProps = {
        type: 'creatable-multi' as const,
        options: optionStrings,
        value: selectedStrings,
        onChange: handleChange,
        isClearable: true,
        placeholder: 'Select...',
        disabled,
    };

    return (
        <>
            {/* Compact cell view — 2 chips max, +N badge opens popup */}
            <SelectInputUI
                {...sharedSelectProps}
                maxVisibleItems={2}
                onOverflowClick={() => setPopupOpen(true)}
            />

            {/* Lightbox popup — full expanded view of the same select */}
            <PopupUI
                position="lightbox"
                open={popupOpen}
                onClose={() => setPopupOpen(false)}
                showBackdrop
                width={28}
                header={{ title: rowLabel, showCloseButton: true }}
            >
                <SelectInputUI
                    {...sharedSelectProps}
                />
            </PopupUI>
        </>
    );
};

// ─── MultiCheckboxTableUI ─────────────────────────────────────────────────────

export const MultiCheckboxTableUI: React.FC<MultiCheckboxTableUIProps> = ({
    rows,
    columns,
    onChange,
    setting,
    storeTabSetting,
    modules,
    onBlocked,
    khali_dabba,
}) => {
    const [openGroup, setOpenGroup] = useState<string | null>(() => {
        if (!Array.isArray(rows) && rows && Object.keys(rows).length > 0) {
            return Object.keys(rows)[0];
        }
        return null;
    });

    // Returns true (and fires onBlocked) if the column is gated
    const makeBlockChecker = (column: Column) => (): boolean => {
        if (column.proSetting && !khali_dabba) { onBlocked?.('pro'); return true; }
        if (column.moduleEnabled && !modules.includes(column.moduleEnabled)) {
            onBlocked?.('module', column.moduleEnabled); return true;
        }
        return false;
    };

    const handleCheckboxChange = (column: Column, rowKey: string, checked: boolean) => {
        if (makeBlockChecker(column)()) return;
        const current = Array.isArray(setting[column.key]) ? (setting[column.key] as string[]) : [];
        onChange(column.key, checked ? [...current, rowKey] : current.filter((k) => k !== rowKey));
    };

    // ── Flat rows ─────────────────────────────────────────────────────────────

    const renderFlatRows = (flatRows: Row[]) =>
        flatRows.map((row) => {
            // Row-level active state — derived from setting, no local state needed.
            const isRowActive = row.enabledKey
                ? (setting[row.enabledKey] as string[] | undefined)?.includes(row.key) ?? false
                : true;

            const handleRowToggle = (checked: boolean) => {
                const current = (setting[row.enabledKey!] as string[]) ?? [];
                onChange(row.enabledKey!, checked
                    ? [...current, row.key]
                    : current.filter((k) => k !== row.key));
            };

            return (
                <tr key={row.key} className={row.enabledKey && !isRowActive ? 'row-disabled' : ''}>
                    {/* Label cell — shows a toggle checkbox when enabledKey is set */}
                    <td>
                        {row.enabledKey ? (
                            <>
                                <TableCheckbox
                                    checked={isRowActive}
                                    onChange={handleRowToggle}
                                />
                                <span>{row.label}</span>
                            </>
                        ) : (
                            row.label
                        )}
                    </td>

                    {columns.map((column) => {
                        // Description column
                        if (column.type === 'description') {
                            return <td key={`desc_${row.key}`}>{row.description || '—'}</td>;
                        }

                        // Select cell
                        if (row.options?.length) {
                            const cellKey = `${column.key}_${row.key}`;
                            const rawVal = setting[cellKey];
                            const cellValue: Option[] = Array.isArray(rawVal)
                                ? (rawVal as any[]).filter((v) => v && typeof v === 'object' && 'value' in v)
                                : [];

                            return (
                                <td key={`${column.key}_${row.key}`}>
                                    <TableCellSelect
                                        settingKey={cellKey}
                                        rowLabel={row.label}
                                        rowOptions={row.options}
                                        currentValue={cellValue}
                                        onChange={onChange}
                                        isBlocked={makeBlockChecker(column)}
                                        disabled={!isRowActive}
                                    />
                                </td>
                            );
                        }

                        // Checkbox cell
                        const isChecked =
                            Array.isArray(setting[column.key]) &&
                            (setting[column.key] as string[]).includes(row.key);

                        return (
                            <td key={`${column.key}_${row.key}`}>
                                <TableCheckbox
                                    checked={isChecked}
                                    disabled={!isRowActive}
                                    onChange={(checked) => handleCheckboxChange(column, row.key, checked)}
                                />
                            </td>
                        );
                    })}
                </tr>
            );
        });

    // ── Grouped rows ──────────────────────────────────────────────────────────

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
                            <i className={`adminfont-${isOpen ? 'keyboard-arrow-down' : 'pagination-right-arrow'}`} />
                        </div>
                    </div>

                    {isOpen && Object.entries(group.capability).map(([capKey, capLabel]) => {
                        const hasExists =
                            storeTabSetting &&
                            Object.values(storeTabSetting).some((arr) => arr?.includes(capKey));

                        return (
                            <tr key={capKey}>
                                <td>{capLabel}</td>
                                {columns.map((column) => {
                                    const isChecked =
                                        Array.isArray(setting[column.key]) &&
                                        (setting[column.key] as string[]).includes(capKey);

                                    return (
                                        <td key={`${column.key}_${capKey}`}>
                                            <TableCheckbox
                                                checked={isChecked}
                                                disabled={!hasExists}
                                                onChange={(checked) => handleCheckboxChange(column, capKey, checked)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </React.Fragment>
            );
        });
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <table className="grid-table">
                <thead>
                    <tr>
                        <th />
                        {columns.map((column) => (
                            <th key={column.key}>
                                {column.label}
                                {column?.proSetting && !khali_dabba && (
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
//
// `value`    — FieldSetting object keyed by sub-setting keys (e.g. "catalog_exclusion_userroles_list").
//              Falls back to `settings` (global store) when not yet field-scoped.
// `onChange` — called with the full merged FieldSetting so no sub-key is lost.

const MultiCheckboxTable: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer, modules, settings, onBlocked, storeTabSetting }) => {
        const currentSetting: FieldSetting =
            value && typeof value === 'object' && !Array.isArray(value)
                ? (value as FieldSetting)
                : (settings as FieldSetting) ?? {};

        const handleChange = (subKey: string, subVal: string[] | Option[]) => {
            if (!canAccess) return;
            onChange({ ...currentSetting, [subKey]: subVal });
        };

        return (
            <MultiCheckboxTableUI
                khali_dabba={appLocalizer?.khali_dabba ?? false}
                rows={field.rows ?? []}
                columns={field.columns ?? []}
                setting={currentSetting}
                storeTabSetting={storeTabSetting ?? {}}
                modules={modules ?? []}
                onBlocked={onBlocked}
                onChange={handleChange}
            />
        );
    },

    validate: () => null,
};

export default MultiCheckboxTable;