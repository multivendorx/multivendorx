import { TableRow } from './types';

type EditType = 'toggle' | 'select' | 'text';

type SelectOption = {
    label: string;
    value: string | number;
};

type TableHeader = {
    editType?: EditType;
    options?: SelectOption[];
};

type Props = {
    header: TableHeader;
    cell: TableRow;
    isEditing: boolean;
    onSave: (value: string | number | boolean) => void;
};

export const renderEditableCell : React.FC<Props> = ({
    header,
    cell,
    isEditing,
    onSave,
}) => {
    const value = cell.value;

    if (!isEditing) {
        return <>{cell.display ?? value}</>;
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
                    {header.options?.map((opt) => (
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
