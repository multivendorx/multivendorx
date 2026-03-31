import React from 'react';

// Internal dependencies
import '../../styles/web/UI/Container.scss';

type ContainerProps = {
    column?: boolean;
    children: React.ReactNode;
    general?: boolean;
    className?: string;
};

const Container: React.FC<ContainerProps> = ({
    column = false,
    general = false,
    children,
    className
}) => {
    return (
        <div
            className={`container-wrapper ${column ? 'column' : ''} ${
                general ? 'general-wrapper' : ''
            } ${className ? className : ''}`}
        >
            {children}
        </div>
    );
};

export default Container;
