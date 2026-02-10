import React, { useEffect, useRef, useState } from 'react';
import { useOutsideClick } from './useOutsideClick';
import { BasicInputUI } from './BasicInput';
import ItemList from './UI/ItemList';

type SearchItem = {
    icon?: string;
    name?: string;
    desc?: string;
    link: string;
};

type SearchOption = {
    label: string;
    value: string;
};

type SearchConfig = {
    placeholder?: string;
    options?: SearchOption[];
};

type SearchPayload =
    | { searchValue: string }
    | { searchValue: string; searchAction: string };

type HeaderSearchProps = {
    search?: SearchConfig;
    results: SearchItem[];
    onQueryUpdate: (payload: SearchPayload) => void;
    onResultClick: (res: SearchItem) => void;
};

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

    useOutsideClick(wrapperRef, () => setIsOpen(false));

    /* Close dropdown when query is cleared */
    useEffect(() => {
        if (!query) {
            setIsOpen(false);
        }
    }, [query]);


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
                <BasicInputUI
                    type={'text'}
                    placeholder={placeholder}
                    value={query}
                    onChange={(val: string) => {
                        setQuery(val);
                        setIsOpen(true);
                        triggerSearch(val);
                    }}
                />
                <i className="adminfont-search"></i>
            </div>

            {showResults && (
                <ul className="search-dropdown">
                    <ItemList
                        items={results.map((item) => ({
                            title: item.name,
                            desc: item.desc,
                            icon: item.icon,
                            action: () => {
                                onResultClick(item);
                                setIsOpen(false);
                                setQuery('');
                                setAction('');
                                triggerSearch('', '');
                            }
                        }))}
                    />
                </ul>
            )}
        </div>
    );
};

export default HeaderSearch;
