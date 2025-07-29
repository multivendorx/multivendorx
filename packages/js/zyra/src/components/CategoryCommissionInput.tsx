/**
 * External dependencies
 */
import React, { useState, ChangeEvent, useMemo } from 'react';

interface WCCategory {
    id: number;
    name: string;
    parent: number;
}

interface NestedCategory {
    id: number;
    name: string;
    children?: NestedCategory[];
}

interface CategoryCommissionInputProps {
    name?: string;
    categories: WCCategory[]; // WooCommerce flat list
    value?: Record<string, { percentage: number; flat: number }>;
    wrapperClass?: string;
    listClass?: string;
    itemClass?: string;
    buttonClass?: string;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
    onChange?: (e: { target: { name?: string; value: Record<string, { percentage: number; flat: number }> } }) => void;
}

export const CategoryCommissionInput: React.FC<CategoryCommissionInputProps> = ({
    name,
    categories = [],
    value = {},
    wrapperClass,
    listClass,
    itemClass,
    buttonClass,
    proSetting,
    description,
    descClass,
    onChange,
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [localValues, setLocalValues] = useState<Record<string, { percentage: number; flat: number }>>(value);

    // ✅ Convert flat WC data → nested
    const formattedCategories = useMemo(() => {
        const map = new Map<number, NestedCategory>();
        const roots: NestedCategory[] = [];

        categories.forEach(cat => {
            map.set(cat.id, { id: cat.id, name: cat.name, children: [] });
        });

        categories.forEach(cat => {
            if (cat.parent && map.has(cat.parent)) {
                map.get(cat.parent)!.children!.push(map.get(cat.id)!);
            } else {
                roots.push(map.get(cat.id)!);
            }
        });

        return roots;
    }, [categories]);

    // ✅ Handle input change
    const handleInputChange = (catId: string, field: 'percentage' | 'flat', val: string) => {
        const updated = {
            ...localValues,
            [catId]: {
                ...localValues[catId],
                [field]: Number(val),
            },
        };
        setLocalValues(updated);
        onChange?.({ target: { name, value: updated } });
    };

    // ✅ Toggle expand/collapse
    const toggleExpand = (catId: string) => {
        setExpanded(prev => ({
            ...prev,
            [catId]: !prev[catId],
        }));
    };

    // ✅ Recursive category rendering
    const renderCategory = (cat: NestedCategory) => (
        <li key={cat.id} className={itemClass}>
            <div className="category-row">
                <span className="category-label">{cat.name}</span>
                <input
                    type="number"
                    placeholder="%"
                    value={localValues[cat.id]?.percentage ?? ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(String(cat.id), 'percentage', e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Flat"
                    value={localValues[cat.id]?.flat ?? ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(String(cat.id), 'flat', e.target.value)}
                />
                {cat.children && cat.children.length > 0 && (
                    <button
                        type="button"
                        className={buttonClass || 'btn-expand'}
                        onClick={() => toggleExpand(String(cat.id))}
                    >
                        {expanded[cat.id] ? '-' : '+'}
                    </button>
                )}
            </div>

            {/* Show children only if expanded */}
            {expanded[cat.id] && cat.children && (
                <ul className={listClass}>
                    {cat.children.map((child) => renderCategory(child))}
                </ul>
            )}
        </li>
    );

    return (
        <div className={wrapperClass}>
            {/* Global All Categories */}
            <div className="category-row all-categories">
                <span className="category-label">All Categories</span>
                <input
                    type="number"
                    placeholder="%"
                    value={localValues['all']?.percentage ?? ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('all', 'percentage', e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Flat"
                    value={localValues['all']?.flat ?? ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('all', 'flat', e.target.value)}
                />
                <button
                    type="button"
                    className={buttonClass || 'btn-expand'}
                    onClick={() => toggleExpand('root')}
                >
                    {expanded['root'] ? '-' : '+'}
                </button>
            </div>

            {expanded['root'] && (
                <ul className={listClass || 'category-list'}>
                    {formattedCategories.map((cat) => renderCategory(cat))}
                </ul>
            )}

            {proSetting && <span className="admin-pro-tag">pro</span>}
            {description && (
                <p className={descClass} dangerouslySetInnerHTML={{ __html: description }}></p>
            )}
        </div>
    );
};

export default CategoryCommissionInput;
