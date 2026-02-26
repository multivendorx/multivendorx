import BasicInput from './BasicInput';
import SelectInput from './SelectInput';
import PrePostText from './PrePostText';
import AdminButton from './AdminButton';
import ExpandablePanelGroup from './ExpandablePanelGroup';
import ToggleSetting from './ToggleSetting';
import ClickableList from './ClickableList';
import RegistrationForm from './FormRenderer';
import MultiCheckBox from './MultiCheckbox';
import { FieldComponent } from './types';
import EmailTemplate from './EmailRenderer';
import SystemInfo from './SystemInfo';
import Section from './Section';
import TextArea from './TextArea';
import Recaptcha from './Recaptcha';
import RadioInput from './RadioInput';
import AddressField from './AddressField';
import NestedComponent from './NestedComponent';
import ColorSettingInput from './ColorSettingInput';
import Log from './Log';
import EndpointEditor from './EndpointEditor';
import ShortCodeTable from './ShortCodeTable';
import FileInput from './FileInput';
import Content from './Content';
import Divider from './Divider';
import MultiCheckboxTable from './MultiCheckboxTable';
import Tabs from './Tabs';
import ItemList from './ItemList';
import NoticeField from './Notice';
import CalendarInput from './CalendarInput';
import EventCalendar from './EventCalendar';

export const FIELD_REGISTRY: Record<string, FieldComponent> = {
  text: BasicInput,
  number: BasicInput,
  email: BasicInput,
  time: BasicInput,
  date: BasicInput,
  select: SelectInput,
  radio: RadioInput,
  textarea: TextArea,
  preposttext: PrePostText,
  button: AdminButton,
  nested: NestedComponent,
  notice: NoticeField,
  section: Section,
  checkbox: MultiCheckBox,
  log: Log,
  tab: Tabs,
  'calendar-input': CalendarInput,
  'event-calendar': EventCalendar,
  'multi-select': SelectInput,
  'expandable-panel': ExpandablePanelGroup,
  'setting-toggle': ToggleSetting,
  'clickable-list': ClickableList,
  'form-builder': RegistrationForm,
  'email-template': EmailTemplate,
  'checkboxes': MultiCheckBox,
  'system-info': SystemInfo,
  'dropdown': SelectInput,
  'recaptcha': Recaptcha,
  'attachment': FileInput,
  'image': FileInput,
  'address': AddressField,
  'divider': Divider,
  'heading': Content,
  'richtext': Content,
  'color-setting' : ColorSettingInput,
  'endpoint-editor' : EndpointEditor,
  'shortcode-table': ShortCodeTable,
  'multi-checkbox-table': MultiCheckboxTable,
  'itemlist': ItemList,
};
