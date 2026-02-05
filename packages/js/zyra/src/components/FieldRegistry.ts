import BasicInput from './BasicInput';
import SelectInput from './SelectInput';
import PrePostText from './PrePostText';
import AdminButton from './UI/AdminButton';
import ExpandablePanelGroup from './ExpandablePanelGroup';
import { FieldComponent } from './types';

export const FIELD_REGISTRY: Record<string, FieldComponent> = {
  text: BasicInput,
  select: SelectInput,
  multiselect: SelectInput,
  preposttest: PrePostText,
  button: AdminButton,
  // expandable: ExpandablePanelGroup,
};
