import React, { useState, useRef } from 'react';
import { useOutsideClick } from '../useOutsideClick';
import { TableRow } from './types';

export interface ActionItem {
  label?: string;
  icon?: React.ReactNode;
  onClick: (row?: TableRow) => void;
  className?: string;
  type?:string;
}

interface TableRowActionsProps {
  row?: TableRow;
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
                onClick={() => action.onClick(row)}
              >
                <i className={`adminfont-${action.icon}`} />
                <span className="tooltip-name">{action.label}</span>
              </div>
            ))
          ) : (
            <>
              <i className="adminfont-more-vertical" onClick={() => setOpen((v) => !v)} />
              <div className={`action-dropdown ${open ? 'show' : 'hover'}`}>
                <ul>
                {rowActions.map((action, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        action.onClick(row);
                        setOpen(false);
                      }}
                    >
                      <i className={`adminfont-${action.icon}`} />
                      <span className="tooltip-name">{action.label}</span>
                    </div>
                  ))}
                  </ul>
                </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableRowActions;