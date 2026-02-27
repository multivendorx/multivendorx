import AddressField from './AddressField';
import AdminButton from './AdminButton';
import BasicInput from './BasicInput';
import CalendarInput from './CalendarInput';
import ClickableList from './ClickableList';
import ColorSettingInput from './ColorSettingInput';
import Content from './Content';
import Divider from './Divider';
import EmailTemplate from './EmailRenderer';
import EndpointEditor from './EndpointEditor';
import EventCalendar from './EventCalendar';
import ExpandablePanelGroup from './ExpandablePanelGroup';
import FileInput from './FileInput';
import RegistrationForm from './FormRenderer';
import ItemList from './ItemList';
import Log from './Log';
import MultiCheckBox from './MultiCheckbox';
import MultiCheckboxTable from './MultiCheckboxTable';
import NestedComponent from './NestedComponent';
import PrePostText from './PrePostText';
import RadioInput from './RadioInput';
import Recaptcha from './Recaptcha';
import Section from './Section';
import SelectInput from './SelectInput';
import ShortCodeTable from './ShortCodeTable';
import SystemInfo from './SystemInfo';
import Tabs from './Tabs';
import TextArea from './TextArea';
import ToggleSetting from './ToggleSetting';
import { FieldComponent } from './types';

export const FIELD_REGISTRY: Record<string, FieldComponent> = {
  // BasicInput
  text: BasicInput,
  number: BasicInput,
  email: BasicInput,
  time: BasicInput,
  date: BasicInput,

  // SelectInput
  select: SelectInput,
  dropdown: SelectInput,
  'multi-select': SelectInput,
  creatable: SelectInput,
  'creatable-multi': SelectInput,

  // Content
  heading: Content,
  richtext: Content,

  // MultiCheckBox
  checkbox: MultiCheckBox,
  checkboxes: MultiCheckBox,

  // FileInput
  attachment: FileInput,
  image: FileInput,

  textarea: TextArea,

  radio: RadioInput,

  preposttext: PrePostText,

  button: AdminButton,

  nested: NestedComponent,


  section: Section,

  'multi-checkbox-table': MultiCheckboxTable,

  'expandable-panel': ExpandablePanelGroup,

  'setting-toggle': ToggleSetting,

  'clickable-list': ClickableList,

  'form-builder': RegistrationForm,

  'email-template': EmailTemplate,

  'system-info': SystemInfo,

  tab: Tabs,

  log: Log,

  'calendar-input': CalendarInput,

  'event-calendar': EventCalendar,

  recaptcha: Recaptcha,

  address: AddressField,

  divider: Divider,

  'color-setting': ColorSettingInput,

  'endpoint-editor': EndpointEditor,

  'shortcode-table': ShortCodeTable,

  itemlist: ItemList,
};
