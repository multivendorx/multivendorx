import React, { useState, useRef } from 'react';
import { useOutsideClick } from '../fieldUtils';
import Tooltip from '../UI/Tooltip';

export interface ActionItem {
	label?:
		| string
		| ((row?: Record<string, unknown>) => string);

	icon?:
		| string
		| React.ReactNode
		| ((row?: Record<string, unknown>) => string);

	onClick: (row?: Record<string, unknown>) => void;
	className?: string;
	type?: string;
}

interface TableRowActionsProps {
	row: Record<string, unknown>;
	rowActions: ActionItem[];
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
	row,
	rowActions,
}) => {
	const [open, setOpen] = useState(false);
	const showInline = rowActions.length <= 2;

	const containerRef = useRef<HTMLDivElement>(null);

	useOutsideClick(containerRef, () => {
		if (open) {
			setOpen(false);
		}
	});

	const getActionLabel = (action: ActionItem) => {
		return typeof action.label === 'function'
			? action.label(row)
			: action.label;
	};

	const getActionIcon = (action: ActionItem) => {
		return typeof action.icon === 'function'
			? action.icon(row)
			: action.icon;
	};

	return (
		<div className="table-action" ref={containerRef}>
			{showInline ? (
				<div className="inline-actions">
					{rowActions.map((action, index) => (
						<Tooltip
							key={index}
							text={getActionLabel(action)}
						>
							<i
								onClick={() => action.onClick(row)}
								className={`adminfont-${getActionIcon(
									action
								)}`}
							/>
						</Tooltip>
					))}
				</div>
			) : (
				<div className="action-icons">
					<i
						className="adminfont-more-vertical"
						onClick={() => setOpen((v) => !v)}
					/>

					<div
						className={`action-dropdown ${
							open ? 'show' : 'hover'
						}`}
					>
						<ul>
							{rowActions.map((action, index) => (
								<li
									key={index}
									onClick={() => {
										action.onClick(row);
										setOpen(false);
									}}
								>
									<i
										className={`adminfont-${getActionIcon(
											action
										)}`}
									/>

									<span className="tooltip-name">
										{getActionLabel(action)}
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
};

export default TableRowActions;