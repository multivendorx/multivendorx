// ConditionalLogic.tsx
import React, { useState } from 'react';

interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

interface ConditionalLogic {
  enabled: boolean;
  action: 'show' | 'hide';
  rules: ConditionalRule[];
}

interface ConditionalLogicProps {
  formField: any;
  allFields: any[];
  onSave: (logic: ConditionalLogic) => void;
  onClose: () => void;
}

const ConditionalLogicModal: React.FC<ConditionalLogicProps> = ({
  formField,
  allFields,
  onSave,
  onClose,
}) => {
  const [logic, setLogic] = useState<ConditionalLogic>(
    formField.conditionalLogic || {
      enabled: false,
      action: 'show',
      rules: [{ field: '', operator: 'equals', value: '' }]
    }
  );

  const availableFields = allFields.filter(field => 
    field.id !== formField.id && 
    !['title', 'section', 'divider'].includes(field.type)
  );

  const addRule = () => {
    setLogic(prev => ({
      ...prev,
      rules: [...prev.rules, { field: '', operator: 'equals', value: '' }]
    }));
  };

  const removeRule = (index: number) => {
    setLogic(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index: number, updates: Partial<ConditionalRule>) => {
    setLogic(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => 
        i === index ? { ...rule, ...updates } : rule
      )
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Conditional Logic for {formField.name}</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="admin-font adminlib-close"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={logic.enabled}
                onChange={(e) => setLogic(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              Enable Conditional Logic
            </label>
          </div>

          {logic.enabled && (
            <>
              <div className="setting-group">
                <label>Action</label>
                <select
                  value={logic.action}
                  onChange={(e) => setLogic(prev => ({ ...prev, action: e.target.value as any }))}
                  className="basic-select"
                >
                  <option value="show">Show this field if</option>
                  <option value="hide">Hide this field if</option>
                </select>
              </div>

              <div className="rules-container">
                {logic.rules.map((rule, index) => (
                  <div key={index} className="rule-row">
                    {index === 0 ? (
                      <span className="rule-connector">If</span>
                    ) : (
                      <select
                        value="and"
                        className="basic-select connector-select"
                        disabled
                      >
                        <option value="and">And</option>
                      </select>
                    )}

                    <select
                      value={rule.field}
                      onChange={(e) => updateRule(index, { field: e.target.value })}
                      className="basic-select"
                    >
                      <option value="">Select field</option>
                      {availableFields.map(field => (
                        <option key={field.id} value={field.name}>
                          {field.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(index, { operator: e.target.value as any })}
                      className="basic-select"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                    </select>

                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(index, { value: e.target.value })}
                      className="basic-input"
                      placeholder="Value"
                    />

                    {logic.rules.length > 1 && (
                      <button
                        className="remove-rule-btn"
                        onClick={() => removeRule(index)}
                      >
                        <i className="admin-font adminlib-delete"></i>
                      </button>
                    )}
                  </div>
                ))}

                <button className="add-rule-btn admin-btn default-btn" onClick={addRule}>
                  <i className="admin-font adminlib-plus-circle"></i> Add Rule
                </button>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="admin-btn default-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="admin-btn btn-purple" 
            onClick={() => onSave(logic)}
          >
            Save Rules
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionalLogicModal;