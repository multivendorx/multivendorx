import DisplayButton from '../../DisplayButton';
import { MouseEvent } from 'react';

export const ButtonInput = ({
  name,
  inputClass,
  onClick,
  onclickCallback,
}: any) => (
  <DisplayButton
    wraperClass={inputClass || 'admin-btn default-btn'}
    onClick={(e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onclickCallback?.(e);
      onClick?.(e as any);
    }}
  >
    <span className="text">{name}</span>
  </DisplayButton>
);
