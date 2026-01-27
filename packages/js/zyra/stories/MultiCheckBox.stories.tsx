import MultiCheckbox from '../src/components/MultiCheckbox';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../src/styles/common.scss';
const meta: Meta<typeof MultiCheckbox> = {
    title: 'Zyra/Components/MultiCheckbox',
    component: MultiCheckbox,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MultiCheckbox>;

const appLocalizer = {
    khali_dabba: false,
};

const setting = { dependentSetting: ['asdf', 'asdf2'] };

type inputFieldType = {
    key: string;
    moduleEnabled?: string;
    proSetting?: boolean;
    dependentPlugin?: boolean;
    dependentPluginName?: string;
    dependentSetting?: string;
};

const inputField: inputFieldType = {
    key: 'test-multi-checkbox',
    // proSetting:false,
    // dependentPlugin: true,
    // dependentPluginName: "demo-plugin",
    // dependentSetting: "dependentSetting123",
};

const modules = ['demo1', 'demo2'];
const moduleOpen = () => {
    console.log('Module Opened');
};

const handleChange = (e, key, val) => {
    console.log(`Changed: ${key} to ${val}`, e.target.value);
};

const moduleEnabledChanged = (
    moduleEnabled: string | undefined,
    dependentSetting: string | undefined = '',
    dependentPlugin: boolean | undefined = false,
    dependentPluginName: string | undefined = ''
): boolean => {
    console.log('Module Enabled Changed:', {
        moduleEnabled,
        dependentSetting,
        dependentPlugin,
        dependentPluginName,
    });
    const popupData = {
        moduleName: '',
        settings: '',
        plugin: '',
    };

    if (moduleEnabled && !modules.includes(moduleEnabled)) {
        console.log('Module not found:', moduleEnabled);
        popupData.moduleName = moduleEnabled;
    }

    if (
        dependentSetting &&
        Array.isArray(setting[dependentSetting]) &&
        setting[dependentSetting].length === 0
    ) {
        console.log('Dependent setting not found:', dependentSetting);
        popupData.settings = dependentSetting;
    }

    if (!dependentPlugin) {
        console.log('Dependent plugin not found:', dependentPluginName);
        popupData.plugin = dependentPluginName;
    }

    if (popupData.moduleName || popupData.settings || popupData.plugin) {
        moduleOpen();
        moduleOpen();
        return true;
    }

    return false;
};

const proSettingChanged = (isProSetting: boolean): boolean => {
    if (isProSetting && !appLocalizer?.khali_dabba) {
        console.log('Pro setting');
        moduleOpen();
        return true;
    }
    return false;
};
const change = (e: React.ChangeEvent<HTMLInputElement> | string[]) => {
    if (
        !proSettingChanged(inputField.proSetting ?? false) &&
        !moduleEnabledChanged(
            inputField.moduleEnabled ?? '',
            inputField.dependentSetting ?? '',
            inputField.dependentPlugin ?? true,
            inputField.dependentPluginName ?? ''
        )
    ) {
        if (Array.isArray(e as string[])) {
            console.log('value changed : ', e);
            return;
        }
        handleChange(e, inputField.key, 'multiple');
    }
};

const commonProps = {
    wrapperClass: 'checkbox-list-side-by-side',
    descClass: 'settings-metabox-description',
    selectDeselectClass: 'admin-btn btn-purple',
    inputWrapperClass: 'toggle-checkbox-header',
    hintOuterClass: 'settings-metabox-description',
    hintInnerClass: 'hover-tooltip',
    idPrefix: 'toggle-switch',
    selectDeselectValue: 'Select / Deselect All',
    rightContentClass: 'settings-checkbox-description',
    onChange: change,
    onMultiSelectDeselectChange: (e) => {
        console.log('Select/Deselect clicked:', e);
    },
    proChanged: () => {
        console.log('Pro setting toggled');
    },
};

export const TestMultiCheckboxSingle: Story = {
    args: {
        khali_dabba: appLocalizer?.khali_dabba,
        description: `Redirect users to the homepage when they click on the cart or checkout page. To customize the redirection to a different page, an upgrade to Pro <a href="https://multivendorx.com/woocommerce-request-a-quote-product-catalog/" target="_blank">WooCommerce Catalog Enquiry Pro</a>.`,
        inputInnerWrapperClass: 'toggle-checkbox',
        inputClass: '',
        selectDeselect: false,
        rightContent: false,
        options: [
            {
                key: 'sample_checkbox',
                label: "If enabled, non-logged-in users can't access the enquiry flow.",
                value: 'sample_checkbox',
            },
        ],
        value: [],
        ...commonProps,
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper' ><MultiCheckbox key={'sample_checkbox'} {...args} /></div>;
    },
};

export const TestMultiCheckboxMulti: Story = {
    args: {
        khali_dabba: appLocalizer?.khali_dabba,
        description: ``,
        inputInnerWrapperClass: 'toggle-checkbox',
        inputClass: '',
        selectDeselect: true,
        rightContent: true,
        options: [
            {
                key: 'sync_courses_category',
                label: 'Course categories',
                hints: 'Scan the entire Moodle course category structure and synchronize it with the WordPress category listings.',
                value: 'sync_courses_category',
            },
            {
                key: 'sync_courses_sku',
                label: 'Course ID number - Product SKU',
                hints: 'Retrieves the course ID number and assigns it as the product SKU.',
                value: 'sync_courses_sku',
                proSetting: true,
            },
            {
                key: 'sync_image',
                label: 'Course image',
                hints: 'Copies course images and sets them as WooCommerce product images.',
                value: 'sync_image',
                proSetting: true,
            },
        ],
        value: [],
        ...commonProps,
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper' ><MultiCheckbox key={'sync-course-options'} {...args} /></div>;
    },
};

export const TestMultiCheckboxMultiDefault: Story = {
    args: {
        khali_dabba: appLocalizer?.khali_dabba,
        description: ``,
        inputInnerWrapperClass: 'default-checkbox',
        inputClass: '',
        options: [
            {
                key: 'outofstock',
                label: 'Out of stock',
                value: 'outofstock',
            },
            {
                key: 'onbackorder',
                label: 'On backorder',
                value: 'onbackorder',
            },
        ],
        value: [],
        ...commonProps,
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper' ><MultiCheckbox key={'sync-course-options'} {...args} /></div>;
    },
};

export const TestSyncCheckboxMulti: Story = {
    args: {
        khali_dabba: false,
        description: `Choose how you want to sync`,
        inputInnerWrapperClass: 'custom-sync-section',
        inputClass: '',
        type: 'checkbox-custom-img',
        options: [
            {
                key: 'sync1',
                value: 'sync-1',
                img1: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiQqvP9mSAN_KNxZlbvD9VT-yl4Vf_PuT6Cw&s',
                img2: 'https://yt3.googleusercontent.com/ytc/AIdro_kR_OL7VBS0aarqPDBdteER4K2ANhWx18OKIDw7qDhVWiQ=s900-c-k-c0x00ffffff-no-rj',
                label: 'Sync Option 1',
            },
            {
                key: 'sync2',
                value: 'sync-2',
                img1: 'https://yt3.googleusercontent.com/ytc/AIdro_kR_OL7VBS0aarqPDBdteER4K2ANhWx18OKIDw7qDhVWiQ=s900-c-k-c0x00ffffff-no-rj',
                img2: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiQqvP9mSAN_KNxZlbvD9VT-yl4Vf_PuT6Cw&s',
                label: 'Sync Option 2',
            },
        ],
        value: ['sync-2'],
        ...commonProps,
        wrapperClass: 'custom-sync-section',
        inputWrapperClass: 'sync-direction-items',
        proSetting: true,
        onChange: () => change([''] as string[]),
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper' ><MultiCheckbox key={'sync-course-options'} {...args} /></div>;
    },
};

export const ProUnlocked: Story = {
    args: {
        khali_dabba: false,
        description: `This is a pro setting unlocked example.`,
        options: [
            {
                key: 'pro1',
                label: 'Pro Option',
                value: 'pro1',
                proSetting: true,
            },
        ],
        value: [],
        ...commonProps,
    },
};

export const RadioMode: Story = {
    args: {
        type: 'radio',
        options: [
            { key: 'r1', label: 'Radio 1', value: 'radio1' },
            { key: 'r2', label: 'Radio 2', value: 'radio2' },
        ],
        value: ['radio1'],
        khali_dabba: false,
        ...commonProps,
    },
};

export const PrePostText: Story = {
    args: {
        preText: '<strong>Before</strong>',
        postText: '<em>After</em>',
        options: [
            { key: 'p', label: 'Wrapped Option', value: 'p' },
        ],
        value: [],
        khali_dabba: false,
        ...commonProps,
    },
};
