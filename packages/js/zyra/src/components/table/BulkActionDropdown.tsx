import React, { useState } from 'react';

export type BulkAction = {
	label: string;
	value: string;
};

interface BulkActionDropdownProps {
	actions: BulkAction[];
	selectedIds: number[];
	onApply: (action: string) => void;
}

const BulkActionDropdown: React.FC<BulkActionDropdownProps> = ({
	actions,
	selectedIds,
	onApply,
}) => {
	const [selectedAction, setSelectedAction] = useState('');

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const action = e.target.value;
		setSelectedAction('');
		onApply(action);
	};

	return (
		<div className="bulk-action-dropdown">
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
			<span style={{ marginLeft: 8 }}>
				{selectedIds.length} selected
			</span>
		</div>
	);
};

export default BulkActionDropdown;
