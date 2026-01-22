import { InputWithSelectAddon } from './InputWithSelectAddon';
import { isSelectAddon } from './utils';

export const renderAddon = (
  addon: any,
  value: any,
  onChange?: any
) => {
  if (!addon) return null;

  if (typeof addon === 'string') {
    return <span dangerouslySetInnerHTML={{ __html: addon }} />;
  }

  if (typeof addon !== 'object') {
    return addon;
  }

  if (isSelectAddon(addon)) {
    return (
      <InputWithSelectAddon
        addon={addon}
        value={value}
        onChange={onChange}
      />
    );
  }

  return addon;
};

export const hasObjectAddon = (...addons: any[]) => {
  return addons.some(addon => addon && isSelectAddon(addon));
};
