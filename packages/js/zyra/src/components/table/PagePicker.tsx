import React, { useState, useEffect } from 'react';
import { BasicInputUI } from '../BasicInput';
import { AdminButtonUI } from '../AdminButton';

interface PagePickerProps {
  currentPage: number;
  pageCount: number;
  setCurrentPage: (page: number, action?: 'previous' | 'next' | 'goto' | 'first' | 'last') => void;
}

const PagePicker: React.FC<PagePickerProps> = ({
  currentPage,
  pageCount,
  setCurrentPage,
}) => {
  const [inputValue, setInputValue] = useState<number>(currentPage);

  useEffect(() => {
    setInputValue(currentPage);
  }, [currentPage]);

  const goToPage = (page: number, action?: 'previous' | 'next' | 'goto' | 'first' | 'last') => {
    if (page < 1) page = 1;
    if (page > pageCount) page = pageCount;
    setCurrentPage(page, action);
  };

  const previousPage = () => goToPage(currentPage - 1, 'previous');
  const nextPage = () => goToPage(currentPage + 1, 'next');
  const firstPage = () => goToPage(1, 'first');
  const lastPage = () => goToPage(pageCount, 'last');

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newPage = Number(e.target.value);
    if (Number.isFinite(newPage) && newPage >= 1 && newPage <= pageCount) {
      goToPage(newPage, 'goto');
    } else {
      setInputValue(currentPage); // Reset if invalid
    }
  };

  // Determine visible page numbers with ellipsis
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (pageCount <= 6) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
      return pages;
    }

    // Always first two
    pages.push(1, 2);

    let middleStart = currentPage - 1;
    let middleEnd = currentPage + 1;

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

  if (pageCount <= 1) return null;

  const pages = getVisiblePages();
  return (
    <div className="pagination-number-wrapper">
      <BasicInputUI
        type="number"
        inputLabel="Go to page"
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
          className={`${currentPage <= 1 ? 'pagination-button-disabled' : ''}`}
          onClick={firstPage}
          aria-label="First Page"
        >
          <i className="admin-font adminfont-pagination-prev-arrow"></i>
        </span>

        <span
          className={`${currentPage <= 1 ? 'pagination-button-disabled' : ''}`}
          onClick={previousPage}
          aria-label="Previous Page"
        >
          <i className="admin-font adminfont-pagination-left-arrow"></i>
        </span>

        <div className="pagination">
          {pages.map((page, idx) =>
            typeof page === 'number' ? (
              <AdminButtonUI
                buttons={{
                  text: String(page),
                  color: currentPage === page ? 'purple' : 'white',
                  onClick: () => goToPage(page),
                }}
              />
            ) : (
              <span key={idx} className="pagination-ellipsis">
                {page}
              </span>
            )
          )}
        </div>

        <span
          className={`${currentPage >= pageCount ? 'pagination-button-disabled' : ''}`}
          onClick={nextPage}
          aria-label="Next Page"
        >
          <i className="admin-font adminfont-pagination-right-arrow"></i>
        </span>

        <span
          className={`${currentPage >= pageCount ? 'pagination-button-disabled' : ''}`}
          onClick={lastPage}
          aria-label="Last Page"
        >
          <i className="admin-font adminfont-pagination-next-arrow"></i>
        </span>
      </div>
    </div>
  );
};

export default PagePicker;
