/**
 * External dependencies
 */
import React, { JSX, useEffect, useRef, useState, lazy, Suspense } from 'react';
import type { ActionMeta, MultiValue, SingleValue } from 'react-select';
import { Dialog } from '@mui/material';

/**
 * Internal dependencies
 */
import SelectInput, { SelectOptions } from './SelectInput';
import Label from './Label';
import Section from './Section';
import BlockText from './BlockText';
import ButtonCustomizer from './ButtonCustomiser';
import FormCustomizer from './NotifimaFormCustomizer';
import FreeProFormCustomizer from './FreeProFormCustomizer';
import FromBuilder from './RegistrationForm';
import CatalogCustomizer from './CatalogCustomizer';
import MultiCheckboxTable from './MultiCheckboxTable';
import MergeComponent from './MergeComponent';
import ShortCodeTable from './ShortCodeTable';
import DoActionBtn from './DoActionBtn';
import DropDownMapping from './DropDownMapping';
import ToggleSetting from './ToggleSetting';
import { getApiLink, sendApiResponse } from '../utils/apiService';
import BasicInput from './BasicInput';
import TextArea from './TextArea';
import FileInput from './FileInput';
import CalendarInput from './CalendarInput';
import RadioInput from './RadioInput';
import MultiCheckBox from './MultiCheckbox';
import WpEditor from './WpEditor';
import Log from './Log';
import InputMailchimpList from './InputMailchimpList';
const LazyMapsInput = lazy(() => import('./MapsInput'));
import GoogleMap from './GoogleMap';
import Popup, { PopupProps } from './Popup';
import '../styles/web/AdminForm.scss';
import NestedComponent from './NestedComponent';
import ColorSettingInput from './ColorSettingInput';
import EndpointEditor from './EndpointEditor';
import PaymentTabsComponent from './PaymentTabsComponent';
import VerificationMethods from './VerificationMethods';
import SystemInfo from './SystemInfo';
import MultiInput from './MultiInput';

// Types
declare const wp: any;

const PENALTY = 10;
const COOLDOWN = 1;

interface DependentCondition {
    key: string;
    set?: boolean;
    value?: string | number | boolean;
}
interface MultiNumOption {
    key: string;
    value: string | number;
    label?: string;
    name?: string;
    type?: string;
    desc?: string;
    labelAfterInput?: boolean;
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
    key: string;
    id?: string;
    class?: string;
    name?: string;
    type?:
    | 'text'
    | 'select'
    | 'multi-select'
    | 'map'
    | 'google-map'
    | 'checkbox'
    | 'radio-color'
    | 'color-setting'
    | 'radio-select'
    | 'radio'
    | 'button'
    | 'password'
    | 'calender'
    | 'color'
    | 'email'
    | 'number'
    | 'range'
    | 'time'
    | 'file'
    | 'url'
    | 'textarea'
    | 'normalfile'
    | 'setting-toggle'
    | 'wpeditor'
    | 'label'
    | 'section'
    | 'blocktext'
    | 'button-customizer'
    | 'notifima-form-customizer'
    | 'form-customizer'
    | 'catalog-customizer'
    | 'multi-checkbox-table'
    | 'merge-component'
    | 'shortcode-table'
    | 'do-action-btn'
    | 'dropdown-mapping'
    | 'log'
    | 'system-info'
    | 'checkbox-custom-img'
    | 'api-connect'
    | 'nested'
    | 'payment-tabs'
    | 'multi-string'
    | 'verification-methods'
    | 'form-builder'
    | 'setting-time'
    | 'endpoint-editor';
    settingDescription?: string
    desc?: string;
    placeholder?: string;
    inputLabel?: string;
    rangeUnit?: string;
    min?: number;
    max?: number;
    icon?: string;
    iconEnable?: boolean;
    size?: string;
    preText?: string;
    postText?: string;
    proSetting?: boolean;
    moduleEnabled?: boolean;
    postInsideText?: string;
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
    range?: boolean;
    className?: string;
    selectDeselect?: boolean;
    look?: string;
    inputWrapperClass?: string;
    wrapperClass?: string;
    tour?: string;
    preInsideText?: string;
    rightContent?: boolean;
    dependentPlugin?: boolean;
    dependentSetting?: string;
    defaultValue?: string;
    valuename?: string;
    hint?: string;
    blocktext?: string;
    rows?: {
        key: string;
        label: string;
        options?: { value: string | number; label: string }[];
    }[];
    columns?: { key: string; label: string; moduleEnabled?: string }[];
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
    Lat?: number;
    Lng?: number;
    labelAfterInput?: boolean,
    single?: boolean;
    center?: Center;
    buttonEnable?: boolean
    nestedFields?: {
        key: string;
        type: 'number' | 'select';
        label: string;
        placeholder?: string;
        options?: { value: string; label: string }[];
    }[];
    addButtonLabel?: string;
    deleteButtonLabel?: string;
    categories?: {
        id: number;
        name: string;
        parent: number; // 0 means top-level category
    }[];
    showPreview?: boolean;
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
    customDefaults?: {
        buttonText?: string;
        buttonBg?: string;
        buttonBorder?: string;
        buttonHoverText?: string;
        buttonHoverBg?: string;
        buttonHoverBorder?: string;
        sidebarText?: string;
        sidebarBg?: string;
        sidebarActiveText?: string;
        sidebarActiveBg?: string;
    };
    modal?: { icon: string; id: string; label: string; connected: boolean; desc: string; formFields: { key: string; type: 'text' | 'password' | 'number' | 'checkbox'; label: string; placeholder?: string }[] }[];

}

