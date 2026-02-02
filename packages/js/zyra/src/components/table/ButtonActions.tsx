import React from 'react';
import { QueryProps } from './types';

export type ButtonAction = {
	label: string;
	icon?: string;
	onClick: () => void;
	className?: string;
	onClickWithQuery?:( query:QueryProps) => void;
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

	return (
		<div className="table-button-actions">
			{actions.map((action, index) => (
				<button
					key={index}
					className={`admin-badge ${action.className || ''}`}
					onClick={() => {
						if (action.onClickWithQuery && query) {
							action.onClickWithQuery(query);
						} else {
							action.onClick?.();
						}
					}}
				>
					{action.icon && <i className={`adminfont-${action.icon}`} />}
					{action.label}
				</button>
			))}
		</div>
	);
};

export default ButtonActions;

