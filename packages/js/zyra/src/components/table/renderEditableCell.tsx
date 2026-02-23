import { BasicInputUI } from '../BasicInput';
import { MultiCheckBoxUI } from '../MultiCheckbox';
import { SelectInputUI } from '../SelectInput';
import { TableHeaderConfig, TableRow } from './types';

type Props = {
	header: TableHeaderConfig;
	row: TableRow;
	isEditing: boolean;
	onSave: (value: any) => void;
};

export const renderEditableCell = ({
	row = {},
	header = {},
	isEditing,
	onSave,
}: Props) => {
	const value = row[header.key];

	if (!isEditing) {
		return (
			<>
				{value}
			</>
		);
	}

	switch (header.editType) {
		case 'toggle':
			return (
				<MultiCheckBoxUI
					wrapperClass={'toggle-btn'}
					inputInnerWrapperClass={'toggle-checkbox'}
					options={header.options}
					value={[value]}
					onChange={onSave}
				/>
			);

		case 'select':
			return (
				<SelectInputUI
					value={value}
					size={8}
					options={header.options}
					onChange={onSave}
				/>
			);

		default:
			return (
				<BasicInputUI
					type="text"
					value={value}
					onChange={onSave}
				/>
			);
	}
};

