// External dependencies
import React, { useState } from 'react';

// Internal dependencies
import '../styles/web/MultiCheckboxTable.scss';
import { FieldComponent } from './types';
import { SelectInputUI } from './SelectInput';
import { PopupUI } from './Popup';
import { BasicInputUI } from './BasicInput';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
    value: string | number;
    label: string;
}

export interface ShiftTimeValue {
    start: string;
    end: string;
}

const DEFAULT_SHIFT_TIME: ShiftTimeValue = { start: '', end: '' };

interface Column {
    key: string;
    label: string;
    type?: 'checkbox' | 'description' | 'shift';
    moduleEnabled?: string;
    proSetting?: string;
    /** Hidden until splitShiftToggle is ON */
    isSplitShift?: boolean;
    /** Hidden until lunchBreakToggle is ON */
    isLunchBreak?: boolean;
}

/**
 * Config for any inline pill toggle rendered above the table.
 * key           → setting key (boolean)
 * label         → display text
 * icon          → adminfont icon suffix
 * hidesTable    → when this toggle is OFF, the table body is hidden
 * disablesShifts → when this toggle is ON, all shift cells are disabled
 */
interface InlineToggleConfig {
    key: string;
    label: string;
    icon?: string;
    hidesTable?: boolean;
    disablesShifts?: boolean;
}

interface Row {
    key: string;
    label: string;
    description?: string;
    options?: Option[];
    enabledKey?: string;
}

interface CapabilityGroup {
    label: string;
    desc: string;
    capability: Record<string, string>;
}

type GroupedRows = Record<string, CapabilityGroup>;

type FieldSetting = Record<string, string[] | Option[] | ShiftTimeValue | boolean>;

interface MultiCheckboxTableUIProps {
    rows: Row[] | GroupedRows;
    columns: Column[];
    onChange: (subKey: string, value: string[] | Option[] | ShiftTimeValue | boolean) => void;
    setting: FieldSetting;
    proSetting?: boolean;
    modules: string[];
    storeTabSetting: Record<string, string[]>;
    khali_dabba: boolean;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
    /**
     * Rendered as the top row of pill toggles (e.g. Enable Store Time, 24/7).
     * These are independent — no mutual exclusion between them.
     */
    headerToggles?: InlineToggleConfig[];
    /**
     * Split Shift toggle — shows columns marked `isSplitShift: true`.
     * Mutually exclusive with lunchBreakToggle.
     */
    splitShiftToggle?: InlineToggleConfig;
    /**
     * Lunch Break toggle — shows columns marked `isLunchBreak: true`.
     * Mutually exclusive with splitShiftToggle.
     */
    lunchBreakToggle?: InlineToggleConfig;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeShiftTime = (raw: unknown): ShiftTimeValue => {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const r = raw as Partial<ShiftTimeValue>;
        return {
            start: typeof r.start === 'string' ? r.start : '',
            end:   typeof r.end   === 'string' ? r.end   : '',
        };
    }
    return { ...DEFAULT_SHIFT_TIME };
};

// ─── TableCheckbox ────────────────────────────────────────────────────────────

interface TableCheckboxProps {
    id: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}

const TableCheckbox: React.FC<TableCheckboxProps> = ({ id, checked, disabled = false, onChange }) => (
    <div className="default-checkbox table-checkbox">
        <input
            type="checkbox"
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
        />
        <label htmlFor={id} className="checkbox-label" />
    </div>
);

// ─── InlineToggleBar ──────────────────────────────────────────────────────────
// Pill-style toggle rendered above the table.

interface InlineToggleBarProps {
    config: InlineToggleConfig;
    enabled: boolean;
    disabled?: boolean;
    onChange: (val: boolean) => void;
}

const InlineToggleBar: React.FC<InlineToggleBarProps> = ({ config, enabled, disabled = false, onChange }) => (
    <div className={`inline-toggle-bar${enabled ? ' inline-toggle-bar--active' : ''}${disabled ? ' inline-toggle-bar--disabled' : ''}`}>
        {config.icon && <i className={`adminfont-${config.icon}`} />}
        <span className="inline-toggle-bar__label">{config.label}</span>
        <div className="toggle-checkbox inline-toggle-bar__toggle">
            <input
                type="checkbox"
                id={`inline-toggle-${config.key}`}
                checked={enabled}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <label htmlFor={`inline-toggle-${config.key}`} className="checkbox-label" />
        </div>
    </div>
);

// ─── TableCellSelect ──────────────────────────────────────────────────────────

interface TableCellSelectProps {
    settingKey: string;
    rowLabel: string;
    rowOptions: Option[];
    currentValue: Option[];
    onChange: (key: string, value: Option[]) => void;
    isBlocked: () => boolean;
    disabled?: boolean;
}

