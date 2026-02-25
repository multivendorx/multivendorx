// External dependencies
import React, { useState } from 'react';
import Modal from 'react-modal';

// Internal dependencies
import '../styles/web/MultiCheckboxTable.scss';
import { FieldComponent } from './types';
import  { SelectInputUI, SelectOptions } from './SelectInput'; // Reuse existing Select
import {MultiCheckBoxUI} from './MultiCheckbox'; // Reuse existing MultiCheckbox

// Types
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
    options?: { value: string | number; label: string }[];
}

interface CapabilityGroup {
    label: string;
    desc: string;
    capability: Record<string, string>;
}

type Rows = Record<string, CapabilityGroup>;

interface MultiCheckboxTableProps {
    rows: Row[] | Rows;
    columns: Column[];
    onChange: (key: string, value: string[] | SelectOptions[]) => void;
    setting: Record<string, string[] | SelectOptions[]>;
    proSetting?: boolean;
    modules: string[];
    storeTabSetting: Record<string, string[]>;
    khali_dabba: boolean;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}

// Wrapper component to adapt SelectInput for our needs
const TableSelect: React.FC<{
    value?: SelectOptions[];
    onChange: (value: SelectOptions[]) => void;
    options: { value: string | number; label: string }[];
}> = ({ value = [], onChange, options }) => {
    const formatOptions = (opts: typeof options): SelectOptions[] => 
        opts.map(opt => ({ value: String(opt.value), label: opt.label }));

    return (
        <SelectInputUI
            type="multi-select"
            options={formatOptions(options)}
            value={value.map(v => v.value)}
            onChange={(newValue) => {
                if (Array.isArray(newValue)) {
                    onChange(newValue as SelectOptions[]);
                }
            }}
            wrapperClass="table-select"
            size="100%"
        />
    );
};

// Wrapper component to adapt MultiCheckBox for table cells
const TableCheckbox: React.FC<{
    column: Column;
    rowKey: string;
    isSelected: boolean;
    onToggle: (checked: boolean) => void;
    disabled?: boolean;
}> = ({ column, rowKey, isSelected, onToggle, disabled }) => {
    const field = {
        type: 'checkbox',
        key: `${column.key}_${rowKey}`,
        options: [{ value: rowKey, label: '' }],
        proSetting: column.proSetting,
        moduleEnabled: column.moduleEnabled,
    };

    return (
        <MultiCheckBoxUI
            field={field}
            value={isSelected ? [rowKey] : []}
            onChange={(val) => onToggle(val.length > 0)}
            modules={[]}
            canAccess={!disabled}
            appLocalizer={{ khali_dabba: false }}
            onBlocked={() => {}}
        />
    );
};

const MultiCheckboxTableUI: React.FC<MultiCheckboxTableProps> = ({
    rows,
    columns,
    onChange,
    setting,
    storeTabSetting,
    proSetting,
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

    const isValueSelected = (columnKey: string, rowKey: string): boolean => {
        const columnValue = setting[columnKey];
        return Array.isArray(columnValue) && columnValue.includes(rowKey);
    };

    const handleCheckboxChange = (
        column: Column,
        rowKey: string,
        checked: boolean
    ) => {
        // Check access restrictions
        if (column.proSetting && !khali_dabba) {
            onBlocked?.('pro');
            return;
        }

        if (column.moduleEnabled && !modules.includes(column.moduleEnabled)) {
            onBlocked?.('module', column.moduleEnabled);
            return;
        }

        const selectedKeys = Array.isArray(setting[column.key])
            ? (setting[column.key] as string[])
            : [];

        const updatedSelection = checked
            ? [...selectedKeys, rowKey]
            : selectedKeys.filter((key) => key !== rowKey);

        onChange(column.key, updatedSelection);
    };

    const handleSelectChange = (cellKey: string, newValue: SelectOptions[]) => {
        onChange(cellKey, newValue);
    };

    const renderProTag = (text?: string) => (
        <span className="admin-pro-tag">
            <i className="adminfont-pro-tag"></i>
            {text || 'Pro'}
        </span>
    );

    const renderTableHeader = () => (
        <thead>
            <tr>
                <th></th>
                {columns.map((column) => (
                    <th key={column.key}>
                        {column.label}
                        {column?.proSetting && !khali_dabba && renderProTag()}
                    </th>
                ))}
            </tr>
        </thead>
    );

    const renderRowCells = (row: Row) => (
        <>
            <td>{row.label}</td>
            {columns.map((column) => {
                if (column.type === 'description') {
                    return <td key={`desc_${row.key}`}>{row.description || '—'}</td>;
                }

                const cellKey = `${column.key}_${row.key}`;
                const cellValue = (setting[cellKey] as SelectOptions[]) || [];

                return (
                    <td key={cellKey}>
                        {row.options ? (
                            <TableSelect
                                value={cellValue}
                                onChange={(newValue) => handleSelectChange(cellKey, newValue)}
                                options={row.options}
                            />
                        ) : (
                            <TableCheckbox
                                column={column}
                                rowKey={row.key}
                                isSelected={isValueSelected(column.key, row.key)}
                                onToggle={(checked) => handleCheckboxChange(column, row.key, checked)}
                            />
                        )}
                    </td>
                );
            })}
        </>
    );

    const renderGroupedRows = () => {
        const groupedRows = rows as Rows;
        
        return Object.entries(groupedRows).map(([groupKey, group]) => {
            const isOpen = openGroup === groupKey;
            
            return (
                <React.Fragment key={groupKey}>
                    <tr className="group-header">
                        <td colSpan={columns.length + 1}>
                            <div
                                className="toggle-header"
                                onClick={() => setOpenGroup(isOpen ? null : groupKey)}
                            >
                                <span className="header-title">
                                    {group.label}
                                    <i className={`adminfont-${isOpen ? 'keyboard-arrow-down' : 'pagination-right-arrow'}`}></i>
                                </span>
                            </div>
                        </td>
                    </tr>

                    {isOpen && Object.entries(group.capability).map(([capKey, capLabel]) => {
                        const hasCapability = storeTabSetting &&
                            Object.values(storeTabSetting).some(arr => arr?.includes(capKey));

                        return (
                            <tr key={capKey}>
                                <td>{capLabel}</td>
                                {columns.map((column) => (
                                    <td key={`${column.key}_${capKey}`}>
                                        <TableCheckbox
                                            column={column}
                                            rowKey={capKey}
                                            isSelected={isValueSelected(column.key, capKey)}
                                            onToggle={(checked) => handleCheckboxChange(column, capKey, checked)}
                                            disabled={!hasCapability}
                                        />
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </React.Fragment>
            );
        });
    };

    return (
        <>
            {proSetting && renderProTag()}
            <table className="grid-table">
                {renderTableHeader()}
                <tbody>
                    {Array.isArray(rows)
                        ? rows.map((row) => <tr key={row.key}>{renderRowCells(row)}</tr>)
                        : renderGroupedRows()}
                </tbody>
            </table>
        </>
    );
};

const MultiCheckboxTable: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer, modules, settings, onBlocked, storeTabSetting }) => (
        <MultiCheckboxTableUI
            khali_dabba={appLocalizer?.khali_dabba ?? false}
            rows={field.rows ?? []}
            columns={field.columns ?? []}
            setting={settings}
            storeTabSetting={storeTabSetting}
            proSetting={field.proSetting ?? false}
            modules={modules}
            onBlocked={onBlocked}
            onChange={(key, val) => {
                if (!canAccess) return;
                onChange({ [key]: val });
            }}
        />
    ),
    validate: () => null,
};

export default MultiCheckboxTable;