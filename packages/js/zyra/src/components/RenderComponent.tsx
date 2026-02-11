import React, {
    JSX,
    useEffect,
    useRef,
    useState,
    ReactNode,
} from 'react';
import { getApiLink, sendApiResponse } from '../utils/apiService';
import Popup, { PopupProps } from './Popup';
import { useModules } from '../contexts/ModuleContext';
import '../styles/web/AdminForm.scss';
import { FIELD_REGISTRY } from './FieldRegistry';
import FormGroupWrapper from './UI/FormGroupWrapper';
import SuccessNotice from './SuccessNotice';
import Popover from './UI/Popover';
import ProPopup from './Popup';


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
    dependent?: DependentCondition | DependentCondition[];
    proSetting?: boolean;
    dependentPlugin?: boolean;
    dependentSetting?: string;
    preText?: string | ReactNode;
    postText?: string | ReactNode;
    beforeElement?: string | ReactNode;
    afterElement?: string | ReactNode;
}

interface SettingsType {
    modal: InputField[];
    submitUrl: string;
    id: string;
}

interface AppLocalizer {
    khali_dabba: boolean;
    nonce: string;
    apiUrl: string;
    restUrl: string;
    tab_name: string;
    [key: string]: string | number | boolean;
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
    error?: string;
    redirect_link?: string;
}

interface DependentCondition {
    key: string;
    set?: boolean;
    value?: string | number | boolean;
}

interface RenderProps {
    settings: SettingsType;
    proSetting: SettingsType;
    setting: Settings;
    updateSetting: (key: string, value: SettingValue) => void;
    modules: string[];
    appLocalizer: AppLocalizer; // Allows any structure
    Popup: typeof Popup;
    modulePopupFields?: PopupProps;
}

const PENALTY = 10;
const COOLDOWN = 1;

