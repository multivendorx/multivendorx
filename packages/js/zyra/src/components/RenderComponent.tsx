import React, { JSX, useEffect, useRef, useState, ReactNode } from 'react';
import { getApiLink, sendApiResponse } from '../utils/apiService';
import { useModules } from '../contexts/ModuleContext';
import { FIELD_REGISTRY, ZyraVariable } from './fieldUtils';
import FormGroupWrapper from './UI/FormGroupWrapper';
import { PopupUI } from './Popup';
import { Notice, NoticeManager } from './Notice';

interface InputField {
    key: string;
    id?: string;
    class?: string;
    name?: string;
    type?: string;
    label?: string;
    classes?: string;
    settingDescription?: string;
    desc?: string;
    placeholder?: string;
    moduleEnabled?: string;
    cols?: number;
    apilink?: string;
    action?: string;
    method?: string;
    responseKey?: string;
    link?: string;
    dependent?: DependentCondition | DependentCondition[];
    proSetting?: boolean;
    dependentPlugin?: boolean;
    dependentSetting?: string;
    preText?: string | ReactNode;
    postText?: string | ReactNode;
    beforeElement?: string | ReactNode;
    afterElement?: string | ReactNode;
    row?: boolean;
}

interface SettingsType {
    modal: InputField[];
    submitUrl: string;
    id: string;
}

type SettingValue =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | Record<string, unknown>
    | null;

type Settings = Record<string, SettingValue>;

interface ApiResponse {
    type?: string;
    message?: string;
    redirect_link?: string;
}

interface DependentCondition {
    key: string;
    set?: boolean;
    value?: string | number | boolean | (string | number | boolean)[];
}

interface PopupProps {
    moduleName?: string;
    settings?: string;
    plugin?: string | Record<string, unknown>;
}

interface RenderProps {
    settings: SettingsType;
    proSetting: SettingsType;
    setting: Settings;
    updateSetting: (key: string, value: SettingValue) => void;
    modules: string[];
    Popup: React.ComponentType<PopupProps>;
    storeTabSetting?: Record<string, string[]>;
}

const PENALTY = 10;
const COOLDOWN = 1;

