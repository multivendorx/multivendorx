/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	Table,
	getApiLink,
	TableCell,
	CommonPopup,
	TextArea,
	BasicInput,
	MultiCalendarInput,
	FormGroupWrapper,
	FormGroup,
	AdminButton,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { formatLocalDate, formatWcShortDate } from '@/services/commonFunction';
export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => React.ReactNode;
}

// QnA Row Type
type QnaRow = {
	id: number;
	product_id: number;
	product_name: string;
	product_link: string;
	question_text: string;
	answer_text: string | null;
	question_by: number;
	author_name: string;
	question_date: string;
	time_ago: string;
	total_votes: number;
	question_visibility: string;
	store_id?: string;
	store_name?: string;
};

type Status = {
	key: string;
	name: string;
	count: number;
};

type StoreQnaRow = {
	id: number;
	product_name: string;
	product_link: string;
	question_text: string;
	answer_text?: string | null;
	author_name?: string;
	question_date?: string;
	time_ago?: string;
	question_visibility?: string;
};

type FilterData = {
	searchField: string;
	categoryFilter?: any;
	store?: string;
	orderBy?: any;
	order?: any;
	question_visibility?: string;
};

const CustomerQuestions: React.FC = () => {
	const [selectedQna, setSelectedQna] = useState<StoreQnaRow | null>(null);
	const [answer, setAnswer] = useState('');
	const [qna, setQna] = useState('');
	const [saving, setSaving] = useState(false);
	const [data, setData] = useState<QnaRow[] | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [status, setStatus] = useState<Status[] | null>(null);

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [pageCount, setPageCount] = useState(0);
	const [dateFilter, setDateFilter] = useState<{
		start_date: Date;
		end_date: Date;
	}>({
		start_date: new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		end_date: new Date(),
	});

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage,);
		setPageCount(Math.ceil(totalRows / rowsPerPage));
	}, [pagination]);

	// Fetch data from backend.
	function requestData(
		rowsPerPage :number,
		currentPage :number,
		categoryFilter = '',
		searchField = '',
		orderBy = '',
		order = '',
		startDate = new Date( new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date(),
		question_visibility = ''
	) {
		setData(null);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'qna'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				status: categoryFilter === 'all' ? '' : categoryFilter,
				store_id: appLocalizer.store_id,
				searchField,
				orderBy,
				order,
				startDate: startDate ? formatLocalDate(startDate) : '',
				endDate: endDate ? formatLocalDate(endDate) : '',
				question_visibility
			},
		})
			.then((response) => {
				setData(response.data.items || []);
				const statuses = [
					{ key: 'all', name: 'All', count: response.data.all || 0 },
					{
						key: 'has_answer',
						name: 'Answered',
						count: response.data.answered || 0,
					},
					{
						key: 'no_answer',
						name: 'Unanswered',
						count: response.data.unanswered || 0,
					},
				];

				setStatus(statuses.filter((status) => status.count > 0));
				setTotalRows(response.data.all|| 0)
				setPageCount(Math.ceil(response.data.all / rowsPerPage));
			})
			.catch(() => {
				setData([]);
			});
	}

	// Handle pagination and filter changes
	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		const date = filterData?.date || {
			start_date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
			end_date: new Date(),
		};
		setDateFilter(date);
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.categoryFilter,
			filterData?.searchField,
			filterData?.orderBy,
			filterData?.order,
			date?.start_date,
			date?.end_date,
			filterData?.question_visibility
		);
	};

	// Save answer
	const handleSaveAnswer = async () => {
		if (!selectedQna) {
			return;
		}
		setSaving(true);
		try {
			await axios.put(
				getApiLink(appLocalizer, `qna/${selectedQna.id}`),
				{
					question_text: qna,
					answer_text: answer,
					question_visibility: 'public',
				},
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			);

			// Update table data after save
			setData((prev) =>
				prev.map((q) =>
					q.id === selectedQna.id
						? {
							...q,
							answer_text: answer,
							question_visibility:
								selectedQna.question_visibility || 'public',
						}
						: q
				)
			);
			requestData(pagination.pageSize, pagination.pageIndex + 1);
			setSelectedQna(null);
			setAnswer('');
		} catch (err) {
			console.error('Failed to save answer:', err);
			alert('Failed to save answer');
		} finally {
			setSaving(false);
		}
	};

	const columns: ColumnDef<QnaRow>[] = [
		{
			id: 'product',
			header: __('Product', 'multivendorx'),
			cell: ({ row }) => {
				const product = row.original;
				const image = product.product_image;

				const { store_id, store_name } = row.original;
				const baseUrl = `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores`;
				const storeLink = store_id
					? `${baseUrl}&edit/${store_id}/&subtab=store-overview`
					: '#';
				return (
					<TableCell title={product.product_name || ''}>
						<a
							href={product.product_link || '#'}
							target="_blank"
							rel="noreferrer"
							className="product-wrapper"
						>
							{image ? (
								<img
									src={image}
									alt={row.original.store_name}
								/>
							) : (
								<i className="item-icon adminfont-multi-product"></i>
							)}
							<div className="details">
								<span className="title">
									{product.product_name || '-'}
								</span>
								{product.sku && (
									<span>
										<b>SKU:</b> {product.sku}
									</span>
								)}

								{store_id ? (
									<>
										<span className="des">
											By {store_name || '-'}
										</span>
									</>
								) : (
									store_name || '-'
								)}
							</div>
						</a>
					</TableCell>
				);
			},
		},
		{
			header: __('Question', 'multivendorx'),
			id: 'question',
			cell: ({ row }) => {
				const text = row.original.question_text ?? '-';
				const displayText =
					text.length > 50 ? text.slice(0, 50) + '…' : text;

				const textAnswer = row.original.answer_text ?? '-';
				const displayAnswer =
					textAnswer.length > 50
						? textAnswer.slice(0, 50) + '…'
						: textAnswer;
				return (
					<TableCell title={text}>
						<div className="question-wrapper">
							<div className="question">Q: {displayText}</div>
							<div className="des">
								By: {row.original.author_name ?? '-'}
							</div>
							{displayAnswer && (
								<div className="answer">A: {displayAnswer}</div>
							)}
						</div>
					</TableCell>
				);
			},
		},
		{
			id: 'question_date',
			header: __('Date', 'multivendorx'),
			accessorFn: (row) =>
				row.question_date ? new Date(row.question_date).getTime() : 0, // numeric timestamp for sorting
			enableSorting: true,
			cell: ({ row }) => {
				return (
					<TableCell title={''}>{formatWcShortDate(row.original.question_date)}</TableCell>
				);
			},
		},
		{
			header: __('Votes', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={String(row.original.total_votes) || ''}>
					{row.original.total_votes ?? 0}
				</TableCell>
			),
		},
		{
			id: 'status',
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				return <TableCell type="status" status={row.original.question_visibility} />;
			},
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					type="action-dropdown"
					rowData={row.original}
					header={{
						actions: [
							{
								label: __('Answer', 'multivendorx'),
								icon: 'adminfont-eye',
								onClick: (rowData: any) => {
									setSelectedQna(rowData);
									setQna(rowData.question_text);
									setAnswer(rowData.answer_text || '');
								},
							}
						],
					}}
				/>
			),
		},
	];

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'question_visibility',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="group-field">
					<select
						name="question_visibility"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">
							{__('All', 'multivendorx')}
						</option>
						<option value="public">
							{__('Public', 'multivendorx')}
						</option>
						<option value="private">
							{__('Private', 'multivendorx')}
						</option>

					</select>
				</div>
			),
		},
		{
			name: 'date',
			render: (updateFilter) => (
				<MultiCalendarInput
					value={{
						startDate: dateFilter.start_date,
						endDate: dateFilter.end_date,
					}}
					onChange={(range: { startDate: Date; endDate: Date }) => {
						const next = {
							start_date: range.startDate,
							end_date: range.endDate,
						};

						setDateFilter(next);
						updateFilter('date', next);
					}}
				/>
			),
		},
	];

	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
				<div className="search-section">
					<input
						name="searchField"
						type="text"
						placeholder={__('Search', 'multivendorx')}
						className="basic-input"
						onChange={(e) => {
							updateFilter(e.target.name, e.target.value);
						}}
						value={filterValue || ''}
					/>
					<i className="adminfont-search"></i>
				</div>
			),
		},
	];

	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Customer questions', 'multivendorx')}
					</div>

					<div className="des">
						{__(
							'Track and respond to customer product questions.',
							'multivendorx'
						)}
					</div>
				</div>
			</div>
			<Table
				data={data}
				columns={columns as ColumnDef<Record<string, any>, any>[]}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
				defaultRowsPerPage={10}
				pageCount={pageCount}
				pagination={pagination}
				onPaginationChange={setPagination}
				perPageOption={[10, 25, 50]}
				totalCounts={totalRows}
				realtimeFilter={realtimeFilter}
				handlePagination={requestApiForData}
				categoryFilter={status as Status[]}
				searchFilter={searchFilter}
			/>

			{selectedQna && (
				<CommonPopup
					open={selectedQna}
					onClose={() => setSelectedQna(null)}
					width="30rem"
					height="70%"
					header={{
						icon: 'question',
						title: __('Answer Question', 'multivendorx'),
						description: __(
							'Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.',
							'multivendorx'
						),
					}}
					footer={
						<AdminButton
							buttons={[
								{
									icon: 'close',
									text: __('Cancel', 'multivendorx'),
									className: 'red',
									onClick: () => setSelectedQna(null),
								},
								{
									icon: 'save',
									text: saving
										? __('Saving...', 'multivendorx')
										: __('Save Answer', 'multivendorx'),
									className: 'purple-bg',
									disabled: saving,
									onClick: handleSaveAnswer,
								},
							]}
						/>
					}
				>
					<FormGroupWrapper>
						<FormGroup label={__('Question', 'multivendorx')} htmlFor="question">
							<BasicInput
								name="question"
								value={qna}
								 
								descClass="settings-metabox-description"
								onChange={(e) => setQna(e.target.value)}
							/>
						</FormGroup>

						<FormGroup label={__('Answer', 'multivendorx')} htmlFor="ans">
							<TextArea
								name="answer"
								value={answer}
								onChange={(e) => setAnswer(e.target.value)}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</CommonPopup>

			)}
		</>
	);
};

export default CustomerQuestions;
