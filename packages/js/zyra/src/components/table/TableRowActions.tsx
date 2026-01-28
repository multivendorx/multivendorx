import React, { useState } from 'react';

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
  const [open, setOpen] = useState(false);
  const showInline = rowActions.length <= 2;

  return (
    <div className="action-section">
      <div className="action-icons">
        <div className="inline-actions">
          {showInline ? (
            rowActions.map((action, index) => (
              <div
                key={index}
                className="inline-action-btn tooltip-wrapper"
                onClick={() => action.onClick(rowId)}
              >
                <i className={`adminfont-${action.icon}`} />
                <span className="tooltip-name">{action.label}</span>
              </div>
            ))
          ) : (
            <>
              {/* single icon */}
              <div
                className="inline-action-btn tooltip-wrapper"
                onClick={() => setOpen((v) => !v)}
              >
                <i className="adminfont-more-vertical" />
              </div>

              {/* dropdown actions */}
              {open &&
                rowActions.map((action, index) => (
                  <div
                    key={index}
                    className="inline-action-btn tooltip-wrapper"
                    onClick={() => {
                      action.onClick(rowId);
                      setOpen(false);
                    }}
                  >
                    <i className={`adminfont-${action.icon}`} />
                    <span className="tooltip-name">{action.label}</span>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableRowActions;
