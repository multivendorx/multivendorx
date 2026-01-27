import React, { useState, useEffect } from 'react';
import './pagination.scss';

interface PageArrowsWithPickerProps {
	currentPage: number;
	pageCount: number;
	setCurrentPage: (page: number, action?: 'previous' | 'next' | 'goto') => void;
}

const PageArrowsWithPicker: React.FC<PageArrowsWithPickerProps> = ({
	currentPage,
	pageCount,
	setCurrentPage,
}) => {
	const [inputValue, setInputValue] = useState(currentPage);

	useEffect(() => {
		if (currentPage !== inputValue) {
			setInputValue(currentPage);
		}
	}, [currentPage]);

	// Input change handler
	const onInputChange = (event: React.FormEvent<HTMLInputElement>) => {
		setInputValue(parseInt(event.currentTarget.value, 10));
	};

	// Input blur handler
	const onInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		const newPage = parseInt(event.target.value, 10);

		if (
			newPage !== currentPage &&
			Number.isFinite(newPage) &&
			newPage > 0 &&
			pageCount &&
			newPage <= pageCount
		) {
			setCurrentPage(newPage, 'goto');
		} else {
			setInputValue(currentPage);
		}
	};

	// Previous button
	const previousPage = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		if (currentPage > 1) {
			setInputValue(currentPage - 1);
			setCurrentPage(currentPage - 1, 'previous');
		}
	};

	// Next button
	const nextPage = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		if (currentPage < pageCount) {
			setInputValue(currentPage + 1);
			setCurrentPage(currentPage + 1, 'next');
		}
	};

	if (pageCount <= 1) return null;

	const isError = currentPage < 1 || currentPage > pageCount;

	return (
		<div className="pagination-page-arrows">
			<button
				className={`pagination-link ${currentPage > 1 ? 'is-active' : ''}`}
				onClick={previousPage}
				disabled={currentPage <= 1}
				aria-label="Previous Page"
			>
				<i className="icon-chevron-left"></i>
			</button>

			<input
				type="number"
				className={`pagination-input ${isError ? 'has-error' : ''}`}
				value={inputValue}
				onChange={onInputChange}
				onBlur={onInputBlur}
				min={1}
				max={pageCount}
				aria-invalid={isError}
			/>

			<span className="pagination-total">of {pageCount}</span>

			<button
				className={`pagination-link ${currentPage < pageCount ? 'is-active' : ''}`}
				onClick={nextPage}
				disabled={currentPage >= pageCount}
				aria-label="Next Page"
			>
				<i className="icon-chevron-right"></i>
			</button>
		</div>
	);
};

export default PageArrowsWithPicker;
