import React, { useEffect, useRef, useState } from 'react';
import { HeaderSearchProps } from '../types';

const HeaderSearch: React.FC<HeaderSearchProps> = ({
    search,
    results,
    onQueryUpdate,
    onResultClick,
}) => {
    if (!search) return null;

    const { placeholder = 'Search Settings', options = [] } = search;
    const hasDropdown = options.length > 0;

    const [query, setQuery] = useState('');
    const [action, setAction] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    /* Close dropdown when query is cleared */
    useEffect(() => {
        if (!query) {
            setIsOpen(false);
        }
    }, [query]);

    /* Close on outside click */
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () =>
            document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const triggerSearch = (value: string, newAction = action) => {
        onQueryUpdate({
            searchValue: value,
            ...(hasDropdown && { searchAction: newAction }),
        });
    };
    const showResults = isOpen && results.length > 0;

    return (
        <div className="search-field header-search" ref={wrapperRef}>
            {/* Search scope dropdown */}
            {hasDropdown && (
                <div className="search-action">
                    <select
                        value={action}
                        onChange={(e) => {
                            const val = e.target.value;
                            setAction(val);
                            triggerSearch(query, val);
                        }}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Input */}
            <div className="search-section">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        const val = e.target.value;
                        setQuery(val);
                        setIsOpen(true);
                        triggerSearch(val);
                    }}
                />
                <i className="adminfont-search"></i>
            </div>

            {/* Results */}
            {showResults && (
                <ul className="search-dropdown">
                    {results.map((item, index) => {
                        const name = item.name || '(No name)';
                        const desc = item.desc || '';

                        return (
                            <li
                                key={index}
                                onClick={() => {
                                    onResultClick(item);
                                    setIsOpen(false);
                                    setQuery('');
                                    setAction('');
                                    triggerSearch('', '');
                                }}
                            >
                                <div className="icon-wrapper">
                                    {item.icon && (
                                        <i className={item.icon}></i>
                                    )}
                                </div>

                                <div className="details">
                                    <div className="title">
                                        {name.length > 60
                                            ? `${name.slice(0, 60)}...`
                                            : name}
                                    </div>

                                    {desc && (
                                        <div className="desc">
                                            {desc.length > 80
                                                ? `${desc.slice(0, 80)}...`
                                                : desc}
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default HeaderSearch;
