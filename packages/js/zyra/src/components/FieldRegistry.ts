import BasicInput from './BasicInput';
import SelectInput from './SelectInput';
import PrePostText from './PrePostText';
import AdminButton from './AdminButton';
import ExpandablePanelGroup from './ExpandablePanelGroup';
import ToggleSetting from './ToggleSetting';
import BlockText from './BlockText';
import ClickableList from './ClickableList';
import MultiCheckBox from './MultiCheckbox';
import { FieldComponent } from './types';
import SystemInfo from './SystemInfo';
import Section from './Section';
import TextArea from './TextArea';
import NestedComponent from './NestedComponent';
import RadioInput from './RadioInput';
import ColorSettingInput from './ColorSettingInput';
import Log from './Log';
import EndpointEditor from './EndpointEditor';
import ShortCodeTable from './ShortCodeTable';
import FileInput from './FileInput';
import MultiCheckboxTable from './MultiCheckboxTable';

export const FIELD_REGISTRY: Record<string, FieldComponent> = {
    text: BasicInput,
    number: BasicInput,
    email: BasicInput,
    time: BasicInput,
    select: SelectInput,
    radio: RadioInput,
    textarea: TextArea,
    preposttext: PrePostText,
    button: AdminButton,
    nested: NestedComponent,
    file: FileInput,
    blocktext: BlockText,
    section: Section,
    checkbox: MultiCheckBox,
    log: Log,
    'multi-select': SelectInput,
    'expandable-panel': ExpandablePanelGroup,
    'setting-toggle': ToggleSetting,
    'clickable-list': ClickableList,
    'system-info': SystemInfo,
    'color-setting': ColorSettingInput,
    'endpoint-editor': EndpointEditor,
    'shortcode-table': ShortCodeTable,
    'multi-checkbox-table': MultiCheckboxTable,
};