const RenderComponent: React.FC<RenderProps> = ({
    setting,
    updateSetting,
    settings,
    Popup,
    storeTabSetting,
}) => {
    const { modal, submitUrl, id } = settings;
    const settingChanged = useRef<boolean>(false);
    const counter = useRef<number>(0);
    const counterId = useRef<ReturnType<typeof setInterval> | null>(null);
    const [modelOpen, setModelOpen] = useState<boolean>(false);
    const [modulePopupData, setModulePopupData] = useState<PopupProps>({
        moduleName: '',
        settings: '',
        plugin: '',
    });
    const { modules } = useModules();
    const [errors, setErrors] = useState<Record<string, string | null>>({});

    useEffect(() => {
        if (settingChanged.current) {
            settingChanged.current = false;

            // Set counter by penalty
            counter.current = PENALTY;

            // Clear previous counter
            if (counterId.current) {
                clearInterval(counterId.current);
            }

            // Create new interval
            const intervalId = setInterval(() => {
                counter.current -= COOLDOWN;

                // Cooldown complete, time for DB request
                if (counter.current < 0) {
                    sendApiResponse(
                        ZyraVariable,
                        getApiLink(ZyraVariable, submitUrl),
                        {
                            setting,
                            settingName: id,
                        }
                    ).then((response: unknown) => {
                        const apiResponse = response as ApiResponse;
                        if (apiResponse.message) {
                            NoticeManager.add({
                                title: 'Great!',
                                message: apiResponse.message,
                                type: apiResponse.type || 'success',
                                position: 'float',
                            });
                        }

                        if (apiResponse.redirect_link) {
                            window.open(apiResponse.redirect_link, '_self');
                        }
                    });

                    clearInterval(intervalId);
                    counterId.current = null;
                }
            }, 50);

            // Store the interval ID
            counterId.current = intervalId;
        }
    }, [setting, submitUrl, id]);

    useEffect(() => {
        if (modelOpen === false) {
            const timeout = setTimeout(() => {
                setModulePopupData({
                    moduleName: '',
                    settings: '',
                    plugin: '',
                });
            }, 100);

            return () => clearTimeout(timeout);
        }
    }, [modelOpen]);

    const hasAccess = (
        proFeaturesEnabled: boolean,
        hasDependentModule?: string,
        hasDependentSetting?: string
        // hasDependentPlugin?: string
    ) => {
        if (proFeaturesEnabled && !ZyraVariable?.khali_dabba) {
            return false;
        }

        if (hasDependentModule && !modules.includes(hasDependentModule)) {
            return false;
        }

        if (
            hasDependentSetting &&
            Array.isArray(setting[hasDependentSetting]) &&
            setting[hasDependentSetting].length === 0
        ) {
            return false;
        }

        // if (
        //     hasDependentPlugin &&
        //     !appLocalizer[`${hasDependentPlugin}_active`]
        // ) {
        //     return false;
        // }
        return true;
    };

    const handleGroupClick = (
        e: React.MouseEvent<HTMLDivElement>,
        field: InputField
    ) => {
        // Stop if already handled by inner elements (optional)
        // But we want to trigger popup on ANY click inside the group

        // 1. Pro Setting
        if (field.proSetting && !ZyraVariable?.khali_dabba) {
            setModelOpen(true);
            e.stopPropagation();
            return;
        }

        // 2. Module Enabled but not active
        if (field.moduleEnabled && !modules.includes(field.moduleEnabled)) {
            setModulePopupData({
                moduleName: field.moduleEnabled,
                settings: '',
                plugin: '',
            });
            setModelOpen(true);
            e.stopPropagation();
            return;
        }

        // 3. Dependent Setting (empty array)
        if (
            field.dependentSetting &&
            Array.isArray(setting[field.dependentSetting]) &&
            setting[field.dependentSetting].length === 0
        ) {
            setModulePopupData({
                moduleName: '',
                settings: field.dependentSetting,
                plugin: '',
            });
            setModelOpen(true);
            e.stopPropagation();
            return;
        }
    };

    const isContain = (
        key: string,
        value: string | number | boolean | (string | number | boolean)[] | null = null
    ): boolean => {
        const settingValue = setting[key];

        if (Array.isArray(value)) {
            return value.includes(settingValue as string | number | boolean);
        }
        
        // If settingValue is an array
        if (Array.isArray(settingValue)) {
            // If value is null and settingValue has elements, return true
            if (value === null && settingValue.length > 0) {
                return true;
            }

            return settingValue.includes(value);
        }

        // If settingValue is not an array
        if (value === null && Boolean(settingValue)) {
            return true;
        }

        return settingValue === value;
    };

    const shouldRender = (dependent: DependentCondition): boolean =>
        !(
            (dependent.set === true && !isContain(dependent.key)) ||
            (dependent.set === false && isContain(dependent.key)) ||
            (dependent.value !== undefined &&
                !isContain(dependent.key, dependent.value))
        );

    const handleModelClose = () => {
        setModelOpen(false);
    };

    const isProSetting = (proDependent: boolean): boolean => {
        return proDependent && !ZyraVariable?.khali_dabba;
    };

    type MultiSelectOption = { value: string; proSetting?: boolean };

    const handleChange = (
        key: string,
        value: string | string[] | number[] | MultiSelectOption[]
    ) => {
        console.log('save');
        settingChanged.current = true;

        const field = modal.find((f) => f.key === key);
        if (!field) {
            return;
        }

        if (field.type === 'nested') {
            updateSetting(key, value);
            return;
        }

        // Multi-select select / deselect-all logic
        if (
            Array.isArray(value) &&
            value.length > 0 &&
            typeof value[0] === 'object'
        ) {
            if (Array.isArray(setting[key]) && setting[key].length > 0) {
                updateSetting(key, [] as string[]);
                return;
            }

            const newValue: string[] = value
                .filter((option) => !isProSetting(option.proSetting ?? false))
                .map((option) => option.value);

            updateSetting(key, newValue);
            return;
        }

        // Normal input change (value is now SettingValue)
        const error = validateField(field, value);

        setErrors((prev) => ({
            ...prev,
            [key]: error,
        }));

        if (error) {
            return;
        }

        updateSetting(key, value);
    };

    const VALUE_ADDON_TYPES = ['select', 'text'];

    const isCompositeField = (field: InputField) =>
        VALUE_ADDON_TYPES.includes(field.beforeElement?.type) ||
        VALUE_ADDON_TYPES.includes(field.afterElement?.type);

    const openProPopup = () => {
        setModulePopupData({ moduleName: '', settings: '', plugin: '' });
        setModelOpen(true);
    };

    const openModulePopup = (module: string) => {
        setModulePopupData({ moduleName: module, settings: '', plugin: '' });
        setModelOpen(true);
    };

    const openPluginPopup = (plugin: {}) => {
        setModulePopupData({ moduleName: '', settings: '', plugin: plugin });
        setModelOpen(true);
    };

    const renderFieldInternal = (
        field: InputField,
        parentField: InputField,
        value: SettingValue | Record<string, unknown>,
        onChange: (
            key: string,
            value: SettingValue | Record<string, unknown>
        ) => void,
        canAccess: boolean
    ): JSX.Element | null => {
        if (field.component) {
            return field.component;
        }
        const fieldComponent = FIELD_REGISTRY[field.type];
        if (!fieldComponent) {
            return null;
        }

        const Render = fieldComponent.render;

        const handleInternalChange = (val: SettingValue) => {
            if (!isCompositeField(parentField)) {
                onChange(field.key, val);
                return;
            }

            onChange(parentField.key, {
                ...(value ?? ({} as Record<string, unknown>)),
                [field.key]: val,
            });
        };

        const fieldValue = isCompositeField(parentField)
            ? (value?.[field.key] ?? '')
            : (value ?? '');

        return (
            <Render
                field={field}
                value={fieldValue}
                onChange={handleInternalChange}
                canAccess={canAccess}
                // appLocalizer={appLocalizer}
                modules={modules}
                settings={setting}
                onOptionsChange={(opts: Record<string, unknown>[]) => {
                    settingChanged.current = true;
                    updateSetting(`${field.key}_options`, opts);
                }}
                onBlocked={(
                    type: 'pro' | 'module' | 'plugin',
                    payload?: string | Record<string, unknown>
                ) => {
                    if (type === 'pro') {
                        openProPopup();
                    }
                    if (type === 'module' && payload) {
                        openModulePopup(payload);
                    }
                    if (type === 'plugin' && payload) {
                        openPluginPopup(payload);
                    }
                }}
                storeTabSetting={storeTabSetting}
            />
        );
    };

    const validateField = (
        field: InputField,
        value: SettingValue | Record<string, unknown>
    ): string | null => {
        const component = FIELD_REGISTRY[field.type];
        if (!component?.validate) {
            return null;
        }

        if (!isCompositeField(field)) {
            return component.validate(field, value);
        }

        return component.validate(field, value ?? {});
    };

    const renderForm = () => {
        return modal.map((inputField: InputField) => {
            // const value: unknown = setting[inputField.key] ?? '';
            const composite = isCompositeField(inputField);

            const value = composite
                ? (setting[inputField.key] ?? {})
                : (setting[inputField.key] ?? '');

            // Filter dependent conditions
            if (Array.isArray(inputField.dependent)) {
                for (const dependent of inputField.dependent) {
                    if (!shouldRender(dependent)) {
                        return null;
                    }
                }
            } else if (inputField.dependent) {
                if (!shouldRender(inputField.dependent)) {
                    return null;
                }
            }

            const access = hasAccess(
                inputField.proSetting ?? false,
                String(inputField.moduleEnabled ?? ''),
                String(inputField.dependentSetting ?? ''),
                String(inputField.dependentPlugin ?? '')
            );

            // const input = renderFieldInternal(inputField, value, handleChange, access );
            const input = (
                <>
                    {inputField.beforeElement &&
                        renderFieldInternal(
                            inputField.beforeElement,
                            inputField,
                            value,
                            handleChange,
                            access
                        )}

                    {renderFieldInternal(
                        inputField,
                        inputField,
                        value,
                        handleChange,
                        access
                    )}

                    {inputField.afterElement &&
                        renderFieldInternal(
                            inputField.afterElement,
                            inputField,
                            value,
                            handleChange,
                            access
                        )}
                </>
            );

            // const input = renderField(inputField, value, handleChange, access);

            const isLocked =
                (inputField.proSetting && !ZyraVariable?.khali_dabba) ||
                (inputField.moduleEnabled &&
                    !modules.includes(inputField.moduleEnabled)) ||
                (inputField.dependentSetting &&
                    (() => {
                        const dependentValue =
                            setting[inputField.dependentSetting];
                        return (
                            Array.isArray(dependentValue) &&
                            dependentValue.length === 0
                        );
                    })());
            // (inputField.dependentPlugin &&
            //     !appLocalizer[`${inputField.dependentPlugin}_active`]);

            const fieldContent =
                inputField.type === 'section' ? (
                    <>{input}</>
                ) : (
                    <div
                        key={inputField.key}
                        className={`form-group ${inputField.row === false ? '' : 'row'
                            }  ${inputField.classes ? inputField.classes : ''} ${inputField.proSetting ? 'pro-setting' : ''
                            } ${inputField.moduleEnabled &&
                                !modules.includes(inputField.moduleEnabled)
                                ? 'module-enabled'
                                : ''
                            }`}
                        data-cols={inputField.cols}
                        onClick={(e) => handleGroupClick(e, inputField)}
                    >
                        {inputField.label && (
                            <label
                                className="settings-form-label"
                                key={inputField.key}
                                htmlFor={inputField.key}
                            >
                                <div className="title">
                                    {inputField.icon && (
                                        <i
                                            className={`adminfont-${inputField.icon} ${inputField.icon}`}
                                        />
                                    )}
                                    {inputField.label}
                                </div>
                                {inputField.settingDescription && (
                                    <div className="settings-metabox-description">
                                        {inputField.settingDescription}
                                    </div>
                                )}
                            </label>
                        )}
                        <div className="settings-input-content">
                            {isLocked &&
                                React.isValidElement<
                                    React.HTMLAttributes<HTMLElement>
                                >(input)
                                ? React.cloneElement(input, {
                                    onClick: (e) => {
                                        e.stopPropagation();
                                    },
                                })
                                : input}

                            {errors[inputField.key] && (
                                <Notice
                                    uniqueKey={`error-${inputField.key}`}
                                    type="error"
                                    displayPosition="inline"
                                    message={errors[inputField.key]}
                                />
                            )}
                            {inputField.desc && (
                                <p
                                    className="settings-metabox-description"
                                    dangerouslySetInnerHTML={{
                                        __html: inputField.desc,
                                    }}
                                />
                            )}
                        </div>
                        {((inputField.proSetting &&
                            ZyraVariable?.khali_dabba) ||
                            !inputField.proSetting) &&
                            inputField.moduleEnabled &&
                            !modules.includes(inputField.moduleEnabled) && (
                                <span className="admin-pro-tag module">
                                    <i
                                        className={`adminfont-${inputField.moduleEnabled}`}
                                    ></i>
                                    {String(inputField.moduleEnabled)
                                        .split('-')
                                        .map(
                                            (word: string) =>
                                                word.charAt(0).toUpperCase() +
                                                word.slice(1)
                                        )
                                        .join(' ')}
                                    <i className="adminfont-lock"></i>
                                </span>
                            )}
                        {inputField.proSetting && !ZyraVariable.khali_dabba && (
                            <span className="admin-pro-tag">
                                <i className="adminfont-pro-tag"></i>Pro
                            </span>
                        )}
                    </div>
                );

            return fieldContent;
        });
    };

    return (
        <>
            {modelOpen && (
                <PopupUI
                    position="lightbox"
                    open={modelOpen}
                    onClose={handleModelClose}
                    width={31.25}
                    height="auto"
                >
                    <Popup
                        moduleName={String(modulePopupData.moduleName)}
                        settings={modulePopupData.settings}
                        plugin={modulePopupData.plugin}
                    />
                </PopupUI>
            )}
            <FormGroupWrapper>{renderForm()}</FormGroupWrapper>
        </>
    );
};

export default RenderComponent;
