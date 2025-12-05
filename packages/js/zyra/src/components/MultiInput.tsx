/**
 * External dependencies
 */
import React, { useState, FocusEvent, KeyboardEvent, useEffect, useRef } from 'react';
import "../styles/web/MultiInputString.scss";

// Types
interface MultiStringItem {
  value: string;
  locked?: boolean;
  iconClass?: string;
  description?: string;
  required?: boolean;
  tag?: string;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
}

interface MultiStringProps {
  inputType: 'multi-string';
  values?: MultiStringItem[];
  placeholder?: string;
  wrapperClass?: string;
  inputClass?: string;
  buttonClass?: string;
  listClass?: string;
  itemClass?: string;
  iconOptions?: string[];
  onStringChange?: (e: { target: { name?: string; value: MultiStringItem[] } }) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

interface CommonProps {
  id?: string;
  name?: string;
  proSetting?: boolean;
  description?: string;
  descClass?: string;
  iconEnable?: boolean;
  descEnable?: boolean;
  requiredEnable?: boolean;
  maxItems?: number;
  allowDuplicates?: boolean;
  moduleEnabled?: boolean;
}

type MultiInputProps = MultiStringProps & CommonProps;

const MultiInput: React.FC<MultiInputProps> = (props) => {
  const {
    values = [],
    placeholder,
    wrapperClass,
    inputClass,
    listClass,
    itemClass,
    iconOptions = [],
    onStringChange,
    onFocus,
    onBlur,
    id,
    name,
    proSetting,
    moduleEnabled,
    iconEnable,
    descEnable = false,
    requiredEnable = false,
    description,
    descClass,
    maxItems,
    allowDuplicates = false,
  } = props;

  const [inputValue, setInputValue] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [requiredChecked, setRequiredChecked] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Add or Update Item ---
  const handleAddOrUpdate = (index?: number) => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const updatedValues = [...values];

    if (index !== undefined) {
      if (updatedValues[index].locked) return;
      updatedValues[index] = {
        ...updatedValues[index],
        value: trimmedValue,
        description: itemDescription,
        iconClass: selectedIcon || updatedValues[index].iconClass,
        required: requiredChecked,
      };
    } else if (editIndex !== null) {
      if (updatedValues[editIndex].locked) return;
      updatedValues[editIndex] = {
        ...updatedValues[editIndex],
        value: trimmedValue,
        description: itemDescription,
        iconClass: selectedIcon || updatedValues[editIndex].iconClass,
        required: requiredChecked,
      };
    } else {
      if (maxItems && updatedValues.length >= maxItems) return;
      updatedValues.push({
        value: trimmedValue,
        description: itemDescription,
        iconClass: selectedIcon,
        required: requiredChecked,
      });
      setEditIndex(updatedValues.length - 1); // open new item immediately
    }

    onStringChange?.({ target: { name, value: updatedValues } });
  };

  // --- Delete Item ---
  const handleDelete = (index: number) => {
    if (values[index].locked) return;
    const updatedValues = values.filter((_, idx) => idx !== index);
    onStringChange?.({ target: { name, value: updatedValues } });
    if (editIndex === index) resetFields();
  };

  // --- Open edit panel ---
  const handleEdit = (index: number) => {
    if (values[index].locked) return;
    if (editIndex === index) {
      resetFields();
      return;
    }

    const item = values[index];
    setEditIndex(index);
    setInputValue(item.value);
    setItemDescription(item.description || "");
    setSelectedIcon(item.iconClass || "");
    setRequiredChecked(item.required || false);
  };

  // --- Add New Item with Demo Data ---
  const handleAddNew = () => {
    const updatedValues = [...values];
    const demoItem: MultiStringItem = {
      value: "New item",
      description: "",
      iconClass: iconOptions.length > 0 ? iconOptions[0] : "",
      required: false,

    };
    updatedValues.push(demoItem);
    const newIndex = updatedValues.length - 1;
    onStringChange?.({ target: { name, value: updatedValues } });

    // Open edit panel for the new item
    setEditIndex(newIndex);
    setInputValue(demoItem.value);
    setItemDescription(demoItem.description || "");
    setSelectedIcon(demoItem.iconClass || "");
    setRequiredChecked(demoItem.required || false);
    handleEdit(newIndex);
  };

