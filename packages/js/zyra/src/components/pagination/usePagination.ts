import { useState } from 'react';

export type UsePaginationProps = {
	totalCount: number;
	defaultPerPage?: number;
	onPageChange?: (page: number) => void;
	onPerPageChange?: (perPage: number) => void;
};

export function usePagination({
	totalCount,
	defaultPerPage = 25,
	onPageChange,
	onPerPageChange,
}: UsePaginationProps) {
	const [currentPage, setCurrentPageState] = useState(1);
	const [perPage, setPerPageState] = useState(defaultPerPage);

	const pageCount = Math.ceil(totalCount / perPage);
	const start = perPage * (currentPage - 1) + 1;
	const end = Math.min(perPage * currentPage, totalCount);

	const setCurrentPage = (newPage: number) => {
		setCurrentPageState(newPage);
		if (onPageChange) onPageChange(newPage);
	};

	const setPerPageChange = (newPerPage: number) => {
		setPerPageState(newPerPage);
		setCurrentPageState(1); // reset to first page
		if (onPerPageChange) onPerPageChange(newPerPage);
	};

	return {
		start,
		end,
		currentPage,
		perPage,
		pageCount,
		setCurrentPage,
		setPerPageChange,
	};
}
