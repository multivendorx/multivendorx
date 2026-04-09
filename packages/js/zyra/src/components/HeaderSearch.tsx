import React, { useEffect, useRef, useState } from 'react';
import { useOutsideClick } from './fieldUtils';
import { BasicInputUI } from './BasicInput';
import { ItemListUI } from './ItemList';
import { SelectInputUI } from './SelectInput';
import '../styles/web/HeaderSearch.scss';

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
    width?: number;
};

const HeaderSearch: React.FC<HeaderSearchProps> = ({
    search,
    results,
    onQueryUpdate,
    onResultClick,
    width,
    variant = 'default',
}) => {
    if (!search) {
        return null;
    }

    const { placeholder = '', options = [] } = search;
    const hasDropdown = options.length > 0;

    const [query, setQuery] = useState('');
    const [action, setAction] = useState(
        hasDropdown && options.length > 0 ? options[0].value : ''
    );
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
        setIsOpen(false);
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
                        size={`${width}rem`}
                        onChange={(value) => {
                            setAction(value);
                            triggerSearch(query, value);
                        }}
                        background='var(--theme-background-color)'
                        color='var(--theme-color)'
                    />
                </div>
            )}

            {/* Input */}
            <div
                className={`search-section`}
                >
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
                <ItemListUI
                    className="search-results"
                    items={results.map((item) => ({
                        title: item.name,
                        desc: item.desc,
                        icon: item.icon,
                        action: () => {
                            onResultClick(item);
                            setIsOpen(false);
                            setQuery('');
                            setAction(
                                hasDropdown && options.length > 0
                                    ? options[0].value
                                    : ''
                            );
                            setIsExpanded(false);
                            triggerSearch(
                                '',
                                hasDropdown && options.length > 0
                                    ? options[0].value
                                    : ''
                            );
                        },
                    }))}
                />
            )}
        </div>
    );
};

export default HeaderSearch;