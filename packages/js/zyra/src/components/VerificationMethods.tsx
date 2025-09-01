import React, { useState, useEffect, useRef } from 'react';

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
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [validationMsg, setValidationMsg] = useState<string>("");

  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRows(value.length ? value : []);
  }, [value]);

  useEffect(() => {
    if (editingIndex === null) setForm({});
    else setForm(rows[editingIndex] || {});
  }, [editingIndex, rows]);

  // 🔹 Outside click handler to close edit form
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editingIndex !== null && formRef.current && !formRef.current.contains(e.target as Node)) {
        cancelEdit();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingIndex]);

  const handleFieldChange = (key: string, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setValidationMsg("");
  };

  const startAdd = () => {
    if (rows.length > 0 && !rows[rows.length - 1].label?.trim()) {
      setValidationMsg("⚠️ Please fill the label for the last row before adding a new one");
      return;
    }

    setRows((prev) => [...prev, {}]);
    setEditingIndex(rows.length);
    setForm({});
    setValidationMsg("");
  };

  const saveRow = (index: number) => {
    if (!form.label || !form.label.trim()) {
      setValidationMsg("⚠️ Label is required");
      return;
    }

    const newRows = [...rows];
    newRows[index] = { ...newRows[index], label: form.label };
    setRows(newRows);
    onChange(newRows);
    setEditingIndex(null);
    setForm({});
    setValidationMsg("");
  };

  const cancelEdit = () => {
    if (editingIndex !== null) {
      // if it's a new row and has no label, remove it instead of saving
      if (!rows[editingIndex]?.label?.trim()) {
        const newRows = rows.filter((_, i) => i !== editingIndex);
        setRows(newRows);
        onChange(newRows);
      }
    }
    setEditingIndex(null);
    setForm({});
    setValidationMsg("");
  };


  const deleteRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    onChange(newRows);
    if (editingIndex === index) cancelEdit();
    if (openDropdownIndex === index) setOpenDropdownIndex(null);
    setValidationMsg("");
  };

  const toggleActive = (index: number) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], active: !newRows[index].active };
    setRows(newRows);
    onChange(newRows);
  };

  const toggleRequired = (index: number) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], required: !newRows[index].required };
    setRows(newRows);
    onChange(newRows);
  };

  return (
    <div className="fileds-wrapper">
      {label && <h4>{label}</h4>}



      <ul className="fileds">
        {rows.map((row, idx) => (
          <li key={idx} className="row-item" style={{ opacity: row.active ? 0.3 : 1 }}>
            <div className="name">
              {editingIndex === idx ? (
                <div className="edit-row" ref={formRef}>
                  <div className="edit-form">
                    <label>Label</label>
                    <input
                      type="text"
                      placeholder="Enter label"
                      value={form.label || ''}
                      onChange={(e) => handleFieldChange('label', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveRow(idx);
                        }
                      }}
                    />
                  </div>
                  <div className="button-wrapper">
                    <button type="button" onClick={() => saveRow(idx)}>
                      <i className="adminlib-check"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>{row.label}</div>
                  <span className={row.required ? "" : "admin-badge red"}>{row.required ? 'Not Required' : 'Required'}</span>
                </>
              )}
            </div>

            <div className="action-section">
              <div className="action-icons">
                <i
                  className="adminlib-more-vertical"
                  onClick={() =>
                    setOpenDropdownIndex(openDropdownIndex === idx ? null : idx)
                  }
                ></i>

                <div className={`action-dropdown ${openDropdownIndex === idx ? 'show' : ''}`}>
                  <ul>
                    {editingIndex !== idx && (
                      <>
                        <li onClick={() => setEditingIndex(idx)}>
                          <i className="adminlib-create"></i>Edit
                        </li>
                        <li onClick={() => toggleRequired(idx)}>
                          <i className="adminlib-delete"></i>
                          {row.required ? 'Required' : 'Not Required'}
                        </li>
                        <li onClick={() => toggleActive(idx)}>
                          <i className={row.active ? "adminlib-eye" : "adminlib-eye-blocked"}></i>
                          {row.active ? "Inactive" : "Active"}
                        </li>
                        <li onClick={() => deleteRow(idx)}>
                          <i className="adminlib-delete"></i>Delete
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {editingIndex === null && (
        <button type="button" className="admin-btn btn-green" onClick={startAdd}>
          {addButtonLabel}
        </button>
      )}


      {validationMsg && (
        <p className="validation-msg" style={{ color: "red", marginTop: "8px" }}>
          {validationMsg}
        </p>
      )}
    </div>
  );
};

export default VerificationMethods;
