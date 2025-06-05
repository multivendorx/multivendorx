import MultiCheckbox from "../src/components/MultiCheckbox";

export default {
    title: "Zyra/Components/MultiCheckbox",
    component: MultiCheckbox,
};

const appLocalizer = {
    khali_dabba: false,
}

const inputField = {
    key: "test-multi-checkbox",
    proSetting:false,
    moduleEnabled: "enabled",
}

const modules = ["enabled", "disabled"];

export const TestMultiCheckbox = () => {
    const moduleOpen = ()=>{
        console.log("Module Opened");
    }

    const handleChange = (e, key, val)=>{
        console.log(`Changed: ${key} to ${val}`, e.target.value);
    }

    const moduleEnabledChanged = (
        moduleEnabled: string,
        dependentSetting: string = "",
        dependentPlugin: boolean = false
    ): boolean => {
        console.log("Module Enabled Changed:", moduleEnabled, dependentSetting, dependentPlugin);
        let popupData = {
            moduleName: "",
            settings: "",
            plugin: "",
        };

        if ( moduleEnabled && ! modules.includes( moduleEnabled ) ) {
            popupData.moduleName = moduleEnabled;
        }

        if (
            dependentSetting 
            // &&
            // Array.isArray( setting[ dependentSetting ] ) &&
            // setting[ dependentSetting ].length === 0
        ) {
            popupData.settings = dependentSetting;
        }

        if ( dependentPlugin ) {
            popupData.plugin = "notifima";
        }

        if ( popupData.moduleName || popupData.settings || popupData.plugin ) {
            moduleOpen(  );
            moduleOpen(  );
            return true;
        }

        return false;
    };

    const proSettingChanged = ( isProSetting: boolean ): boolean => {
        if ( isProSetting && !appLocalizer?.khali_dabba ) {
            moduleOpen();
            return true;
        }
        return false;
    };
    const change = (e: React.ChangeEvent<HTMLInputElement>)=>{
        if (
            ! proSettingChanged(
                inputField.proSetting ?? false
            ) &&
            ! moduleEnabledChanged(
                String( inputField.moduleEnabled ?? "" )
            )
        ) {
            handleChange(
                e,
                inputField.key,
                "multiple"
            );
        }
    }
    const multiCheckBoxPropsDummy = {
        khali_dabba: false,
        wrapperClass: "checkbox-list-side-by-side",
        descClass: "settings-metabox-description",
        description: "Select the options you want to enable.",
        selectDeselectClass: "btn-purple select-deselect-trigger",
        inputWrapperClass: "toggle-checkbox-header",
        inputInnerWrapperClass: "toggle-checkbox",
        inputClass: "checkbox-input",
        hintOuterClass:"dashicons dashicons-info",
        hintInnerClass:"hover-tooltip",
        idPrefix: "toggle-switch",
        selectDeselect: false,
        selectDeselectValue: "Select All",
        rightContentClass: "settings-metabox-description",
        rightContent: false,
        options: [
            {
                key: "option1",
                value: "option1",
                label: "Option 1",
                name: "option-group",
                proSetting: true,
                hints: "This is option 1"
            },
            // {
            //     key: "option2",
            //     value: "option2",
            //     label: "Option 2",
            //     name: "option-group",
            //     proSetting: true,
            //     hints: "Pro feature"
            // },
            // {
            //     key: "option3",
            //     value: "option3",
            //     label: "Option 3",
            //     name: "option-group"
            // }
        ],
        value: ["option1", "option3"],
        proSetting: false,
        onChange: change,
        onMultiSelectDeselectChange: (e) => {
            console.log("Select/Deselect clicked:", e);
        },
        type: "checkbox" as "checkbox",
        proChanged: () => {
            console.log("Pro setting toggled");
        },
    };

    return <MultiCheckbox { ...multiCheckBoxPropsDummy } />;
};
