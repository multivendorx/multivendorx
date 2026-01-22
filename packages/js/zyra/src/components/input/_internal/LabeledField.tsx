import { ReactNode } from 'react';

export const LabeledField = ({
  label,
  id,
  description,
  feedback,
  children,
}: {
  label?: string;
  id?: string;
  description?: string;
  feedback?: { type: string; message: string };
  children: ReactNode;
}) => (
  <>
    {label && <label htmlFor={id}>{label}</label>}
    {children}
    {description && (
      <p
        className="settings-metabox-description"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    )}
    {feedback && (
      <div className={feedback.type}>{feedback.message}</div>
    )}
  </>
);
