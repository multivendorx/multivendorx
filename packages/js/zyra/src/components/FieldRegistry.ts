import BasicInput from './BasicInput';
import SelectInput from './SelectInput';
import ExpandablePanelGroup from './ExpandablePanelGroup';
import { FieldComponent } from './types';

export const FIELD_REGISTRY: Record<string, FieldComponent> = {
  text: BasicInput,
  select: SelectInput,
  // expandable: ExpandablePanelGroup,
};