type Center = {
    lat: number;
    lng: number;
};

interface SettingsType {
    modal: InputField[];
    submitUrl: string;
    id: string;
}
interface AdminFormProps {
    settings: SettingsType;
    proSetting: SettingsType;
    setting: any;
    updateSetting: any;
    modules: any;
    storeTabSetting?: any;
    appLocalizer: Record<string, any>; // Allows any structure
    Popup: typeof Popup;
    modulePopupFields?: PopupProps;
}

const AdminForm: React.FC<AdminFormProps> = ({
    setting,
    updateSetting,
    modules,
    appLocalizer,
    settings,
    storeTabSetting,
    Popup,
    modulePopupFields,
}) => {
    const { modal, submitUrl, id } = settings;
    const settingChanged = useRef<boolean>(false);
    const counter = useRef<number>(0);
    const counterId = useRef<NodeJS.Timeout | number>(0);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [modelOpen, setModelOpen] = useState<boolean>(false);
    const [modulePopupData, setModulePopupData] = useState<PopupProps>({
        moduleName: '',
        settings: '',
        plugin: '',
    });

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
                    ).then((response: any) => {
                        // Set success message for 2 seconds
                        setSuccessMsg(response.error);
                        setTimeout(() => setSuccessMsg(''), 2000);

                        // Redirect if the response has a redirect link
                        if (response.redirect_link) {
                            window.location.href = response.redirect_link;
                        }
                    });

                    clearInterval(intervalId);
                    counterId.current = 0;
                }
            }, 50);

            // Store the interval ID
            counterId.current = intervalId;
        }
    }, [setting, appLocalizer, submitUrl, id]);

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
        moduleEnabled: string | undefined,
        dependentSetting: string = '',
        dependentPlugin: boolean = false,
        dependentPluginName: string | undefined = ''
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
        event: any,
        key: string,
        type: 'single' | 'multiple' = 'single',
        fromType:
            | 'simple'
            | 'calender'
            | 'select'
            | 'multi-select'
            | 'wpeditor' = 'simple',
        arrayValue: any[] = []
    ) => {
        settingChanged.current = true;

        if (type === 'single') {
            if (fromType === 'simple') {
                updateSetting(key, event.target.value);
            } else if (fromType === 'calender') {
                let formattedDate: string;

                if (Array.isArray(event)) {
                    // Check if all elements are date ranges (start and end)
                    if (
                        event.every(
                            (item) =>
                                Array.isArray(item) && item.length === 2
                        )
                    ) {
                        formattedDate = event
                            .map((range) => {
                                const startDate = range[0]?.toString();
                                const endDate = range[1]?.toString();
                                return `${startDate} - ${endDate}`;
                            })
                            .join(', ');
                    } else {
                        formattedDate = event
                            .map((item) => item.toString())
                            .join(','); // Multiple dates format
                    }
                } else {
                    formattedDate = event.toString();
                }

                updateSetting(key, formattedDate);
            } else if (fromType === 'select') {
                updateSetting(key, arrayValue[event.index]);
            } else if (
                fromType === 'multi-select' ||
                fromType === 'wpeditor'
            ) {
                updateSetting(key, event);
            }
        } else {
            let prevData: string[] = setting[key] || [];
            if (!Array.isArray(prevData)) {
                prevData = [String(prevData)];
            }

            prevData = prevData.filter(
                (data) => data !== event.target.value
            );
            if (event.target.checked) {
                prevData.push(event.target.value);
            }
            updateSetting(key, prevData);
        }
    };

    const handleMultiNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key?: string,
        optionKey?: string
    ) => {
        if (!key || !optionKey) return;

        settingChanged.current = true;

        // Copy existing settings or initialize
        const currentValues: Record<string, string | number> = setting[key] || {};

        // Save in flattened key-value format
        currentValues[optionKey] = e.target.value;

        updateSetting(key, currentValues);
    };

    const handlMultiSelectDeselectChange = (
        key: string,
        options: { value: string; proSetting?: any }[],
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
                        !isProSetting(option.proSetting)
                )
                .map(({ value }) => value);

            updateSetting(key, newValue);
        }
    };

    const runUploader = (key: string): void => {
        settingChanged.current = true;

        // Create a new media frame
        const frame: any = wp.media({
            title: 'Select or Upload Media Of Your Chosen Persuasion',
            button: {
                text: 'Use this media',
            },
            multiple: false, // Set to true to allow multiple files to be selected
        });

        frame.on('select', function () {
            // Get media attachment details from the frame state
            const attachment = frame
                .state()
                .get('selection')
                .first()
                .toJSON();
            updateSetting(key, attachment.url);
        });

        // Finally, open the modal on click
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

    const shouldRender = (dependent: DependentCondition): boolean => {
        if (dependent.set === true && !isContain(dependent.key)) {
            return false;
        }
        if (dependent.set === false && isContain(dependent.key)) {
            return false;
        }
        if (
            dependent.value !== undefined &&
            !isContain(dependent.key, dependent.value)
        ) {
            return false;
        }
        return true;
    };

    const renderForm = () => {
        return modal.map((inputField: InputField) => {
            const value: any = setting[inputField.key] ?? '';
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

            // Set input field based on type
            switch (inputField.type) {
                case 'text':
                case 'url':
                case 'password':
                case 'email':
                case 'number':
                case 'range':
                case 'time':
                    input = (
                        <BasicInput
                            wrapperClass="setting-form-input"
                            descClass="settings-metabox-description"
                            description={inputField.desc}
                            key={inputField.key}
                            id={inputField.id}
                            name={inputField.name}
                            type={inputField.type}
                            placeholder={inputField.placeholder}
                            inputLabel={inputField.inputLabel} // for range input label
                            rangeUnit={inputField.rangeUnit} // for range parameter
                            min={inputField.min ?? 0} // for range min value
                            max={inputField.max ?? 50} // for range max value
                            value={value || inputField.value}
                            size={inputField.size}//Width of the input container.
                            preText={inputField.preText}//Content displayed before input (icon/text).
                            postText={inputField.postText}//Content displayed after input (icon/text).
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    handleChange(e, inputField.key);
                                }
                            }}
                            preInsideText={inputField.preInsideText}//Symbol/unit shown inside input at start.
                            postInsideText={inputField.postInsideText} // for showing text beside the text box
                            generate={inputField.generate}//Enables generate button for random/auto value generation.
                        />
                    );
                    break;
                case 'textarea':
                    input = (
                        <TextArea
                            wrapperClass="setting-from-textarea"
                            inputClass={`${inputField.class || 'textarea-input'}`}
                            descClass="settings-metabox-description"
                            description={inputField.desc}
                            key={inputField.key}
                            id={inputField.id}
                            name={inputField.name}
                            placeholder={inputField.placeholder}
                            rowNumber={inputField.rowNumber} // for row number value
                            colNumber={inputField.colNumber} // for column number value
                            value={value || inputField.value}
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={(e) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    handleChange(e, inputField.key);
                                }
                            }}
                        />
                    );
                    break;
                case 'normalfile':
                    input = (
                        <BasicInput
                            inputClass="setting-form-input"
                            type="file"
                            key={inputField.key}
                            name={inputField.name}
                            value={value}// current value of the file input (usually a file path or File object)
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={(e) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    handleChange(e, inputField.key);
                                }
                            }}
                        />
                    );
                    break;
                case 'file':
                    input = (
                        <FileInput
                            descClass="settings-metabox-description"
                            description={inputField.desc}
                            inputClass={`${inputField.key} basic-input`}
                            imageSrc={
                                value !== undefined
                                    ? String(value)
                                    : appLocalizer?.default_logo
                            }
                            imageWidth={inputField.width} // for width
                            imageHeight={inputField.height} // for height
                            buttonClass="admin-btn btn-purple"
                            openUploader={appLocalizer?.open_uploader} // for upload button text
                            type="hidden"
                            key={inputField.key}
                            name={inputField.name}
                            value={value !== undefined ? String(value) : ''}
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            size={inputField.size}
                            onChange={(e) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    handleChange(e, inputField.key);
                                }
                            }}
                            onButtonClick={() => {
                                runUploader(inputField.key);
                            }}
                        />
                    );
                    break;
                // Check in MVX
                case 'color':
                    input = (
                        <BasicInput
                            wrapperClass="settings-color-picker"
                            inputClass="setting-color-picker"
                            descClass="settings-metabox-description"
                            description={inputField.desc}// optional description displayed under the input
                            key={inputField.key}
                            id={inputField.id}
                            name={inputField.name}
                            type={inputField.type}
                            value={value || '#000000'}// current value of the input; defaults to black if empty
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={(e) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    handleChange(e, inputField.key);
                                }
                            }}
                        />
                    );
                    break;
                case 'calender':
                    input = (
                        <CalendarInput
                            wrapperClass="settings-calender"
                            inputClass="teal"
                            multiple={inputField.multiple || false} //for single or mutiple input (true/false)
                            range={inputField.range || false} // for range select (true/false)
                            value={setting[inputField.key] || ''}
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={(e) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    handleChange(
                                        e,
                                        inputField.key,
                                        'single',
                                        [
                                            'calender',
                                            'select',
                                            'multi-select',
                                            'wpeditor',
                                        ].includes(inputField.type ?? '')
                                            ? (inputField.type as
                                                | 'calender'
                                                | 'select'
                                                | 'multi-select'
                                                | 'wpeditor')
                                            : 'simple' // Default for unsupported types
                                    );
                                }
                            }}
                        />
                    );
                    break;
                // Check in MVX
                case 'map':
                    input = (
                        <Suspense fallback={<div>Loading map...</div>}>
                            <LazyMapsInput
                                wrapperClass="settings-basic-input-class"
                                descClass="settings-metabox-description"
                                description={inputField.desc}// optional description displayed under the map input
                                containerId="store-maps"
                                containerClass="store-maps gmap"
                                proSetting={isProSetting(
                                    inputField.proSetting ?? false
                                )}
                                Lat={inputField.Lat} //for latitude
                                Lng={inputField.Lng} // for longitude
                            />
                        </Suspense>
                    );
                    break;
                // Check in MVX
                case 'google-map':
                    input = (
                        <GoogleMap
                            wrapperClass="settings-basic-input-class"
                            placeholder="Enter location"// placeholder text displayed in the search input
                            center={
                                inputField.center ?? { lat: -22.0, lng: 22.5 }
                            } // for default location
                        />
                    );
                    break;
                // Check in MVX
                case 'button':
                    input = (
                        <div className="form-button-group">
                            <div className="settings-input-content">
                                <BasicInput
                                    wrapperClass="settings-basic-input-class"
                                    inputClass="admin-btn btn-purple"
                                    descClass="settings-metabox-description"
                                    description={inputField.desc}// optional description displayed under the input
                                    name={inputField.name}// name attribute for the input
                                    type={inputField.type}// input type (text, number, password, etc.)
                                    placeholder={inputField.placeholder}// placeholder text inside the input
                                    proSetting={isProSetting(
                                        inputField.proSetting ?? false
                                    )}
                                // onChange={handleChange}
                                />
                            </div>
                        </div>
                    );
                    break;

                case 'multi-string':
                    input = (
                        <MultiInput
                            inputType="multi-string"
                            wrapperClass="setting-form-multi-input"
                            inputClass="basic-input"
                            buttonClass="admin-btn btn-purple"
                            listClass="multi-list"
                            itemClass="multi-item"
                            deleteBtnClass="admin-btn btn-red"
                            placeholder={inputField.placeholder}// placeholder text inside the input
                            values={value}
                            name={inputField.key}
                            proSetting={isProSetting(inputField.proSetting ?? false)}
                            description={inputField.desc}// optional description shown below the input
                            descClass="settings-metabox-description"
                            onStringChange={(e) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(inputField.moduleEnabled ?? ''),
                                        String(inputField.dependentSetting ?? ''),
                                        String(inputField.dependentPlugin ?? '')
                                    )
                                ) {
                                    handleChange(e, inputField.key);
                                }
                            }}
                        />
                    );
                    break;
                case 'radio':
                    input = (
                        <RadioInput
                            wrapperClass="settings-form-group-radio"
                            inputWrapperClass="radio-basic-input-wrap"
                            inputClass="setting-form-input"
                            descClass="settings-metabox-description"
                            activeClass="radio-select-active"
                            description={inputField.desc}// optional description displayed below the radio group
                            value={
                                typeof value === 'number'
                                    ? value.toString()
                                    : value
                            }
                            name={inputField.name}
                            keyName={inputField.key}
                            options={Array.isArray(value) ? value : []}// array of radio options (ensure it's an array)
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={(e) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    handleChange(e, inputField.key);
                                }
                            }}
                        />
                    );
                    break;
                // for radio select button with image hover
                case 'radio-select':
                    input = (
                        <RadioInput
                            wrapperClass="form-group-radio-select"
                            inputWrapperClass="radioselect-class"
                            inputClass="setting-form-input"
                            radiSelectLabelClass="radio-select-under-label-class"
                            labelImgClass="section-img-fluid"
                            labelOverlayClass="radioselect-overlay-text"
                            labelOverlayText="Select your Store"
                            idPrefix="radio-select-under"
                            descClass="settings-metabox-description"
                            activeClass="radio-select-active"
                            description={inputField.desc}// optional description displayed under the radio group
                            type="radio-select"// input type indicating this is a custom radio select
                            value={
                                typeof value === 'number'
                                    ? value.toString()
                                    : value
                            }
                            name={inputField.name}
                            keyName={inputField.key}
                            options={Array.isArray(inputField.options) ? inputField.options : []}// array of radio options
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={(e) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    handleChange(e, inputField.key);
                                }
                            }}
                        />
                    );
                    break;

                // Check in MVX
                case 'color-setting':
                    input = (
                        <ColorSettingInput
                            wrapperClass="form-group-color-setting"
                            inputClass="setting-form-input"
                            descClass="settings-metabox-description"
                            description={inputField.desc}// optional description displayed under the input
                            showPreview={inputField.showPreview ?? false}// whether to show a color preview box
                            predefinedOptions={inputField.predefinedOptions ?? []} // array of predefined color options for quick selection
                            images={inputField.images ?? []}// optional array of images associated with colors
                            value={value}// currently selected color value
                            idPrefix="color-setting"
                            onChange={(e) => handleChange(e, inputField.key)}
                        />
                    );
                    break;

                // Normal select box
                case 'select':
                    input = (
                        <SelectInput
                            wrapperClass="form-select-field-wrapper"
                            descClass="settings-metabox-description"
                            name={inputField.key}
                            description={inputField.desc}// optional description displayed below the select input
                            inputClass={inputField.className}
                            options={
                                Array.isArray(inputField.options)
                                    ? inputField.options.map((opt) => ({
                                        value: String(opt.value),
                                        label:
                                            opt.label ?? String(opt.value),
                                    }))
                                    : []
                            }
                            value={
                                typeof value === 'number'
                                    ? value.toString()
                                    : value
                            }
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={onSelectChange}
                        />
                    );
                    break;

                // for multiple select box with select/deselect button
                case 'multi-select':
                    input = (
                        <SelectInput
                            name={inputField.key}
                            wrapperClass="settings-from-multi-select"
                            descClass="settings-metabox-description"
                            selectDeselectClass="btn-purple select-deselect-trigger"
                            selectDeselect={inputField.selectDeselect}
                            selectDeselectValue="Select / Deselect All"// text for select/deselect all button
                            description={inputField.desc}// optional description displayed below the select
                            inputClass={inputField.key}
                            options={
                                Array.isArray(inputField.options)
                                    ? inputField.options.map((opt) => ({
                                        value: String(opt.value),
                                        label:
                                            opt.label ?? String(opt.value),
                                    }))
                                    : []
                            }
                            type="multi-select"// input type; allows multiple selections
                            value={
                                typeof value === 'number'
                                    ? value.toString()
                                    : value
                            }
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={onSelectChange}
                            onMultiSelectDeselectChange={() =>
                                handlMultiSelectDeselectChange(
                                    inputField.key,
                                    Array.isArray(inputField.options)
                                        ? inputField.options.map((opt) => ({
                                            value: String(opt.value),
                                            label:
                                                opt.label ??
                                                String(opt.value),
                                        }))
                                        : [], // Ensure options is always an array
                                    'multi-select'
                                )
                            }
                        />
                    );
                    break;
                // For single or multiple checkbox (free / pro or some free some pro)
                case 'checkbox':
                    let normalizedValue: string[] = [];

                    if (Array.isArray(value)) {
                        normalizedValue = value.filter(v => v && v.trim() !== "");
                    } else if (typeof value === 'string' && value.trim() !== "") {
                        normalizedValue = [value];
                    }
                    input = (
                        <MultiCheckBox
                            khali_dabba={appLocalizer?.khali_dabba ?? false}
                            wrapperClass={
                                inputField.look === 'toggle' ? 'toggle-btn' : inputField.selectDeselect === true ? 'checkbox-list-side-by-side' : 'simple-checkbox'
                            }
                            descClass="settings-metabox-description"
                            description={inputField.desc}
                            selectDeselectClass="admin-btn btn-purple select-deselect-trigger"
                            inputWrapperClass="toggle-checkbox-header"
                            inputInnerWrapperClass={
                                inputField.look === 'toggle'
                                    ? 'toggle-checkbox'
                                    : 'default-checkbox'
                            } // this props for change classes default/ Toggle
                            inputClass={inputField.class}
                            tour={inputField.tour}// optional guided tour tooltip
                            hintOuterClass="settings-metabox-description"
                            hintInnerClass="hover-tooltip"
                            idPrefix="toggle-switch"
                            selectDeselect={inputField.selectDeselect}// enable "Select / Deselect All"
                            selectDeselectValue="Select / Deselect All"// text for select/deselect all
                            rightContentClass="settings-metabox-description"
                            rightContent={inputField.rightContent} // for place checkbox right
                            options={
                                Array.isArray(inputField.options)
                                    ? inputField.options.map((opt) => ({
                                        ...opt,
                                        value: String(opt.value),
                                    }))
                                    : []
                            }
                            value={normalizedValue}
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={(e) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    handleChange(
                                        e,
                                        inputField.key,
                                        'multiple'
                                    );
                                }
                            }}
                            onMultiSelectDeselectChange={() =>
                                handlMultiSelectDeselectChange(
                                    inputField.key,
                                    Array.isArray(inputField.options)
                                        ? inputField.options.map((opt) => ({
                                            ...opt,
                                            value: String(opt.value),
                                        }))
                                        : []
                                )
                            }
                            proChanged={() => setModelOpen(true)}
                        />
                    );
                    break;
                // Checkbox with custom image
                case 'checkbox-custom-img':
                    input = (
                        <MultiCheckBox
                            khali_dabba={appLocalizer?.khali_dabba ?? false}
                            wrapperClass={inputField.wrapperClass}
                            inputWrapperClass={inputField.inputWrapperClass}
                            type="checkbox-custom-img"
                            inputInnerWrapperClass={
                                inputField.look === 'toggle'
                                    ? 'toggle-checkbox'
                                    : 'default-checkbox'
                            } // this props for change classes default/ Toggle
                            idPrefix="toggle-switch"
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            description={inputField.desc}
                            descClass="settings-metabox-description"
                            value={
                                Array.isArray(value)
                                    ? value
                                    : [String(value)]
                            }
                            options={inputField.syncDirections ?? []} // array includes label, value, img1, img2
                            onChange={(data) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    settingChanged.current = true;
                                    updateSetting(inputField.key, data);
                                }
                            }}
                        />
                    );

                    break;
                // Rectangle radio toggle button
                case 'setting-toggle':
                    input = (
                        <ToggleSetting
                            khali_dabba={appLocalizer?.khali_dabba ?? false}
                            wrapperClass={`setting-form-input`}
                            descClass="settings-metabox-description"
                            description={inputField.desc}
                            key={inputField.key}
                            iconEnable={inputField.iconEnable}// If true, will display the toggle value as an icon
                            multiSelect={inputField.multiSelect}// If true, allows selecting multiple options (checkboxes), else single select (radio)
                            preText={inputField.preText}// Optional content displayed before the toggle group
                            postText={inputField.postText}// Optional content displayed after the toggle group
                            options={
                                Array.isArray(inputField.options)
                                    ? inputField.options.map((opt) => ({
                                        ...opt,
                                        value: String(opt.value), // this can be an icon class
                                    }))
                                    : []
                            }
                            value={
                                inputField.multiSelect
                                    ? (Array.isArray(value) ? value : [String(value ?? inputField.defaultValue ?? '')])
                                    : String(value ?? inputField.defaultValue ?? '')
                            }
                            proSetting={isProSetting(inputField.proSetting ?? false)}
                            onChange={(data) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(inputField.moduleEnabled ?? ''),
                                        String(inputField.dependentSetting ?? ''),
                                        String(inputField.dependentPlugin ?? '')
                                    )
                                ) {
                                    settingChanged.current = true;
                                    updateSetting(inputField.key, data);
                                }
                            }}
                            proChanged={() => setModelOpen(true)}
                        />
                    );
                    break;

                // Check in MVX
                case 'wpeditor':
                    input = (
                        <WpEditor
                            apiKey={String(
                                appLocalizer?.mvx_tinymce_key || ''
                            )}
                            value={String(value)}
                            onEditorChange={(e) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    handleChange(
                                        e,
                                        inputField.key,
                                        'single',
                                        'wpeditor'
                                    );
                                }
                            }}
                        />
                    );
                    break;
                // Check in MVX
                case 'label':
                    input = (
                        <Label
                            wrapperClass="form-group-only-label"
                            descClass="settings-metabox-description"
                            value={String(inputField.valuename)}//The actual text of the label.
                            description={inputField.desc}//Optional descriptive text, often used for guidance or help text.
                        />
                    );
                    break;
                // For separation (if you want heading in line then put desc or add some description then add hint)
                case 'section':
                    input = (
                        <Section
                            key={`${inputField.key}`}
                            wrapperClass="divider-section"
                            value={inputField.label}//Optional main heading/title of the section.
                            hint={inputField.hint}//Optional hint or subtext below the title, can include HTML.
                            description={inputField.desc}//Optional descriptive text displayed below the hint.
                        />
                    );
                    break;

                case 'blocktext':
                    input = (
                        <BlockText
                            key={inputField.blocktext}
                            blockTextClass="settings-metabox-note"
                            value={String(inputField.blocktext)}// Text or HTML content to display inside the block (safe HTML injected).
                        />
                    );
                    break;
                // Special input type project specific
                // customize button
                case 'button-customizer':
                    input = (
                        <ButtonCustomizer
                            text={
                                setting[inputField.key]?.button_text ||
                                'Button Text'
                            }// The label shown on the button (fallback to "Button Text" if not set).
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            setting={setting[inputField.key]}
                            onChange={(
                                key,
                                data,
                                isRestoreDefaults = false
                            ) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    settingChanged.current = true;
                                    if (isRestoreDefaults) {
                                        updateSetting(inputField.key, data);
                                    } else {
                                        updateSetting(inputField.key, {
                                            ...setting[inputField.key],
                                            [key]: data,
                                        });
                                    }
                                }
                            }}
                        />
                    );
                    break;
                case 'notifima-form-customizer':
                    input = (
                        <FormCustomizer
                            value={String(value)}
                            buttonText={
                                (setting.customize_btn &&
                                    setting.customize_btn.button_text) ||
                                'Submit'
                            }
                            setting={setting}
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={(e, key) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    settingChanged.current = true;
                                    updateSetting(e, key);
                                }
                            }}
                        />
                    );
                    break;
                // custom from with free-pro tab
                case 'form-customizer':
                    input = (
                        <FreeProFormCustomizer
                            key={inputField.key}
                            setting={setting}
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            proSettingChange={() =>
                                proSettingChanged(
                                    inputField.proSetting ?? false
                                )
                            }
                            moduleEnabledChange={() =>
                                moduleEnabledChanged(
                                    String(inputField.moduleEnabled ?? '')
                                )
                            }
                            onChange={(key, data) => {
                                settingChanged.current = true;
                                updateSetting(key, data);
                            }}
                        />
                    );
                    break;
                // shop page builder( use in catalogx )
                case 'catalog-customizer':
                    input = (
                        <CatalogCustomizer
                            setting={setting}
                            proSetting={appLocalizer?.khali_dabba ?? false}
                            onChange={(key, data) => {
                                settingChanged.current = true;
                                updateSetting(key, data);
                            }}
                            SampleProduct="#"
                            proUrl="#"
                        />
                    );
                    break;
                // for Grid-table input with multiple checkbox
                case 'multi-checkbox-table':
                    input = (
                        <MultiCheckboxTable
                            rows={inputField.rows ?? []} // row array
                            columns={inputField.columns ?? []} // columns array
                            description={String(inputField.desc)}
                            setting={setting}
                            storeTabSetting={storeTabSetting}
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            modules={modules}//Active module list for dependency validation.
                            onChange={(key, data) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    settingChanged.current = true;
                                    updateSetting(key, data);
                                }
                            }}
                            moduleChange={(moduleEnabled) => {
                                setModelOpen(true);
                                setModulePopupData({
                                    moduleName: moduleEnabled,
                                    settings: '',
                                    plugin: '',
                                });
                            }}
                        />
                    );
                    break;
                // Check in MVX
                case 'merge-component':
                    input = (
                        <MergeComponent
                            wrapperClass={`setting-form-input`}
                            descClass="settings-metabox-description"
                            description={inputField.desc}// Help text / description displayed below the component
                            value={
                                typeof value === 'object' && value !== null
                                    ? value
                                    : {}// Current value (ensures it’s an object, else fallback to empty object)
                            }
                            fields={
                                Array.isArray(inputField.fields)
                                    ? inputField.fields
                                    : []// List of field definitions (each has name, type, options, etc.)
                            }
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            onChange={(data) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    settingChanged.current = true;
                                    updateSetting(inputField.key, data);
                                }
                            }}
                        />
                    );
                    break;
                // for shortcode name and description
                case 'shortcode-table':
                    input = (
                        <ShortCodeTable
                            descClass="settings-metabox-description"
                            description={inputField.desc}// Help text / description shown under the table
                            key={inputField.key}
                            icon={inputField.icon}
                            options={
                                Array.isArray(inputField.options)
                                    ? inputField.options
                                    : []
                            } // array includes label and description
                            optionLabel={inputField.optionLabel}// Label header for the options column
                        />
                    );
                    break;
                // Synchronize button
                case 'do-action-btn':
                    input = (
                        <DoActionBtn
                            appLocalizer={appLocalizer}
                            buttonKey={inputField.key}
                            apilink={String(inputField.apilink)} // API endpoint to trigger the action
                            value={String(inputField.value)}
                            description={String(inputField.desc)}
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            proSettingChanged={() =>
                                proSettingChanged(
                                    inputField.proSetting ?? false
                                )
                            }
                            interval={Number(inputField.interval)}// Time interval (e.g., for polling or scheduling tasks)
                            tasks={inputField.tasks ?? []}// List of tasks/actions handled by this button
                            parameter={String(inputField.parameter)} // api for each status of synchronization
                        />
                    );
                    break;
                // attribute mapping
                case 'dropdown-mapping':
                    input = (
                        <DropDownMapping
                            description={inputField.desc}
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            proSettingChanged={() =>
                                proSettingChanged(
                                    inputField.proSetting ?? false
                                )
                            }
                            value={
                                Array.isArray(value)
                                    ? (value as [string, string][])
                                    : [['key', String(value)]]
                            }
                            syncFieldsMap={inputField.syncFieldsMap ?? {}}// Map of available sync fields for systems (default to empty object if not provided)
                            onChange={(data) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    settingChanged.current = true;
                                    updateSetting(inputField.key, data);
                                }
                            }}
                        />
                    );
                    break;

                case 'log':
                    input = (
                        <Log
                            appLocalizer={appLocalizer}
                            apiLink={String(inputField.apiLink)} // api to fetch and download the log content
                            downloadFileName={String(inputField.fileName)}
                        />
                    ); // log file name
                    break;
                case 'system-info':
                    input = (
                        <SystemInfo
                            appLocalizer={appLocalizer}
                            apiLink={String(inputField.apiLink)}
                            copyButtonLabel={inputField.copyButtonLabel}//The button text before copying (e.g., “Copy Info”).
                            copiedLabel={inputField.copiedLabel}//The text shown after copying (e.g., “Copied!”).
                        />
                    );
                    break;

                // For mailchimp list
                case 'api-connect':
                    input = (
                        <InputMailchimpList
                            appLocalizer={appLocalizer}
                            setting={setting}
                            updateSetting={updateSetting}
                            mailchimpKey={inputField.key}
                            selectKey={String(inputField.selectKey)}//Stores which Mailchimp list is chosen.
                            optionKey={String(inputField.optionKey)}//Stores all available lists fetched from Mailchimp.
                            onChange={handleChange}
                            proSettingChanged={() =>
                                proSettingChanged(
                                    inputField.proSetting ?? false
                                )
                            }
                            settingChanged={settingChanged}
                            apiLink={String(inputField.apiLink)} //The API URL to fetch Mailchimp lists from.
                        />
                    );
                    break;

                case 'form-builder':
                    input = (
                        <FromBuilder
                            name={inputField.key}
                            proSettingChange={() =>
                                proSettingChanged(
                                    inputField.proSetting ?? false
                                )
                            }
                            onChange={(value) => {
                                settingChanged.current = true;
                                updateSetting(inputField.key, value);
                            }}
                            setting={setting}
                        />
                    );
                    break;
                case 'nested':
                    input = (
                        <NestedComponent
                            key={inputField.key}
                            id={inputField.key}
                            label={inputField.label}
                            description={inputField.desc}
                            fields={inputField.nestedFields ?? []}//The list of inner fields that belong to this section.
                            value={value}
                            addButtonLabel={inputField.addButtonLabel}//The text shown on the button to add a new item.
                            deleteButtonLabel={inputField.deleteButtonLabel}//The text shown on the button to remove an item.
                            single={inputField.single}//If set to true, only one item is allowed.
                            onChange={(val: any) => {
                                if (
                                    hasAccess(
                                        inputField.proSetting ?? false,
                                        String(
                                            inputField.moduleEnabled ?? ''
                                        ),
                                        String(
                                            inputField.dependentSetting ?? ''
                                        ),
                                        String(
                                            inputField.dependentPlugin ?? ''
                                        )
                                    )
                                ) {
                                    updateSetting(inputField.key, val);
                                    settingChanged.current = true;
                                }
                            }}
                        />
                    );
                    break;
                case 'verification-methods':
                    input = (
                        <VerificationMethods
                            key={inputField.key}
                            label={inputField.label}//Section label/title.
                            nestedFields={inputField.nestedFields ?? []}//Array of nested input fields for verification method configuration.
                            addButtonLabel={inputField.addButtonLabel}//Label text for the "Add" button.
                            deleteButtonLabel={inputField.deleteButtonLabel}//Label text for the "Delete" button.
                            value={value}
                            onChange={(val) => {
                                updateSetting(inputField.key, val);
                                settingChanged.current = true;
                            }}
                        />
                    );
                    break;

                case 'endpoint-editor':
                    input = (
                        <EndpointEditor
                            name={inputField.key}
                            proSetting={isProSetting(
                                inputField.proSetting ?? false
                            )}
                            proSettingChanged={() =>
                                proSettingChanged(
                                    inputField.proSetting ?? false
                                )
                            }
                            apilink={String(inputField.apiLink)}//API URL for backend communication.
                            appLocalizer={appLocalizer}
                            onChange={(data) => {
                                settingChanged.current = true;
                                updateSetting(inputField.key, data);
                            }}
                        />
                    );
                    break;
                case 'payment-tabs':
                    input = (
                        <PaymentTabsComponent
                            key={inputField.key}
                            name={inputField.key}
                            proSetting={isProSetting(inputField.proSetting ?? false)}
                            proSettingChanged={() =>
                                proSettingChanged(inputField.proSetting ?? false)
                            }
                            apilink={String(inputField.apiLink)}//API endpoint used for communication with backend.
                            appLocalizer={appLocalizer}
                            methods={inputField.modal ?? []}//Array of available payment methods/options.
                            buttonEnable={inputField.buttonEnable}//Flag to enable/disable action buttons in the UI.
                            value={value || {}}
                            onChange={(data) => {
                                settingChanged.current = true;
                                updateSetting(inputField.key, data);
                            }}
                        />
                    );
                    break;
            }

            return inputField.type === 'section' ||
                inputField.label === 'no_label' ? (
                <>{input}</>
            ) : (
                <div
                    key={'g' + inputField.key}
                    className={`form-group ${inputField.classes ? inputField.classes : ''
                        }`}
                >
                    {inputField.label && inputField.type !== 'catalog-customizer' &&
                        inputField.type !== 'form-customizer' && (
                            <label
                                className="settings-form-label"
                                key={'l' + inputField.key}
                                htmlFor={inputField.key}
                            >
                                <div className="title">{inputField.label}</div>
                                <div className="settings-metabox-description">{inputField.settingDescription}</div>
                            </label>
                        )}

                    <div className="settings-input-content">{input}</div>
                </div>
            );
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
                        className="admin-font adminlib-cross"
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
                            pluginDescription={
                                modulePopupFields?.pluginDescription
                            }
                            pluginButton={modulePopupFields?.pluginButton}
                            SettingDescription={
                                modulePopupFields?.SettingDescription
                            }
                            pluginUrl={modulePopupFields?.pluginUrl}
                            modulePageUrl={modulePopupFields?.modulePageUrl}
                        />
                    }
                </Dialog>
                {successMsg && (
                    <>
                        <div className="admin-notice-wrapper notice-error">
                            <i className="admin-font adminlib-info"></i>
                            <div className="notice-details">
                                <div className="title">oops!</div>
                                <div className="desc">{successMsg}</div>
                            </div>
                        </div>
                        <div className="admin-notice-wrapper">
                            <i className="admin-font adminlib-icon-yes"></i>
                            <div className="notice-details">
                                <div className="title">Great!</div>
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