const TableCellSelect: React.FC<TableCellSelectProps> = ({
    settingKey, rowLabel, rowOptions, currentValue, onChange, isBlocked, disabled = false,
}) => {
    const [popupOpen, setPopupOpen] = useState(false);

    const optionStrings   = rowOptions.map((o) => ({ value: String(o.value), label: o.label }));
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
            <SelectInputUI
                {...sharedSelectProps}
                maxVisibleItems={2}
                onOverflowClick={() => setPopupOpen(true)}
            />
            <PopupUI
                position="lightbox"
                open={popupOpen}
                onClose={() => setPopupOpen(false)}
                showBackdrop
                width={28}
                header={{ title: rowLabel, showCloseButton: true }}
            >
                <SelectInputUI {...sharedSelectProps} />
            </PopupUI>
        </>
    );
};

// ─── TableCellShift ───────────────────────────────────────────────────────────

interface TableCellShiftProps {
    settingKey: string;
    value: ShiftTimeValue;
    onChange: (key: string, value: ShiftTimeValue) => void;
    isBlocked: () => boolean;
    disabled?: boolean;
}

const TableCellShift: React.FC<TableCellShiftProps> = ({
    settingKey, value, onChange, isBlocked, disabled = false,
}) => {
    const handleChange = (field: keyof ShiftTimeValue, newVal: string) => {
        if (isBlocked() || disabled) return;
        onChange(settingKey, { ...value, [field]: newVal });
    };

    return (
        <div className={`shift-time-cell${disabled ? ' shift-time-cell--disabled' : ''}`}>
            <BasicInputUI
                type="time"
                value={value.start}
                disabled={disabled}
                onChange={(v) => handleChange('start', v)}
            />
            <span className="shift-time-cell__sep">–</span>
            <BasicInputUI
                type="time"
                value={value.end}
                disabled={disabled}
                onChange={(v) => handleChange('end', v)}
            />
        </div>
    );
};

// ─── MultiCheckboxTableUI ─────────────────────────────────────────────────────