const RenderComponent: React.FC<RenderProps> = ({
    setting,
    updateSetting,
    appLocalizer,
    settings,
    Popup,
    modulePopupFields
}) => {
    const { modal, submitUrl, id } = settings;
    const settingChanged = useRef<boolean>(false);
    const counter = useRef<number>(0);
    const counterId = useRef<ReturnType<typeof setInterval> | null>(null);
    const [successMsg, setSuccessMsg] = useState<string>('');
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
                        appLocalizer,
                        getApiLink(appLocalizer, submitUrl),
                        {
                            setting,
                            settingName: id,
                        }
                    ).then((response: unknown) => {
                        const apiResponse = response as ApiResponse;
                        setSuccessMsg(apiResponse.error || '');
                        setTimeout(() => setSuccessMsg(''), 2000);

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
    }, [setting, appLocalizer, submitUrl, id]);

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
        hasDependentSetting?: string,
        hasDependentPlugin?: string
    ) => {
        if (proFeaturesEnabled && !appLocalizer?.khali_dabba) {
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

        if (
            hasDependentPlugin &&
            !appLocalizer[`${hasDependentPlugin}_active`]
        ) {
            return false;
        }
        return true;
    };

    const handleGroupClick = (
        e: React.MouseEvent<HTMLDivElement>,
        field: InputField
    ) => {
        // Stop if already handled by inner elements (optional)
        // But we want to trigger popup on ANY click inside the group

        // 1. Pro Setting
        if (field.proSetting && !appLocalizer?.khali_dabba) {
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
        value: string | number | boolean | null = null
    ): boolean => {
        const settingValue = setting[key];

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

    const shouldRender = (dependent: DependentCondition): boolean => !(
        (dependent.set === true && !isContain(dependent.key)) ||
        (dependent.set === false && isContain(dependent.key)) ||
        (dependent.value !== undefined && !isContain(dependent.key, dependent.value))
    );

    const handleModelClose = () => {
        setModelOpen(false);
    };

    const isProSetting = (proDependent: boolean): boolean => {
        return proDependent && !appLocalizer?.khali_dabba;
    };

    type MultiSelectOption = { value: string; proSetting?: boolean };

    const handleChange = (
        key: string,
        value: string | string[] | number[] | MultiSelectOption[]
    ) => {
        console.log('save');
        settingChanged.current = true;

        const field = modal.find((f) => f.key === key);
        if (!field) return;

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
                .filter(
                    (option) => !isProSetting(option.proSetting ?? false)
                )
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

        if (error) return;

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

    const renderFieldInternal = (
        field: InputField,
        parentField: InputField,
        value: any,
        onChange: (key: string, value: any) => void,
        canAccess: boolean,
        appLocalizer: any
    ): JSX.Element | null => {
        const fieldComponent = FIELD_REGISTRY[field.type];
        if (!fieldComponent) return null;

        const Render = fieldComponent.render;

        const handleInternalChange = (val: any) => {
            if (field.type == 'button') {
                onChange(val.key, val.value);
                return;
            }

            if (!isCompositeField(parentField)) {
                onChange(field.key, val);
                return;
            }

            onChange(parentField.key, {
                ...(value ?? {}),
                [field.key]: val,
            });
        };

        const fieldValue = isCompositeField(parentField)
            ? value?.[field.key] ?? ''
            : value ?? '';

        return (
            <Render
                field={field}
                value={fieldValue}
                onChange={handleInternalChange}
                canAccess={canAccess}
                appLocalizer={appLocalizer}
                modules={modules}
                settings={setting}
                onOptionsChange={(opts: any[]) => {
                    settingChanged.current = true;
                    updateSetting(`${field.key}_options`, opts);
                }}

                onBlocked={(type: 'pro' | 'module', payload?: string) => {
                    if (type === 'pro') openProPopup();
                    if (type === 'module' && payload)
                        openModulePopup(payload);
                }}
            />
        );
    };

    const validateField = (field: InputField, value: any): string | null => {
        const component = FIELD_REGISTRY[field.type];
        if (!component?.validate) return null;

        if (!isCompositeField(field)) {
            return component.validate(field, value);
        }

        return component.validate(field, value ?? {});
    };

    const renderForm = () => {
        return modal.map((inputField: InputField) => {
            // const value: unknown = setting[inputField.key] ?? '';
            const composite = isCompositeField(inputField);

            const value = composite ? setting[inputField.key] ?? {} : setting[inputField.key] ?? '';

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
                            access,
                            appLocalizer
                        )}

                    {renderFieldInternal(
                        inputField,
                        inputField,
                        value,
                        handleChange,
                        access,
                        appLocalizer
                    )}

                    {inputField.afterElement &&
                        renderFieldInternal(
                            inputField.afterElement,
                            inputField,
                            value,
                            handleChange,
                            access,
                            appLocalizer
                        )}
                </>
            );

            // const input = renderField(inputField, value, handleChange, access);

            const isLocked =
                (inputField.proSetting && !appLocalizer?.khali_dabba) ||
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
                    })()) ||
                (inputField.dependentPlugin &&
                    !appLocalizer[`${inputField.dependentPlugin}_active`]);

            const fieldContent =
                inputField.type === 'section' ? (
                    <>{input}</>
                ) : (
                    <div
                        key={inputField.key}
                        className={`form-group row ${inputField.classes ? inputField.classes : ''
                            } ${inputField.proSetting ? 'pro-setting' : ''} ${inputField.moduleEnabled &&
                                !modules.includes(inputField.moduleEnabled)
                                ? 'module-enabled'
                                : ''
                            }`}
                        onClick={(e) => handleGroupClick(e, inputField)}
                    >
                        {inputField.label && (
                            <label
                                className="settings-form-label"
                                key={inputField.key}
                                htmlFor={inputField.key}
                            >
                                <div className="title">{inputField.label}</div>
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

                            {errors && errors[inputField.key] && (
                                <div className="field-error">
                                    {errors[inputField.key]}
                                </div>
                            )}
                            {inputField.desc && (
                                <p
                                    className="settings-metabox-description"
                                    dangerouslySetInnerHTML={{ __html: inputField.desc }}
                                />
                            )}
                        </div>
                        {((inputField.proSetting &&
                            appLocalizer?.khali_dabba) ||
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
                        {inputField.proSetting && !appLocalizer.khali_dabba && (
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
                <Popover
                    position="center"
                    open={modelOpen}
                    onClose={handleModelClose}
                    header={{
                        showCloseButton: true,
                        onClose: handleModelClose
                    }}
                >
                    <Popup
                        moduleName={String(modulePopupData.moduleName)}
                        settings={modulePopupData.settings}
                        plugin={modulePopupData.plugin}
                        message={modulePopupFields?.message}
                        moduleButton={modulePopupFields?.moduleButton}
                        pluginDescription={modulePopupFields?.pluginDescription}
                        pluginButton={modulePopupFields?.pluginButton}
                        SettingDescription={modulePopupFields?.SettingDescription}
                        pluginUrl={modulePopupFields?.pluginUrl}
                        modulePageUrl={modulePopupFields?.modulePageUrl}
                    />
                </Popover>
            )}
            {successMsg && (
                <SuccessNotice message={successMsg} />
            )}
            <FormGroupWrapper>{renderForm()}</FormGroupWrapper>
        </>
    );

}

export default RenderComponent;