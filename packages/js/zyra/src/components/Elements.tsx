/**
 * External dependencies
 */
import React, { useState } from 'react';

// Types
interface Option {
    value: string;
    label: string;
    icon?: string;
}

interface ElementsProps {
    selectOptions: Option[];
    onClick: (value: string) => void;
    label?: string;
}

const Elements: React.FC<ElementsProps> = ({ selectOptions, onClick, label }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <aside className="elements-section">
            <div className="section-meta"
                onClick={() => setIsOpen((prev) => !prev)}
                role="button"
                tabIndex={0}>
                {label && <h2>{label}</h2>}
                <i className={`adminlib-pagination-right-arrow ${isOpen ? "rotate" : ""}`}></i>
            </div>

            <main className={`section-container ${isOpen ? "open" : "closed"}`}>
                {selectOptions.map((option) => (
                    <div
                        key={option.value}
                        role="button"
                        tabIndex={0}
                        className="elements-items"
                        onClick={() => onClick(option.value)}
                    >
                        {option.icon && <i className={option.icon}></i>}
                        <p className="list-title">{option.label}</p>
                    </div>
                ))}
            </main>
        </aside>
    );
};

export default Elements;
