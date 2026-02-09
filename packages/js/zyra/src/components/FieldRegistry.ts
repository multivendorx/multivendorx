import BasicInput from './BasicInput';
import SelectInput from './SelectInput';
import PrePostText from './PrePostText';
import AdminButton from './UI/AdminButton';
import ExpandablePanelGroup from './ExpandablePanelGroup';
import ToggleSetting from './ToggleSetting';
import BlockText from './BlockText';
import ClickableList from './ClickableList';
import MultiCheckBox from './MultiCheckbox';
import { FieldComponent } from './types';

export const FIELD_REGISTRY: Record<string, FieldComponent> = {
  text: BasicInput,
  number: BasicInput,
  email: BasicInput,
  select: SelectInput,
  'multi-select': SelectInput,
  preposttext: PrePostText,
  button: AdminButton,
  'expandable-panel': ExpandablePanelGroup,
  'setting-toggle': ToggleSetting,
  'blocktext': BlockText,
  'clickable-list': ClickableList,
  // 'checkbox': MultiCheckBox,
};
