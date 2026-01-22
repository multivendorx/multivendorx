export const RangeInput = ({
  value,
  unit,
}: {
  value?: string | number;
  unit?: string;
}) => (
  <output className="settings-metabox-description">
    {value ?? 0}
    {unit}
  </output>
);
