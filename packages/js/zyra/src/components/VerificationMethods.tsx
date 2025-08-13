import React, { useState, useEffect } from 'react';

interface VerificationField {
  key: string;
  type: 'text' | 'checkbox' | 'number' | 'select';
  label: string;
  placeholder?: string;
}

interface VerificationMethodsProps {
  label?: string;
  addButtonLabel?: string;
  deleteButtonLabel?: string;
  value?: Array<Record<string, any>>;
  nestedFields: VerificationField[];
  onChange: (value: Array<Record<string, any>>) => void;
}

const VerificationMethods: React.FC<VerificationMethodsProps> = ({
  label,
  addButtonLabel = 'Add',
  deleteButtonLabel = 'Remove',
  value = [],
  nestedFields,
  onChange,
}) => {
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    setRows(value.length ? value : []);
  }, [value]);

  useEffect(() => {
    if (editingIndex === null) setForm({});
    else setForm(rows[editingIndex] || {});
  }, [editingIndex, rows]);

  const handleFieldChange = (key: string, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const startAdd = () => {
    setEditingIndex(rows.length);
    setForm({});
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setForm({});
  };

  const saveRow = () => {
    if (!form.label || !form.label.trim()) {
      alert('Label is required');
      return;
    }
    let newRows = [...rows];
    if (editingIndex !== null && editingIndex < rows.length) {
      newRows[editingIndex] = form;
    } else {
      newRows.push(form);
    }
    setRows(newRows);
    onChange(newRows);
    setEditingIndex(null);
    setForm({});
  };

  // Removed alert confirmation here
  const deleteRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    onChange(newRows);
    if (editingIndex === index) cancelEdit();
  };

  const toggleActive = (index: number) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], active: !newRows[index].active };
    setRows(newRows);
    onChange(newRows);
  };

  return (
    <div>
      {label && <h4>{label}</h4>}

      {editingIndex === null && (
        <button type="button" onClick={startAdd}>
          {addButtonLabel}
        </button>
      )}

      {editingIndex !== null && (
        <div>
          {nestedFields.map(({ key, type, label, placeholder }) => {
            if (type === 'checkbox') {
              return (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={!!form[key]}
                    onChange={(e) => handleFieldChange(key, e.target.checked)}
                  />
                  {label}
                </label>
              );
            }
            // default text input
            return (
              <div key={key}>
                <label>{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={form[key] || ''}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                />
              </div>
            );
          })}
          <button type="button" onClick={saveRow}>
            {editingIndex < rows.length ? 'Update' : 'Save'}
          </button>
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        </div>
      )}

      <ul>
        {rows.map((row, idx) => (
          <li
            key={idx}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <strong>{row.label}</strong>{' '}
            {row.required && <span>(Required)</span>}

            {/* Edit icon */}
            <button
              type="button"
              onClick={() => startEdit(idx)}
              aria-label="Edit"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ✏️
            </button>

            {/* Delete icon */}
            <button
              type="button"
              onClick={() => deleteRow(idx)}
              aria-label="Delete"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              🗑️
            </button>

            {/* Active checkbox at last */}
            <label style={{ marginLeft: 'auto' }}>
              <input
                type="checkbox"
                checked={!!row.active}
                onChange={() => toggleActive(idx)}
              />{' '}
              Active
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VerificationMethods;