import SelectInput from '../../SelectInput';
import { normalizeValue } from './utils';

export const InputWithSelectAddon = ({
  addon,
  value,
  onChange,
}: any) => {
  const composite = normalizeValue(value);

  return (
    <SelectInput
      wrapperClass=""
      name={addon.key || ''}
      options={addon.options.map((opt: any) => ({
        value: opt.value,
        label: opt.label || opt.value,
      }))}
      value={composite[addon.key] || addon.value || ''}
      size={addon.size || undefined}
      onChange={(newValue: any) => {
        if (typeof onChange === 'function') {
          onChange({
            ...composite,
            [addon.key]: newValue.value,
          });
        }
      }}
    />
  );
};
