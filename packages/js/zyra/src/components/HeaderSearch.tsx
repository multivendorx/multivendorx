import React, { useEffect, useRef, useState } from 'react';
import { useOutsideClick } from './useOutsideClick';
import { BasicInputUI } from './BasicInput';
import ItemList from './ItemList';
import { SelectInputUI } from './SelectInput';

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
    results?: SearchItem[];
    onQueryUpdate: (payload: SearchPayload) => void;
    onResultClick?: (res: SearchItem) => void;
    variant?: 'default' | 'mini-search'; 
};

const HeaderSearch: React.FC<HeaderSearchProps> = ({
    search,
    results,
    onQueryUpdate,
    onResultClick,
    variant = 'default',
}) => {
    if (!search) return null;

    const { placeholder = '', options = [] } = search;
    const hasDropdown = options.length > 0;

    const [query, setQuery] = useState('');
    const [action, setAction] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); 
    const wrapperRef = useRef<HTMLDivElement>(null);

    /* Close dropdown when query is cleared */
    useEffect(() => {
        if (!query) {
            setIsOpen(false);
        }
    }, [query]);

    useOutsideClick(wrapperRef, () => {
        if (variant === 'mini-search' && isExpanded && !query) {
            setIsExpanded(false);
        }
    });

    const triggerSearch = (value: string, newAction = action) => {
        onQueryUpdate({
            searchValue: value,
            ...(hasDropdown && { searchAction: newAction }),
        });
    };
    const showResults = isOpen && results && results.length > 0;

    const handleSearchIconClick = () => {
        if (variant === 'mini-search') {
            setIsExpanded(!isExpanded);
            if (!isExpanded) {
                setTimeout(() => {
                    const input = wrapperRef.current?.querySelector('input');
                    input?.focus();
                }, 100);
            }
        }
    };

    return (
        <div className="search-field" ref={wrapperRef}>
            {hasDropdown && (
                <div className="search-action">
                    <SelectInputUI
                        options={options}
                        value={action}
                        onChange={(newValue) => {
                            const val = newValue.value;
                            setAction(val);
                            triggerSearch(query, val);
                        }}
                    />
                </div>
            )}

            {/* Input */}
            <div className={`search-section ${variant === 'mini-search' && isExpanded ? 'mini-search' : ''}`}>
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
                <i 
                    className="adminfont-search" 
                    onClick={handleSearchIconClick}
                ></i>
            </div>

            {showResults && (
                // <ul className="search-dropdown">                    
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
                                setIsExpanded(false);
                                triggerSearch('', '');
                            }
                        }))}
                    />
                // </ul>
            )}
        </div>
    );
};

export default HeaderSearch;