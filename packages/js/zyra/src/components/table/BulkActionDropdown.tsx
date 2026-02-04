import React from 'react';

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

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const action = e.target.value;
		onApply?.(action);
	};

	return (
		<div className="wrap-bulk-all-date bulk">
			{/* Selected rows count + clear */}
			<span className="action-item count">
				{selectedIds.length} Rows selected
				<i onClick={onClearSelection} className="adminfont-close" />
			</span>

			{/* Select/Deselect All */}
			<button
				type="button"
				className="link-btn"
				onClick={() => onToggleSelectAll(!allSelected)}
			>
				{allSelected ? 'Deselect All' : 'Select All'}
			</button>

			{/* Conditional Bulk Actions Dropdown */}
			{showDropdown && actions.length > 0 && onApply && (
				<div className="action">
					<i className="adminfont-form" />
					<select
						onChange={handleChange}
						value=""
						disabled={selectedIds.length === 0}
					>
						<option value="" disabled>
							Bulk Actions
						</option>
						{actions.map((action) => (
							<option key={action.value} value={action.value}>
								{action.label}
							</option>
						))}
					</select>
				</div>
			)}

			{/* Conditional CSV button */}
			{onSelectCsvDownloadApply && (
				<button
					className="admin-badge csv"
					disabled={selectedIds.length === 0}
					onClick={() => onSelectCsvDownloadApply(selectedIds)}
				>
					<i className="adminfont-download" /> CSV
				</button>
			)}
		</div>
	);
};

export default BulkActionDropdown;
