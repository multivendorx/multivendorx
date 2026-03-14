import { TableRow } from './types';

type Props = {
    header: {};
    row: TableRow;
    onSave: (key: string, row: TableRow, value: string|number|boolean) => void;
};

export const renderEditableCell = ({
    header,
    row,
    onSave,
}: Props) => {
    const value = row[header.key];

    const handleChange = (newValue: string|number|boolean) => {
        onSave(header.key, row, newValue);
    };

    switch (header.editType) {
        case 'toggle':
            return (
                <input
                    type="checkbox"
                    defaultChecked={Boolean(value)}
                    onChange={(e) => handleChange(e.target.checked)}
                    autoFocus
                />
            );

        case 'select':
            return (
                <select
                    defaultValue={String(value)}
                    onBlur={(e) => handleChange(e.target.value)}
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
                    onBlur={(e) => handleChange(e.target.value)}
                    autoFocus
                />
            );
    }
};