import { FIELD_REGISTRY } from './FieldRegistry';

export function renderField(
  field: any,
  values: any,
  onChange: (
    event: any,
    key: string,
    type?: 'single' | 'multiple',
    fromType?: 'simple' | 'select' | 'multi-select'
  ) => void
): JSX.Element | null {
  const component = FIELD_REGISTRY[field.type];

  if (!component) {
    console.warn(`Unknown field type: ${field.type}`);
    return null;
  }

  return (
    <div className="mvx-field" key={field.key}>
      {field.preText &&
        renderField(field.preText, values, onChange)}

      {component.render({
        field,
        value: values,
        onChange,
      })}

      {field.postText &&
        renderField(field.postText, values, onChange)}
    </div>
  );
}
