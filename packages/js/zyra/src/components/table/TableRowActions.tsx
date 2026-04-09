import React, { useState, useRef } from 'react';
import { useOutsideClick } from '../fieldUtils';
import Tooltip from '../UI/Tooltip';

export interface ActionItem {
    label?: string;
    icon?: React.ReactNode;
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

    return (
        <div className="table-action" ref={containerRef}>                            
                {showInline ? (
                    <div className="inline-actions">
                    {rowActions.map((action) => (
                        <Tooltip text={action.label}>
                            <i
                                onClick={() => action.onClick(row)}
                                className={`adminfont-${action.icon}`}
                            />
                        </Tooltip>
                    ))}
                    </div>
                ) : (
                    <>
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
                                            className={`adminfont-${action.icon}`}
                                        />
                                        <span className="tooltip-name">
                                            {action.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        </div>
                    </>
                )}
        </div>
    );
};

export default TableRowActions;
