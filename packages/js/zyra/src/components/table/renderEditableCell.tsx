import { useRef, useState } from "react";
import { BasicInputUI } from "../BasicInput";
import { MultiCheckBoxUI } from "../MultiCheckbox";
import { SelectInputUI } from "../SelectInput";
import { TableHeaderConfig, TableRow } from "./types";
import { useOutsideClick } from "../useOutsideClick";

type EditableCellProps = {
	header: TableHeaderConfig;
	row: TableRow;
	onSave: (value: any) => void;
};

export const EditableCell: React.FC<EditableCellProps> = ({
	header,
	row,
	onSave,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const wrapperRef = useRef<HTMLSpanElement | HTMLDivElement>(null);
	useOutsideClick(wrapperRef, () => setIsEditing(false));
	const value = row[header.key];

	const isToggle = header.editType === 'toggle';

	// Force toggle to always be editing
	const shouldEdit = isToggle ? true : isEditing;

	const handleSave = (newValue: any) => {
		onSave(newValue);
		if (!isToggle) {
			setIsEditing(false);
		}
	};

	const enableEdit =
		header.editType === 'select' ||
		header.editType === 'text';

	if (!shouldEdit) {
		return (
			<span
				className="editable-cell"
				onClick={() => {
					if (enableEdit) {
						setIsEditing(true);
					}
				}}
			>
				{value}
			</span>
		);
	}

	return (
		<div ref={wrapperRef}>
			{(() => {
				switch (header.editType) {
					case "toggle":
						return (
							<MultiCheckBoxUI
								wrapperClass="toggle-btn"
								inputInnerWrapperClass="toggle-checkbox"
								options={header.options}
								value={value ? [header.options?.[0]?.value] : []}
								onChange={(val) => handleSave(val.length > 0)}
							/>
						);

					case "select":
						return (
							<SelectInputUI
								value={value}
								size={20}
								options={header.options}
								onChange={handleSave}
							/>
						);

					default:
						return (
							<BasicInputUI
								type="text"
								value={value}
								onChange={handleSave}
							/>
						);
				}
			})()}
		</div>
	);
};