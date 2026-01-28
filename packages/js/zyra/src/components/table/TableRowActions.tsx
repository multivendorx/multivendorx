import React from 'react';

export interface ActionItem {
  label?: string;
  icon?: React.ReactNode;
  onClick: (rowId?: string | number) => void;
  className?: string;
}

interface TableRowActionsProps {
  rowId?: string | number;
  rowActions: ActionItem[];
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  rowId,
  rowActions,
}) => {
  return (
    <div className="action-section">
      <div className="action-icons">
        <div className="inline-actions">
          {rowActions.map((action, index) => (
            <div className="inline-action-btn tooltip-wrapper" onClick={() => action.onClick(rowId)}>
              <i className={`adminfont-${action.icon}`} />
              <span className="tooltip-name">
                {action.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableRowActions;
