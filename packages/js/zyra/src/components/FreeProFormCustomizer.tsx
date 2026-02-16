// External dependencies
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Internal dependencies
import SubTabSection, { MenuItem } from './SubTabSection';
import ProForm from './FormRenderer';
import '../styles/web/FreeProFormCustomizer.scss';
import '../styles/web/RegistrationForm.scss';

// Types
interface FormField {
    key: string;
    label?: string;
    active?: boolean;
    desc?: string;
}

type FormValue = string | number | boolean | FormField[] | undefined;

interface FreeProFormCustomizerProps {
    setting: { freefromsetting?: FormField[] };
    proSetting: boolean;
    proSettingChange: () => boolean;
    moduleEnabledChange: () => boolean;
    onChange: ( key: string, value: FormValue ) => void;
}

// Field configuration constants
const FORM_FIELDS_CONFIG = [
    { key: 'name', desc: 'Name' },
    { key: 'email', desc: 'Email' },
    { key: 'phone', desc: 'Phone' },
    { key: 'address', desc: 'Address' },
    { key: 'subject', desc: 'Enquiry about' },
    { key: 'comment', desc: 'Enquiry details' },
    { key: 'fileupload', desc: 'File upload' },
    { key: 'filesize-limit', desc: 'File upload size limit (in MB)' },
    { key: 'captcha', desc: 'Captcha' },
];

const MENU_ITEMS: MenuItem[] = [
    { name: 'Free', link: 'hi', id: '2', icon: 'adminfont-info' },
    { name: 'Pro', link: 'hi', id: '1', icon: 'adminfont-cart' },
];

// Helper function to get field from array
const getFieldByKey = (fields: FormField[], key: string): FormField | undefined =>
    fields.find(({ key: fieldKey }) => fieldKey === key);

// Free Form Tab Component
interface FreeFormTabProps {
    fieldsData: FormField[];
    onChange: (fields: FormField[]) => void;
    isModuleEnabled: () => boolean;
}

const FreeFormTab: React.FC<FreeFormTabProps> = React.memo(({ 
    fieldsData, 
    onChange, 
    isModuleEnabled 
}) => {
    const handleToggleField = useCallback((fieldKey: string, isActive: boolean) => {
        if (isModuleEnabled()) return;

        const existingField = getFieldByKey(fieldsData, fieldKey);
        
        if (existingField) {
            // Update existing field
            onChange(
                fieldsData.map(field =>
                    field.key === fieldKey 
                        ? { ...field, active: isActive, label: field.label || '' }
                        : field
                )
            );
        } else {
            // Add new field
            onChange([
                ...fieldsData,
                { key: fieldKey, label: '', active: isActive }
            ]);
        }
    }, [fieldsData, onChange, isModuleEnabled]);

    const handleUpdateLabel = useCallback((fieldKey: string, labelValue: string) => {
        if (isModuleEnabled()) return;

        const existingField = getFieldByKey(fieldsData, fieldKey);
        
        if (existingField) {
            // Update existing field label
            onChange(
                fieldsData.map(field =>
                    field.key === fieldKey 
                        ? { ...field, label: labelValue }
                        : field
                )
            );
        } else {
            // Add new field with label
            onChange([
                ...fieldsData,
                { key: fieldKey, label: labelValue, active: false }
            ]);
        }
    }, [fieldsData, onChange, isModuleEnabled]);

    return (
        <div className="form-field">
            <div className="edit-form-wrapper free-form">
                <h3 className="form-label">{'Field Name'}</h3>
                <h3 className="set-name">{'Set new field name'}</h3>
            </div>
            {FORM_FIELDS_CONFIG.map((fieldConfig) => {
                const field = getFieldByKey(fieldsData, fieldConfig.key);
                const isReadonly = !field?.active;
                
                return (
                    <div className="edit-form-wrapper free-form" key={fieldConfig.key}>
                        <div className="form-label" style={{ opacity: isReadonly ? '0.3' : '1' }}>
                            {fieldConfig.desc}
                        </div>
                        <div className="settings-form-group-radio">
                            <input
                                className="basic-input"
                                type="text"
                                onChange={ ( e ) => handleUpdateLabel(fieldConfig.key, e.target.value)}
                                value={field?.label || ''}
                                readOnly={ isReadonly }
                                style={{ opacity: isReadonly ? '0.3' : '1' }}
                            />
                        </div>
                        <div
                            className="button-visibility"
                            role="button"
                            tabIndex={ 0 }
                            onClick={ () => handleToggleField(fieldConfig.key, isReadonly)}
                        >
                            <i
                                className={ `admin-font ${
                                    isReadonly
                                        ? 'adminfont-eye-blocked enable-visibility'
                                        : 'adminfont-eye'
                                }`}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

FreeFormTab.displayName = 'FreeFormTab';

// Main Component
const FreeProFormCustomizer: React.FC<FreeProFormCustomizerProps> = ({
    setting,
    proSettingChange,
    moduleEnabledChange,
    onChange,
}) => {
    // Initialize state from props
    const [formFieldsData, setFormFieldsData] = useState<FormField[]>(
        () => setting?.freefromsetting || []
    );
    
    const [currentTab, setCurrentTab] = useState<MenuItem>(MENU_ITEMS[0]);
    
    // Track changes for auto-save
    const settingChange = useRef<boolean>(false);
    
    // Memoized derived values
    const isModuleEnabled = useCallback(() => moduleEnabledChange(), [moduleEnabledChange]);
    
    // Handle form fields data changes
    const handleFormFieldsChange = useCallback((newFields: FormField[]) => {
        settingChange.current = true;
        setFormFieldsData(newFields);
    }, []);
    
    // Auto-save effect
    useEffect(() => {
        if (settingChange.current) {
            onChange('freefromsetting', formFieldsData);
            settingChange.current = false;
        }
    }, [formFieldsData, onChange]);
    
    return (
        <>
            <SubTabSection
                menuitem={MENU_ITEMS}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
            />
            {currentTab.id === '1' ? (
                <ProForm
                    setting={setting}
                    name="formsettings"
                    proSettingChange={proSettingChange}
                    onChange={(value) => onChange('formsettings', value)}
                />
            ) : (
                <FreeFormTab
                    fieldsData={formFieldsData}
                    onChange={handleFormFieldsChange}
                    isModuleEnabled={isModuleEnabled}
                />
            )}
        </>
    );
};

export default FreeProFormCustomizer;