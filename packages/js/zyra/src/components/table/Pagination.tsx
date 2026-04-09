import React, { useState, useEffect } from 'react';
import { BasicInputUI } from '../BasicInput';
import { ButtonInputUI } from '../ButtonInput';
import { SelectInputUI } from '../SelectInput';

// Keeping the constant accessible
export const DEFAULT_PER_PAGE_OPTIONS = [10, 25, 50, 75, 100];

export type PaginationProps = {
    page: number;
    perPage: number;
    total: number;
    onPageChange?: (
        page: number,
        action?: 'previous' | 'next' | 'goto' | 'first' | 'last'
    ) => void;
    onPerPageChange?: (perPage: number) => void;
    showPagePicker?: boolean;
    showPerPagePicker?: boolean;
    showPageArrowsLabel?: boolean;
    perPageOptions?: number[];
};

const Pagination: React.FC<PaginationProps> = ({
    page,
    perPage,
    total,
    onPageChange = () => {},
    onPerPageChange = () => {},
    showPagePicker = true,
    showPerPagePicker = true,
    showPageArrowsLabel = true,
    perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
}) => {
    const [inputValue, setInputValue] = useState<number>(page);
    const pageCount = Math.ceil(total / perPage);

    useEffect(() => {
        setInputValue(page);
    }, [page]);

    // --- PageArrows Logic ---
    const startIndex = total === 0 ? 0 : (page - 1) * perPage + 1;
    const endIndex = Math.min(page * perPage, total);

    // --- PagePicker Logic ---
    const goToPage = (
        newPage: number,
        action?: 'previous' | 'next' | 'goto' | 'first' | 'last'
    ) => {
        if (newPage < 1) {
            newPage = 1;
        }
        if (newPage > pageCount) {
            newPage = pageCount;
        }
        onPageChange(newPage, action);
    };

    const previousPage = () => goToPage(page - 1, 'previous');
    const nextPage = () => goToPage(page + 1, 'next');
    const firstPage = () => goToPage(1, 'first');
    const lastPage = () => goToPage(pageCount, 'last');

    const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const newPage = Number(e.target.value);
        if (Number.isFinite(newPage) && newPage >= 1 && newPage <= pageCount) {
            goToPage(newPage, 'goto');
        } else {
            setInputValue(page); // Reset if invalid
        }
    };

    // --- PageSizePicker Logic ---
    const handlePerPageChange = (value: number) => {
        onPerPageChange(value);

        // Logic to prevent staying on a page that no longer exists
        const newMaxPage = Math.ceil(total / value);
        if (page > newMaxPage) {
            onPageChange(newMaxPage, 'goto');
        }
    };

    // Determine visible page numbers with ellipsis
    const getVisiblePages = () => {
        const pages: (number | string)[] = [];

        if (pageCount <= 6) {
            for (let i = 1; i <= pageCount; i++) {
                pages.push(i);
            }
            return pages;
        }

        // Always first two
        pages.push(1, 2);

        let middleStart = page - 1;
        let middleEnd = page + 1;

        middleStart = Math.max(middleStart, 3);
        middleEnd = Math.min(middleEnd, pageCount - 2);

        // Left ellipsis
        if (middleStart > 3) {
            pages.push('...');
        }

        // Middle pages (dynamic)
        for (let i = middleStart; i <= middleEnd; i++) {
            pages.push(i);
        }

        // Right ellipsis
        if (middleEnd < pageCount - 2) {
            pages.push('...');
        }

        // Always last two
        pages.push(pageCount - 1, pageCount);

        return pages;
    };

    const StatusLabel = showPageArrowsLabel && total > 0 && (
        <span className="show-section" role="status" aria-live="polite">
            Showing {startIndex} to {endIndex} of {total} entries.
        </span>
    );

    const SizePicker = (
        <div className="showing-number">
            Show
            <SelectInputUI
                value={perPage}
                options={perPageOptions.map((option) => ({
                    value: option,
                    label: option,
                }))}
                onChange={(value) => {
                    handlePerPageChange(value);
                }}
            />
            entries
        </div>
    );

    // Layout for 1 page or less
    if (pageCount <= 1) {
        return (
            <div className="pagination-number-wrapper">
                {StatusLabel}
                {/* Only show picker if there's enough data to actually paginate */}
                {total > perPageOptions[0] && SizePicker}
            </div>
        );
    }

    const pages = getVisiblePages();

    // Standard Layout with integrated PagePicker
    return (
        <>
            <div className="pagination-number-wrapper">
                {StatusLabel}
                {showPerPagePicker && SizePicker}
            </div>
            {showPagePicker && (
                <div className="pagination-number-wrapper">
                    Go to page
                    <BasicInputUI
                        type="number"
                        minNumber={1}
                        maxNumber={pageCount}
                        value={inputValue}
                        inputClass="pagination-page-picker-input"
                        onChange={(val) => setInputValue(val)}
                        onBlur={onInputBlur}
                        onClick={(e) => e.currentTarget.select()}
                    />
                    <div className="pagination-arrow">
                        <span
                            className={`${
                                page <= 1 ? 'pagination-button-disabled' : ''
                            }`}
                            onClick={firstPage}
                            aria-label="First Page"
                        >
                            <i className="admin-font adminfont-pagination-prev-arrow"></i>
                        </span>

                        <span
                            className={`${
                                page <= 1 ? 'pagination-button-disabled' : ''
                            }`}
                            onClick={previousPage}
                            aria-label="Previous Page"
                        >
                            <i className="admin-font adminfont-pagination-left-arrow"></i>
                        </span>

                        <div className="pagination">
                            {pages.map((pageNum, idx) =>
                                typeof pageNum === 'number' ? (
                                    <ButtonInputUI
                                        key={idx}
                                        buttons={{
                                            text: String(pageNum),
                                            color:
                                                page === pageNum
                                                    ? 'purple'
                                                    : 'white',
                                            onClick: () => goToPage(pageNum),
                                        }}
                                    />
                                ) : (
                                    <span
                                        key={idx}
                                        className="pagination-ellipsis"
                                    >
                                        {pageNum}
                                    </span>
                                )
                            )}
                        </div>

                        <span
                            className={`${
                                page >= pageCount
                                    ? 'pagination-button-disabled'
                                    : ''
                            }`}
                            onClick={nextPage}
                            aria-label="Next Page"
                        >
                            <i className="admin-font adminfont-pagination-right-arrow"></i>
                        </span>

                        <span
                            className={`${
                                page >= pageCount
                                    ? 'pagination-button-disabled'
                                    : ''
                            }`}
                            onClick={lastPage}
                            aria-label="Last Page"
                        >
                            <i className="admin-font adminfont-pagination-next-arrow"></i>
                        </span>
                    </div>
                </div>
            )}
        </>
    );
};

export default Pagination;
