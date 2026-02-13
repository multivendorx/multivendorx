import React from 'react';
import { AdminButtonUI } from '../AdminButton';
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
	const allSelected = totalIds.length > 0 && selectedIds.length === totalIds.length;

	return (
		<div className="wrap-bulk-all-date bulk">
			{/* Selected rows count + clear */}
			<span className="action-item count">
				{selectedIds.length} Rows selected
				<i onClick={onClearSelection} className="adminfont-close" />
			</span>

			<AdminButtonUI
				buttons={{
					text: allSelected ? 'Deselect All' : 'Select All',
					onClick: () => onToggleSelectAll(!allSelected),
				}}
			/>
			{/* Conditional Bulk Actions Dropdown */}
			{showDropdown && actions.length > 0 && onApply && (
				<div className="action">
					<SelectInputUI
						options={actions}
						value={""}
						placeholder="Bulk Actions"
						disabled={selectedIds.length === 0}
						onChange={(selected) => {
							if (selected?.value) {
								onApply(String(selected.value));
							}
						}}
					/>
				</div>
			)}

			{/* Conditional CSV button */}
			{onSelectCsvDownloadApply && (
				<AdminButtonUI
					buttons={{
						text: 'CSV',
						icon: 'download',
						disabled: selectedIds.length === 0,
						onClick: () => onSelectCsvDownloadApply(selectedIds),
					}}
				/>
			)}
		</div>
	);
};

export default BulkActionDropdown;
