// External dependencies
import React from 'react';
import { FieldComponent } from './types';

// Types
interface PrePostTextProps {
    type: string;
    textType: string;
    preText?: string;
    postText?: string;
}

const PrePostTextUI: React.FC< PrePostTextProps > = ( {
    textType,
    preText,
    postText,
} ) => {
    return (
        <>
            {textType == 'pre' && 
                <span className="before">{ preText }</span>
            }
            {textType == 'post' && 
                <span className="after">{ postText }</span>
            }
        </>
    );
};

const PrePostText: FieldComponent = {
  render: ({ field, value, onChange, canAccess }) => (
    <PrePostTextUI
      type={field.type}
      textType={field.textType}
      preText={field.preText}
      postText={field.postText}
    />
  ),

  validate: (field, value) => {
    if (field.required && !value?.[field.key]) {
      return `${field.label} is required`;
    }
    return null;
  },
};

export default PrePostText;