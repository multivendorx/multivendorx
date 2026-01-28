import React from 'react';
import "../../styles/web/UI/Container.scss";

type ColumnProps = {
  grid?: number; // 1–12
  className?: string;
  children: React.ReactNode;
  row?: boolean;
};

const Column: React.FC<ColumnProps> = ({
  grid = 12,
  className = '',
  children,
  row = false,
}) => {

  return <div className={`card-wrapper ${row ? 'row' : ''} ${className}`}
              data-cols={grid}
          >
            {children}
          </div>;
};

export default Column;
