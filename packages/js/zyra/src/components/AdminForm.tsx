// External dependencies
import React, {
    JSX,
    useEffect,
    useRef,
    useState,
    ReactNode,
} from 'react';
import type { ActionMeta, MultiValue, SingleValue } from 'react-select';
import { Dialog } from '@mui/material';
import axios from 'axios';

// Internal Dependencies
import SelectInput, { SelectOptions } from './SelectInput';
import Section from './Section';
import BlockText from './BlockText';
import FormCustomizer from './NotifimaFormCustomizer';
import FreeProFormCustomizer from './FreeProFormCustomizer';
import FromBuilder from './RegistrationForm';
import CatalogCustomizer from './CatalogCustomizer';
import MultiCheckboxTable from './MultiCheckboxTable';
import ShortCodeTable from './ShortCodeTable';
import DoActionBtn from './DoActionBtn';
import DropDownMapping from './DropDownMapping';
import ToggleSetting from './ToggleSetting';
import { getApiLink, sendApiResponse } from '../utils/apiService';
import BasicInput from './BasicInput';
import TextArea from './TextArea';
import FileInput from './FileInput';
import RadioInput from './RadioInput';
import MultiCheckBox from './MultiCheckbox';
import Log from './Log';
import InputMailchimpList from './InputMailchimpList';
import Popup, { PopupProps } from './Popup';
import NestedComponent from './NestedComponent';
import ColorSettingInput from './ColorSettingInput';
import EndpointEditor from './EndpointEditor';
import ExpandablePanelGroup from './ExpandablePanelGroup';
import SystemInfo from './SystemInfo';
import { useModules } from '../contexts/ModuleContext';
import EmailTemplate from './TemplateEditor/EmailTemplate';
import '../styles/web/AdminForm.scss';
import { renderField } from './RenderField';

interface WPMediaAttachment {
    url: string;
}

interface WPMediaSelection {
    first(): {
        toJSON(): WPMediaAttachment;
    };
}

interface WPMediaState {
    get(key: 'selection'): WPMediaSelection;
}

interface WPMediaFrame {
    on(event: 'select', callback: () => void): void;
    state(): WPMediaState;
    open(): void;
}

interface WPGlobal {
    media(options: {
        title: string;
        button: { text: string };
        multiple: boolean;
    }): WPMediaFrame;
}

declare const wp: WPGlobal;

const PENALTY = 10;
const COOLDOWN = 1;

type RowType = Record<string, string | number | boolean | string[]>;

interface DependentCondition {
    key: string;
    set?: boolean;
    value?: string | number | boolean;
}

interface ShortcodeArgument {
    attribute: string;
    description: string;
    accepted: string;
    default: string;
}

interface MultiNumOption {
    key: string;
    value: string | number;
    label?: string;
    name?: string;
    type?: string;
    desc?: string;
    arguments?: ShortcodeArgument[];
}
interface Field {
    name: string;
    type: 'select' | 'number' | 'text'; // Include "text" in the type property
    options?: { value: string; label: string }[]; // For select fields
    placeholder?: string;
}

interface Task {
    action: string;
    message: string;
    cache?: 'course_id' | 'user_id';
}

interface InputField {
    showPdfButton: boolean;
    templates: never[];
    key: string;
    id?: string;
    class?: string;
    name?: string;
    type?:
        | 'text'
        | 'select'
        | 'multi-select'
        | 'checkbox'
        | 'color-setting'
        | 'radio'
        | 'button'
        | 'password'
        | 'email'
        | 'number'
        | 'range'
        | 'time'
        | 'file'
        | 'url'
        | 'textarea'
        | 'setting-toggle'
        | 'section'
        | 'blocktext'
        | 'notifima-form-customizer'
        | 'form-customizer'
        | 'catalog-customizer'
        | 'multi-checkbox-table'
        | 'shortcode-table'
        | 'do-action-btn'
        | 'dropdown-mapping'
        | 'log'
        | 'system-info'
        | 'checkbox-custom-img'
        | 'api-connect'
        | 'nested'
        | 'expandable-panel'
        | 'form-builder'
        | 'email-template'
        | 'endpoint-editor';
    settingDescription?: string;
    desc?: string;
    placeholder?: string;
    inputLabel?: string;
    rangeUnit?: string;
    min?: number;
    max?: number;
    icon?: string;
    iconEnable?: boolean;
    custom?: boolean;
    size?: string;
    preText?: string | ReactNode;
    postText?: string | ReactNode;
    proSetting?: boolean;
    buttonColor?: string;
    moduleEnabled?: string;
    postInsideText?: string | ReactNode;
    parameter?: string;
    generate?: string;
    dependent?: DependentCondition | DependentCondition[];
    rowNumber?: number;
    colNumber?: number;
    value?: string;
    multiSelect?: boolean;
    copyButtonLabel?: string;
    copiedLabel?: string;
    width?: number;
    height?: number;
    multiple?: boolean;
    usePlainText?: boolean;
    range?: boolean;
    className?: string;
    selectDeselect?: boolean;
    look?: string;
    inputWrapperClass?: string;
    wrapperClass?: string;
    rowClass?: string;
    tour?: string;
    preInsideText?: string | ReactNode;
    rightContent?: boolean;
    dependentPlugin?: boolean;
    dependentSetting?: string;
    defaultValue?: string;
    valuename?: string;
    iconOptions?: string[];
    hint?: string;
    addNewBtnText?: string;
    addNewBtn?: boolean;
    blocktext?: string;
    title?: string;
    rows?: {
        key: string;
        label: string;
        options?: { value: string | number; label: string }[];
    }[];
    columns?: { key: string; label: string; moduleEnabled?: string }[];
    enable?: boolean;
    fields?: Field[];
    options?: MultiNumOption[];
    optionLabel?: string[];
    apilink?: string;
    interval?: number;
    syncFieldsMap?: Record<
        string,
        { heading: string; fields: Record<string, string> }
    >;
    apiLink?: string;
    method?: string;
    tasks?: Task[];
    fileName?: string;
    syncDirections?: {
        value: string;
        img1: string;
        img2: string;
        label: string;
    }[];
    optionKey?: string;
    selectKey?: string;
    label?: string;
    classes?: string;
    single?: boolean;
    nestedFields?: {
        key: string;
        type: 'number' | 'select';
        label: string;
        placeholder?: string;
        options?: { value: string; label: string }[];
    }[];
    addButtonLabel?: string;
    deleteButtonLabel?: string;
    predefinedOptions?: {
        key?: string;
        label?: string;
        value?: string;
        color?: string[];
        name?: string;
    }[];
    images?: {
        key?: string;
        label?: string;
        value?: string;
        image?: string[];
    }[];
    modal?: {
        icon: string;
        id: string;
        label: string;
        connected: boolean;
        desc: string;
        formFields: {
            key: string;
            type: 'text' | 'password' | 'number' | 'checkbox';
            label: string;
            placeholder?: string;
        }[];
    }[];
    addNewTemplate?: {
        icon: string;
        label: string;
        desc: string;
        formFields: {
            key: string;
            type: 'text' | 'password' | 'number' | 'checkbox';
            label: string;
            placeholder?: string;
        }[];
    };
    link?: string;
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

interface AdminFormProps {
    settings: SettingsType;
    proSetting: SettingsType;
    setting: Settings;
    updateSetting: (key: string, value: SettingValue) => void;
    modules: string[];
    storeTabSetting?: Record<string, string[]>;
    appLocalizer: AppLocalizer; // Allows any structure
    Popup: typeof Popup;
    modulePopupFields?: PopupProps;
}

const AdminForm: React.FC<AdminFormProps> = ({
    setting,
    updateSetting,
    appLocalizer,
    settings,
    storeTabSetting,
    Popup,
    modulePopupFields,
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

    const isProSetting = (proDependent: boolean): boolean => {
        return proDependent && !appLocalizer?.khali_dabba;
    };

    const proSettingChanged = (isProSettingVal: boolean): boolean => {
        if (isProSettingVal && !appLocalizer?.khali_dabba) {
            setModelOpen(true);
            return true;
        }
        return false;
    };

    const moduleEnabledChanged = (
        moduleEnabled: string,
        dependentSetting: string = '',
        dependentPlugin: boolean = false,
        dependentPluginName: string = ''
    ): boolean => {
        const popupData: PopupProps = {
            moduleName: '',
            settings: '',
            plugin: '',
        };

        if (moduleEnabled && !modules.includes(moduleEnabled)) {
            popupData.moduleName = moduleEnabled;
        }

        if (
            dependentSetting &&
            Array.isArray(setting[dependentSetting]) &&
            setting[dependentSetting].length === 0
        ) {
            popupData.settings = dependentSetting;
        }

        if (!dependentPlugin) {
            popupData.plugin = dependentPluginName;
        }

        if (popupData.moduleName || popupData.settings || popupData.plugin) {
            setModulePopupData(popupData);
            setModelOpen(true);
            return true;
        }

        return false;
    };

    const hasAccess = (
        proFeaturesEnabled: boolean,
        hasDependentModule?: string,
        hasDependentSetting?: string,
        hasDependentPlugin?: string
    ) => {
        const popupData: PopupProps = {
            moduleName: '',
            settings: '',
            plugin: '',
        };

        if (proFeaturesEnabled && !appLocalizer?.khali_dabba) {
            setModelOpen(true);
            return false;
        }

        if (hasDependentModule && !modules.includes(hasDependentModule)) {
            popupData.moduleName = hasDependentModule;
            setModulePopupData(popupData);
            setModelOpen(true);
            return false;
        }

        if (
            hasDependentSetting &&
            Array.isArray(setting[hasDependentSetting]) &&
            setting[hasDependentSetting].length === 0
        ) {
            popupData.settings = hasDependentSetting;
            setModulePopupData(popupData);
            setModelOpen(true);
            return false;
        }

        if (
            hasDependentPlugin &&
            !appLocalizer[`${hasDependentPlugin}_active`]
        ) {
            popupData.plugin = hasDependentPlugin;
            setModulePopupData(popupData);
            setModelOpen(true);
            return false;
        }
        return true;
    };

    const handleChange = (
        event:
            | React.ChangeEvent<
                  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
              >
            | string
            | string[]
            | number
            | React.ChangeEvent
            | { index: number },
        key: string,
        type: 'single' | 'multiple' = 'single',
        fromType:
            | 'simple'
            | 'select'
            | 'multi-select' = 'simple',
    ) => {
        settingChanged.current = true;

        if (type === 'single') {
            // normal single value
            if (fromType === 'simple') {
                const val =
                    typeof event === 'object' && 'target' in event
                        ? (event as React.ChangeEvent<HTMLInputElement>).target
                              .value
                        : event;
                updateSetting(key, val);
            } else if (fromType === 'select') {
                const val =
                    typeof event === 'object' && 'value' in event
                    ? event.value
                    : event;
                updateSetting(key, val);
            } else if (fromType === 'multi-select') {
                updateSetting(key, event as string[]);
            }
        } else {
            // multiple checkbox type
            const checkboxEvent = event as React.ChangeEvent<HTMLInputElement>;
            let prevData: string[] = setting[key] || [];
            if (!Array.isArray(prevData)) {
                prevData = [String(prevData)];
            }

            prevData = prevData.filter(
                (data) => data !== checkboxEvent.target.value
            );
            if (checkboxEvent.target.checked) {
                prevData.push(checkboxEvent.target.value);
            }
            updateSetting(key, prevData);
        }
    };

    const handlMultiSelectDeselectChange = (
        key: string,
        options: { value: string; proSetting?: boolean }[],
        type: string = ''
    ) => {
        settingChanged.current = true;

        if (Array.isArray(setting[key]) && setting[key].length > 0) {
            updateSetting(key, []);
        } else {
            const newValue: string[] = options
                .filter(
                    (option) =>
                        type === 'multi-select' ||
                        !isProSetting(option.proSetting ?? false)
                )
                .map(({ value }) => value);

            updateSetting(key, newValue);
        }
    };

    const runUploader = (
        key: string,
        multiple = false,
        replaceIndex: number = -1,
        existingUrls: string[] = []
    ): void => {
        settingChanged.current = true;

        const frame = wp.media({
            title: 'Select Media',
            button: { text: 'Use media' },
            multiple,
        });

        frame.on('select', () => {
            const selection = frame.state().get('selection').toJSON();
            const selectedUrl = selection[0]?.url;

            if (multiple && replaceIndex !== -1) {
                const next = [...existingUrls];
                next[replaceIndex] = selectedUrl;
                updateSetting(key, next);
                return;
            }

            if (multiple) {
                const urls = (selection as WPMediaAttachment[]).map(
                    (item) => item.url
                );
                updateSetting(key, urls);
            } else {
                updateSetting(key, selectedUrl || '');
            }
        });

        frame.open();
    };

    const onSelectChange = (
        newValue: SingleValue<SelectOptions> | MultiValue<SelectOptions>,
        actionMeta: ActionMeta<SelectOptions>
    ) => {
        settingChanged.current = true;
        if (Array.isArray(newValue)) {
            // Multi-select case
            const values = newValue.map((val) => val.value);
            updateSetting(actionMeta.name as string, values);
        } else if (newValue !== null && 'value' in newValue) {
            // Single-select case (ensures 'newValue' is an object with 'value')
            updateSetting(actionMeta.name as string, newValue.value);
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

    // Click handler for the entire .form-group that is entire settings row
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

    const renderForm = () => {
        return modal.map((inputField: InputField) => {
            const value: unknown = setting[inputField.key] ?? '';
            let input: JSX.Element | null = null;
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

            
            input = renderField(inputField, value, handleChange);

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
                        className={`form-group ${
                            inputField.classes ? inputField.classes : ''
                        } ${inputField.proSetting ? 'pro-setting' : ''} ${
                            inputField.moduleEnabled &&
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

    const handleModelClose = () => {
        setModelOpen(false);
    };

    return (
        <>
            <div className="dynamic-fields-wrapper">
                <Dialog
                    className="admin-module-popup"
                    open={modelOpen}
                    onClose={handleModelClose}
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminfont-cross"
                        role="button"
                        tabIndex={0}
                        onClick={handleModelClose}
                    ></span>
                    {
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
                    }
                </Dialog>
                {successMsg && (
                    <>
                        <div className="admin-notice-wrapper notice-error">
                            <i className="admin-font adminfont-info"></i>
                            <div className="notice-details">
                                <div className="title">Sorry!</div>
                                <div className="desc">{successMsg}</div>
                            </div>
                        </div>
                        <div className="admin-notice-wrapper">
                            <i className="admin-font adminfont-icon-yes"></i>
                            <div className="notice-details">
                                <div className="title">Success</div>
                                <div className="desc">{successMsg}</div>
                            </div>
                        </div>
                    </>
                )}
                <form className="dynamic-form">{renderForm()}</form>
            </div>
        </>
    );
};

export default AdminForm;
