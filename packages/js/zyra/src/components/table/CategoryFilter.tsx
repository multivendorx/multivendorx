import React from 'react';

export interface CategoryItem {
    label: string;
    value: string;
    count: number;
}

interface CategoryFilterProps {
    categories: CategoryItem[];
    activeCategory?: string;
    onCategoryClick: (value: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
    categories,
    activeCategory,
    onCategoryClick,
}) => {
    // Only render categories with count > 0
    const visibleCategories = categories.filter(cat => cat.count > 0);

    if (visibleCategories.length === 0) return null;

    return (
        <div className="category-filter-bar">
            {visibleCategories.map(({ label, value, count }) => (
                <button
                    key={value}
                    className={`category-item ${activeCategory === value ? 'active' : ''}`}
                    onClick={() => onCategoryClick(value)}
                >
                    {label} ({count})
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
