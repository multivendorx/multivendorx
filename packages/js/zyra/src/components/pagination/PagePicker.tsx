import React, { useState, useEffect } from 'react';

interface PagePickerProps {
  currentPage: number;
  pageCount: number;
  setCurrentPage: (page: number, action?: 'previous' | 'next' | 'goto' | 'first' | 'last') => void;
  maxPageButtons?: number;
}

const PagePicker: React.FC<PagePickerProps> = ({
  currentPage,
  pageCount,
  setCurrentPage,
  maxPageButtons = 5, // default to 5 buttons
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

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(e.target.value));
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newPage = Number(e.target.value);
    if (Number.isFinite(newPage) && newPage >= 1 && newPage <= pageCount) {
      goToPage(newPage, 'goto');
    } else {
      setInputValue(currentPage); // Reset if invalid
    }
  };

  const selectInputValue = (e: React.MouseEvent<HTMLInputElement>) => e.currentTarget.select();

  // Determine visible page numbers with ellipsis
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const totalNumbers = maxPageButtons;
    const totalBlocks = totalNumbers + 2; // first + last pages

    if (pageCount <= totalBlocks) {
      // Show all pages if total pages are less than limit
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      const left = Math.max(currentPage - Math.floor(totalNumbers / 2), 2);
      const right = Math.min(currentPage + Math.floor(totalNumbers / 2), pageCount - 1);

      pages.push(1); // First page

      if (left > 2) pages.push('...'); // Left ellipsis

      for (let i = left; i <= right; i++) pages.push(i);

      if (right < pageCount - 1) pages.push('...'); // Right ellipsis

      pages.push(pageCount); // Last page
    }

    return pages;
  };

  if (pageCount <= 1) return null;

  const pages = getVisiblePages();

  return (
    <div className="pagination-number-wrapper">
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
              <button
                key={idx}
                className={`number-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
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

      <label className="show-section">
        Go to page
        <input
          type="number"
          min={1}
          max={pageCount}
          value={inputValue}
          onClick={selectInputValue}
          onChange={onInputChange}
          onBlur={onInputBlur}
          className={`pagination-page-picker-input`}
        />
      </label>
    </div>
  );
};

export default PagePicker;
