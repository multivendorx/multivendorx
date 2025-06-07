/**
 * External dependencies
 */
import React from "react";

// Types
interface Option {
    value: string;
    label: string;
    icon?: string;
}

interface ElementsProps {
    selectOptions: Option[];
    onClick: ( value: string ) => void;
}

const Elements: React.FC< ElementsProps > = ( { selectOptions, onClick } ) => {
    return (
        <aside className="elements-section">
            <div className="section-meta">
                <h2>Form fields</h2>
            </div>
            <main className="section-container">
                { selectOptions.map( ( option ) => (
                    <article
                        key={ option.value } // ✅ Added key for React's rendering optimization
                        className="elements-items"
                        onClick={ () => onClick( option.value ) }
                    >
                        { option.icon && <i className={ option.icon }></i> }
                        <p className="list-title">{ option.label }</p>
                    </article>
                ) ) }
            </main>
        </aside>
    );
};

export default Elements;
