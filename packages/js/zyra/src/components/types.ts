export interface FieldComponent {
  render: React.FC<any>;
  validate?: (field: any, value: any) => string | null;
  normalize?: (value: any) => any;
}
