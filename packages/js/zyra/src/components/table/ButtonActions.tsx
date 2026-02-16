import React from 'react';
import { QueryProps } from './types';
import { AdminButtonUI } from '../AdminButton';

export type ButtonAction = {
    label: string;
    icon?: string;
    onClick?: () => void;
    className?: string;
    onClickWithQuery?: (query: QueryProps) => void;
    color?: string; // Added to support your AdminButtonUI color prop
};

type ButtonActionsProps = {
    actions?: ButtonAction[];
    query?: QueryProps;
};

const ButtonActions: React.FC<ButtonActionsProps> = ({
    actions = [],
    query,
}) => {
    if (!actions.length) return null;

    const resolvedButtons = actions.map((action) => ({
        text: action.label,
        icon: action.icon,
        color: action.color || '',
        onClick: () => {
            if (action.onClickWithQuery && query) {
                action.onClickWithQuery(query);
            } else {
                action.onClick?.();
            }
        },
    }));

    return (
        <div className="table-button-actions">
            <AdminButtonUI 
                buttons={resolvedButtons} 
                position="left" 
            />
        </div>
    );
};

export default ButtonActions;