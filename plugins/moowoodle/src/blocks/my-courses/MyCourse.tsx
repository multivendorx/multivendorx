/* global courseMyAcc */
import React, { useEffect, useState, useCallback } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import './MyCourse.scss';

interface Course {
	user_name?: string;
	course_name?: string;
	enrollment_date?: string;
	password?: string;
	moodle_url?: string;
}

const MyCourse: React.FC = () => {
	const [courses, setCourses] = useState<Course[]>([]);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [rowsPerPage] = useState<number>(5);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	const totalPages = Math.ceil(totalRows / rowsPerPage);

	const fetchCourses = useCallback(() => {
		setLoading(true);
		setError('');
		axios({
			method: 'GET',
			url: `${courseMyAcc.apiUrl}/moowoodle/v1/my-courses`,
			headers: { 'X-WP-Nonce': courseMyAcc.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
			},
		})
			.then((response) => {
				setCourses(response.data || []);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
			})
			.catch(() => {
				setError(__('Failed to fetch courses.', 'moowoodle'));
			})
			.finally(() => setLoading(false));
	}, [currentPage, rowsPerPage]);

	useEffect(() => {
		fetchCourses();
	}, [fetchCourses]);

	const renderTableContent = () => {
		if (loading) {
			return (
				<tr className="woocommerce-orders-table__row">
					<td className="woocommerce-orders-table__cell" colSpan={5}>
						{__('Loading…', 'moowoodle')}
					</td>
				</tr>
			);
		}

		return courses.map((course, index) => (
			<tr key={index} className="woocommerce-orders-table__row">
				<td
					className="woocommerce-orders-table__cell"
					data-label={__('Username', 'moowoodle')}
				>
					{course.user_name || __('N/A', 'moowoodle')}
				</td>
				<td
					className="woocommerce-orders-table__cell"
					data-label={__('Course Name', 'moowoodle')}
				>
					{course.course_name || __('Unknown Course', 'moowoodle')}
				</td>
				<td
					className="woocommerce-orders-table__cell"
					data-label={__('Enrolment Date', 'moowoodle')}
				>
					{course.enrollment_date ||
						__('No Date Available', 'moowoodle')}
				</td>
				<td
					className="woocommerce-orders-table__cell"
					data-label={__('Action', 'moowoodle')}
				>
					{course.moodle_url ? (
						<div
							className="woocommerce-button wp-element-button moowoodle"
							onClick={() => window.open(course.moodle_url, '_blank', 'noopener,noreferrer')}
							role="button"
							tabIndex={0}
						>
							{__('View', 'moowoodle')}
						</div>
					) : (
						<span className="disabled">
							{__('No Link', 'moowoodle')}
						</span>
					)}
				</td>
			</tr>
		));
	};

	const renderPagination = () => {
		if (totalPages <= 1) {
			return null;
		}

		return (
			<div className="pagination">
				<button
					disabled={currentPage === 1 || loading}
					onClick={() =>
						setCurrentPage((prev) => Math.max(prev - 1, 1))
					}
				>
					{__('Previous', 'moowoodle')}
				</button>
				<span>
					{sprintf(
						// translators: %1$d is the current page number, %2$d is the total number of pages.
						__('Page %1$d of %2$d', 'moowoodle'),
						currentPage,
						totalPages
					)}
				</span>
				<button
					disabled={currentPage === totalPages || loading}
					onClick={() =>
						setCurrentPage((prev) => Math.min(prev + 1, totalPages))
					}
				>
					{__('Next', 'moowoodle')}
				</button>
			</div>
		);
	};

	return (
		<div className="moowoodle-my-courses woocommerce-js">
			{courses.length ? (
				<>
					<table className="moowoodle-table shop_table shop_table_responsive my_account_orders">
						<thead>
							<tr>
								<th className="woocommerce-orders-table__header">
									{__('Username', 'moowoodle')}
								</th>
								<th className="woocommerce-orders-table__header">
									{__('Course Name', 'moowoodle')}
								</th>
								<th className="woocommerce-orders-table__header">
									{__('Enrolment Date', 'moowoodle')}
								</th>
								<th className="woocommerce-orders-table__header">
									{__('Action', 'moowoodle')}
								</th>
							</tr>
						</thead>
						<tbody>{renderTableContent()}</tbody>
					</table>
					{renderPagination()}
				</>
			) : (
				<div className="woocommerce-notices-wrapper">
					<ul className="woocommerce-error" role="alert">
						<li>
							{__(
								"You haven't purchased any courses yet.",
								'moowoodle'
							)}
						</li>
					</ul>
				</div>
			)}
			{error && (
				<div className="woocommerce-notices-wrapper">
					<ul className="woocommerce-error" role="alert">
						<li>{error}</li>
					</ul>
				</div>
			)}
		</div>
	);
};

export default MyCourse;