  // --- Keyboard Support ---
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddOrUpdate();
    if (e.key === "Escape") resetFields();
  };

  // --- Click outside to close dropdown ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        resetFields();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetFields = () => {
    setEditIndex(null);
    setInputValue("");
    setItemDescription("");
    setSelectedIcon("");
    setRequiredChecked(false);
    setIconDropdownOpen(false);
  };

  // --- Live update when editing fields ---
  useEffect(() => {
    if (editIndex !== null) handleAddOrUpdate(editIndex);
  }, [inputValue, itemDescription, selectedIcon, requiredChecked]);

  return (
    <div
      className={`${wrapperClass} ${(!proSetting && moduleEnabled) ? 'module-enabled' : ''}`}
    >
      <ul className={listClass || "payment-tabs-component"}>
        {values.map((item, index) => (
          <li key={index} className={`${itemClass} payment-method-card`}>
            <div className="payment-method">

              <div className="details">
                <div className="details-wrapper">
                  {iconEnable && item.iconClass &&
                    <div className="payment-method-icon">
                      <i className={item.iconClass}></i>
                    </div>
                  }

                  <div className="payment-method-info">
                    <div className={`title-wrapper ${item.locked ? "locked" : ""}`}>
                      <div className="title">{item.value}</div>
                      {requiredEnable && item.required && (
                        <span className="admin-badge red">Required</span>
                      )}
                      {item.tag && <span className="admin-badge blue">{item.tag}</span>}
                    </div>

                    {item.description && (
                      <div className="method-desc"><p>{item.description}</p></div>
                    )}
                  </div>
                </div>
              </div>


              {!item.locked && (
                <div className="right-section">
                  <ul>
                    {!item.editDisabled && (
                      <li className="hover" onClick={() => handleEdit(index)}>
                        <i className="adminlib-edit"></i>
                        <span>Edit</span>
                      </li>
                    )}
                    {!item.deleteDisabled && (
                      <li className="hover" onClick={() => handleDelete(index)}>
                        <i className="adminlib-delete"></i>
                        <span>Delete</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

            </div>

            {editIndex === index && (
              <div className="payment-method-form open" ref={dropdownRef}>
                {iconEnable && iconOptions.length > 0 && (
                  <div className="form-group">
                    <label>Select Icon</label>
                    <div className="input-content">
                      <div
                        className="selected-icon"
                        onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
                      >
                        {selectedIcon ? <i className={selectedIcon}></i> : "Select Icon"}
                        <span className="dropdown-arrow">▾</span>
                      </div>
                      {iconDropdownOpen && (
                        <ul className="icon-options-list">
                          {iconOptions.map((icon) => (
                            <li
                              key={icon}
                              className={`icon-option ${selectedIcon === icon ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedIcon(icon);
                                setIconDropdownOpen(false);
                              }}
                            >
                              <i className={icon}></i>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Title</label>
                  <div className="input-content">
                    <input
                      type="text"
                      value={inputValue}
                      placeholder={placeholder}
                      className={inputClass}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>

                {descEnable && (
                  <div className="form-group">
                    <label>Description</label>
                    <div className="input-content">
                      <input
                        type="text"
                        value={itemDescription}
                        placeholder="Enter description"
                        className="basic-input"
                        onChange={(e) => setItemDescription(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {requiredEnable && !item.deleteDisabled &&(
                  <div className="form-group">
                    <label>Required</label>
                    <div className="input-content">
                      <input
                        type="checkbox"
                        checked={requiredChecked}
                        onChange={(e) => setRequiredChecked(e.target.checked)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}

        {/* Add new item button */}
        <li className="buttons-wrapper">
          <span className="admin-btn btn-purple" onClick={() => {
            if (proSetting || !moduleEnabled) return;
            handleAddNew();
          }}
          >
            <i className="adminlib-plus-circle"></i> Add New
          </span>
        </li>
      </ul>

      {description && (
        <p
          className={`${descClass} settings-metabox-description`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
};

export default MultiInput;