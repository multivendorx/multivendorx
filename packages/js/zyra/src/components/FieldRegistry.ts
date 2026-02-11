import BasicInput from './BasicInput';
import SelectInput from './SelectInput';
import PrePostText from './PrePostText';
import AdminButton from './UI/AdminButton';
import ExpandablePanelGroup from './ExpandablePanelGroup';
import ToggleSetting from './ToggleSetting';
import BlockText from './BlockText';
import ClickableList from './ClickableList';
import RegistrationForm from './RegistrationForm';
import MultiCheckBox from './MultiCheckbox';
import { FieldComponent } from './types';
import EmailTemplate from './TemplateEditor/EmailTemplate';
import SystemInfo from './SystemInfo';
import Section from './Section';
import TextArea from './TextArea';
import Recaptcha from './Recaptcha';
import RadioInput from './RadioInput';
import FileInput from './FileInput';
import AddressField from './AddressField';
import NestedComponent from './NestedComponent';

export const FIELD_REGISTRY: Record<string, FieldComponent> = {
  text: BasicInput,
  number: BasicInput,
  email: BasicInput,
  time: BasicInput,
  select: SelectInput,
  textarea: TextArea,
  preposttext: PrePostText,
  button: AdminButton,
  nested: NestedComponent,
  'multi-select': SelectInput,
  'expandable-panel': ExpandablePanelGroup,
  'setting-toggle': ToggleSetting,
  'blocktext': BlockText,
  'clickable-list': ClickableList,
  'form-builder': RegistrationForm,
  'email-template': EmailTemplate,
  'checkboxes': MultiCheckBox,
  'system-info': SystemInfo,
  'section': Section,
  'radio': RadioInput,
  'recaptcha': Recaptcha,
  'attachment': FileInput,
  'image': FileInput,
  'address': AddressField,
};
