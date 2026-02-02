import React from 'react';
import { TableRow } from './types';

type Props = {
    header: any;
    cell: TableRow;
    isEditing: boolean;
    onSave: (value: any) => void;
};

export const renderEditableCell = ({
	header,
	cell,
	isEditing,
	onSave,
}: Props) => {
	const value = cell.value;

	if (!isEditing) {
		return (
			<>
				{cell.display ?? value}
			</>
		);
	}

	switch (header.editType) {
		case 'toggle':
			return (
				<input
					type="checkbox"
					defaultChecked={Boolean(value)}
					onChange={(e) => onSave(e.target.checked)}
					autoFocus
				/>
			);

		case 'select':
			return (
				<select
					defaultValue={String(value)}
					onBlur={(e) => onSave(e.target.value)}
					autoFocus
				>
					{header.options?.map((opt: any) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			);

		default:
			return (
				<input
					type="text"
					defaultValue={String(value ?? '')}
					onBlur={(e) => onSave(e.target.value)}
					autoFocus
				/>
			);
	}
};

