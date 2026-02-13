import React, { useState, useRef } from 'react';
import { useOutsideClick } from '../useOutsideClick';

export interface ActionItem {
  label?: string;
  icon?: React.ReactNode;
  onClick: (rowId?: string | number) => void;
  className?: string;
  type?:string;
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
  
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, () => {
    if (open) setOpen(false);
  });

  return (
    <div className="action-section" ref={containerRef}>
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
              <div
                className="inline-action-btn tooltip-wrapper"
                onClick={() => setOpen((v) => !v)}
              >
                <i className="adminfont-more-vertical" />
              </div>

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