export const MultiCheckboxTableUI: React.FC<MultiCheckboxTableUIProps> = ({
    rows,
    columns,
    onChange,
    setting,
    storeTabSetting,
    proSetting,
    modules,
    onBlocked,
    khali_dabba,
    headerToggles,
    splitShiftToggle,
    lunchBreakToggle,
}) => {
    const [openGroup, setOpenGroup] = useState<string | null>(() => {
        if (!Array.isArray(rows) && rows && Object.keys(rows).length > 0) {
            return Object.keys(rows)[0];
        }
        return null;
    });

    // ── Read all toggle states from persisted setting ──────────────────────────

    const splitShiftEnabled  = splitShiftToggle  ? Boolean(setting[splitShiftToggle.key])  : false;
    const lunchBreakEnabled  = lunchBreakToggle  ? Boolean(setting[lunchBreakToggle.key])  : false;

    // headerToggles — check if any have hidesTable or disablesShifts flags active
    const tableHidden   = headerToggles?.some((t) => t.hidesTable    && !Boolean(setting[t.key])) ?? false;
    const shiftsDisabled = headerToggles?.some((t) => t.disablesShifts && Boolean(setting[t.key])) ?? false;

    // ── Mutual exclusion: turning one ON turns the other OFF ──────────────────

    const handleSplitShiftChange = (val: boolean) => {
        onChange(splitShiftToggle!.key, val);
        if (val && lunchBreakToggle && lunchBreakEnabled) onChange(lunchBreakToggle.key, false);
    };

    const handleLunchBreakChange = (val: boolean) => {
        onChange(lunchBreakToggle!.key, val);
        if (val && splitShiftToggle && splitShiftEnabled) onChange(splitShiftToggle.key, false);
    };

    // ── Visible columns ───────────────────────────────────────────────────────

    const visibleColumns = columns.filter((col) => {
        if (col.isSplitShift) return splitShiftEnabled;
        if (col.isLunchBreak) return lunchBreakEnabled;
        return true;
    });

    // ── Block checker ─────────────────────────────────────────────────────────

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

    // ── Cell renderer ─────────────────────────────────────────────────────────

    const renderCell = (
        column: Column,
        rowKey: string,
        rowLabel: string,
        rowOptions: Option[] | undefined,
        isRowActive: boolean,
    ) => {
        const isBlocked = makeBlockChecker(column);

        if (column.type === 'description') {
            const row = Array.isArray(rows) ? (rows as Row[]).find((r) => r.key === rowKey) : undefined;
            return <td key={`desc_${rowKey}`}>{row?.description || '—'}</td>;
        }

        if (column.type === 'shift') {
            const cellKey = `${column.key}_${rowKey}`;
            return (
                <td key={cellKey} className="shift-td">
                    <TableCellShift
                        settingKey={cellKey}
                        value={normalizeShiftTime(setting[cellKey])}
                        onChange={(key, val) => { if (!isBlocked()) onChange(key, val); }}
                        isBlocked={isBlocked}
                        disabled={!isRowActive || shiftsDisabled}
                    />
                </td>
            );
        }

        if (rowOptions?.length) {
            const cellKey  = `${column.key}_${rowKey}`;
            const rawVal   = setting[cellKey];
            const cellValue: Option[] = Array.isArray(rawVal)
                ? (rawVal as any[]).filter((v) => v && typeof v === 'object' && 'value' in v)
                : [];
            return (
                <td key={cellKey}>
                    <TableCellSelect
                        settingKey={cellKey}
                        rowLabel={rowLabel}
                        rowOptions={rowOptions}
                        currentValue={cellValue}
                        onChange={onChange}
                        isBlocked={isBlocked}
                        disabled={!isRowActive}
                    />
                </td>
            );
        }

        const isChecked =
            Array.isArray(setting[column.key]) &&
            (setting[column.key] as string[]).includes(rowKey);

        return (
            <td key={`${column.key}_${rowKey}`}>
                <TableCheckbox
                    id={`chk_${column.key}_${rowKey}`}
                    checked={isChecked}
                    disabled={!isRowActive}
                    onChange={(checked) => handleCheckboxChange(column, rowKey, checked)}
                />
            </td>
        );
    };

    // ── Flat rows ─────────────────────────────────────────────────────────────

    const renderFlatRows = (flatRows: Row[]) =>
        flatRows.map((row) => {
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
                    <td>
                        {row.enabledKey ? (
                            <div className="row-label-toggle">
                                <TableCheckbox
                                    id={`row-toggle_${row.key}`}
                                    checked={isRowActive}
                                    onChange={handleRowToggle}
                                />
                                <span>{row.label}</span>
                            </div>
                        ) : (
                            row.label
                        )}
                    </td>
                    {visibleColumns.map((col) =>
                        renderCell(col, row.key, row.label, row.options, isRowActive)
                    )}
                </tr>
            );
        });

    // ── Grouped rows ──────────────────────────────────────────────────────────

    const renderGroupedRows = (groupedRows: GroupedRows) => {
        const totalCols = visibleColumns.length + 1;
        return Object.entries(groupedRows).map(([groupKey, group]) => {
            const isOpen = openGroup === groupKey;
            return (
                <React.Fragment key={groupKey}>
                    <tr className="toggle-header-row">
                        <td colSpan={totalCols}>
                            <div className="toggle-header" onClick={() => setOpenGroup(isOpen ? null : groupKey)}>
                                <div className="header-title">
                                    {group.label}
                                    <i className={`adminfont-${isOpen ? 'keyboard-arrow-down' : 'pagination-right-arrow'}`} />
                                </div>
                            </div>
                        </td>
                    </tr>
                    {isOpen && Object.entries(group.capability).map(([capKey, capLabel]) => {
                        const hasExists = storeTabSetting &&
                            Object.values(storeTabSetting).some((arr) => arr?.includes(capKey));
                        return (
                            <tr key={capKey}>
                                <td>{capLabel}</td>
                                {visibleColumns.map((col) =>
                                    renderCell(col, capKey, capLabel, undefined, hasExists)
                                )}
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
            {proSetting && (
                <span className="admin-pro-tag">
                    <i className="adminfont-pro-tag" /> Pro
                </span>
            )}

            {/* Row 1: header toggles (Enable Store Time, 24/7 Operation) */}
            {headerToggles && headerToggles.length > 0 && (
                <div className="inline-toggle-bar-row">
                    {headerToggles.map((t) => (
                        <InlineToggleBar
                            key={t.key}
                            config={t}
                            enabled={Boolean(setting[t.key])}
                            onChange={(val) => onChange(t.key, val)}
                        />
                    ))}
                </div>
            )}

            {/* Row 2: column toggles (Lunch Break, Split Shift) — only when table is visible */}
            {!tableHidden && (splitShiftToggle || lunchBreakToggle) && (
                <div className="inline-toggle-bar-row">
                    {lunchBreakToggle && (
                        <InlineToggleBar
                            config={lunchBreakToggle}
                            enabled={lunchBreakEnabled}
                            disabled={splitShiftEnabled}
                            onChange={handleLunchBreakChange}
                        />
                    )}
                    {splitShiftToggle && (
                        <InlineToggleBar
                            config={splitShiftToggle}
                            enabled={splitShiftEnabled}
                            disabled={lunchBreakEnabled}
                            onChange={handleSplitShiftChange}
                        />
                    )}
                </div>
            )}

            {/* Table — hidden when hidesTable toggle is OFF */}
            {!tableHidden && (
                <table className="grid-table">
                    <thead>
                        <tr>
                            <th />
                            {visibleColumns.map((column) => (
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
            )}
        </>
    );
};

// ─── FieldComponent wrapper ───────────────────────────────────────────────────

const MultiCheckboxTable: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer, modules, settings, onBlocked, storeTabSetting }) => {
        const currentSetting: FieldSetting =
            value && typeof value === 'object' && !Array.isArray(value)
                ? (value as FieldSetting)
                : (settings as FieldSetting) ?? {};

        const handleChange = (subKey: string, subVal: string[] | Option[] | ShiftTimeValue | boolean) => {
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
                proSetting={field.proSetting ?? false}
                modules={modules ?? []}
                onBlocked={onBlocked}
                onChange={handleChange}
                headerToggles={field.headerToggles}
                splitShiftToggle={field.splitShiftToggle}
                lunchBreakToggle={field.lunchBreakToggle}
            />
        );
    },

    validate: () => null,
};

export default MultiCheckboxTable;