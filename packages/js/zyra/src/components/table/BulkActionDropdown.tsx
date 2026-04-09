import React from 'react';
import { ButtonInputUI } from '../ButtonInput';
import { SelectInputUI } from '../SelectInput';

export type BulkAction = {
    label: string;
    value: string;
};

interface BulkActionDropdownProps {
    actions?: BulkAction[]; // optional now
    selectedIds: number[];
    totalIds: number[];
    onApply?: (action: string) => void; // optional
    onClearSelection: () => void;
    onSelectCsvDownloadApply?: (selectedIds: number[]) => void;
    onToggleSelectAll: (select: boolean) => void;
    showDropdown?: boolean; // new prop to control dropdown visibility
}

const BulkActionDropdown: React.FC<BulkActionDropdownProps> = ({
    actions = [],
    selectedIds,
    onApply,
    onClearSelection,
    onSelectCsvDownloadApply,
    onToggleSelectAll,
    totalIds,
    showDropdown = true,
}) => {
    const allSelected =
        totalIds.length > 0 && selectedIds.length === totalIds.length;

    return (
        <div className="table-filter-wrapper">
            <div className="table-filter bulk">
                {/* Selected rows count + clear */}
                <span className="action-item count">
                    {selectedIds.length} Rows selected
                    <i onClick={onClearSelection} className="adminfont-close" />
                </span>

                <div className="action-item">
                    <div
                        className="admin-btn"
                        onClick={() => onToggleSelectAll(!allSelected)}
                    >
                        {' '}
                        {allSelected ? 'Deselect All' : 'Select All'}
                    </div>
                </div>
                {/* Conditional Bulk Actions Dropdown */}
                {showDropdown && actions.length > 0 && onApply && (
                   <div className="group-field">
                        <SelectInputUI
                            options={actions}
                            value={''}
                            placeholder="Bulk Actions"
                            disabled={selectedIds.length === 0}
                            onChange={(value) => {
                                if (value) {
                                    onApply(String(value));
                                }
                            }}
                        />
                    </div>
                )}

                {/* Conditional CSV button */}
                {onSelectCsvDownloadApply && (
                    <ButtonInputUI
                        buttons={{
                            text: 'CSV',
                            icon: 'download',
                            disabled: selectedIds.length === 0,
                            onClick: () =>
                                onSelectCsvDownloadApply(selectedIds),
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default BulkActionDropdown;
