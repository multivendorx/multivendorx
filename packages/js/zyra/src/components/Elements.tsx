// External dependencies
import React, { useState, useCallback } from 'react';

// Types
interface Option {
    value: string;
    label: string;
    icon?: string;
}

interface ElementsProps {
    selectOptions: Option[];
    onClick: ( value: string ) => void;
    label?: string;
}

const Elements: React.FC< ElementsProps > = ( {
    selectOptions,
    onClick,
    label,
} ) => {
    const [ isOpen, setIsOpen ] = useState( true );

     const toggleOpen = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return (
        <aside className="elements-section">
            <div
                className="section-meta"
                onClick={toggleOpen}
                role="button"
                tabIndex={ 0 }
            >
                { label && (
                    <h2>
                        { label } <span>({ selectOptions.length })</span>
                    </h2>
                ) }
                <i
                    className={ `adminfont-pagination-right-arrow ${
                        isOpen ? 'rotate' : ''
                    }` }
                ></i>
            </div>

            <main
                className={ `section-container ${
                    isOpen ? 'open' : 'closed'
                }` }
            >
                { selectOptions.map( ( option ) => (
                    <div
                        key={ option.value }
                        role="button"
                        tabIndex={ 0 }
                        className="elements-items"
                        onClick={ () => onClick( option.value ) }
                    >
                        { option.icon && <i className={ option.icon }></i> }
                        <p className="list-title">{ option.label }</p>
                    </div>
                ) ) }
            </main>
        </aside>
    );
};

export default Elements;
