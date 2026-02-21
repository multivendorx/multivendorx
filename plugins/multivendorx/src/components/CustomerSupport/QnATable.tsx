/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	FormGroupWrapper,
	FormGroup,
	TableCard,
	BasicInputUI,
	AdminButtonUI,
	ToggleSettingUI,
	TextAreaUI,
	PopupUI,
	TableRow,
	QueryProps,
	CategoryCount,
} from 'zyra';

import Popup from '../Popup/Popup';
import { formatLocalDate, truncateText } from '@/services/commonFunction';

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

const Qna: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [store, setStore] = useState<any[] | null>(null);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);

	const [selectedQna, setSelectedQna] = useState<StoreQnaRow | null>(null);
	const [answer, setAnswer] = useState('');
	const [qna, setQna] = useState('');

	const [selectedQn, setSelectedQn] = useState<{
		id: number;
	} | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleConfirmDelete = () => {
		if (!selectedQn) {
			return;
		}

		axios({
			method: 'DELETE',
			url: getApiLink(appLocalizer, `qna/${selectedQn.id}`),
			headers: {
				'X-WP-Nonce': appLocalizer.nonce,
			},
		})
			.then(() => {
				doRefreshTableData({});
			})
			.finally(() => {
				setConfirmOpen(false);
				setSelectedQn(null);
			});
	};

	const fetchQnaById = (id: number) => {
		return axios
			.get(getApiLink(appLocalizer, `qna/${id}`), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const item = response.data;
				setSelectedQna({
					id: item.id,
					product_name: item.product_name,
					product_link: item.product_link,
					question_text: item.question_text,
					answer_text: item.answer_text || '',
					author_name: item.author_name,
					question_date: item.question_date,
					question_visibility: item.question_visibility || 'public',
				});
				setQna(item.question_text);
				setAnswer(item.answer_text || '');
			});
	};

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const options = (response.data || []).map((store: any) => ({
					label: store.store_name,
					value: store.id,
				}));

				setStore(options);
				setIsLoading(false);
			})
			.catch(() => {
				setStore([]);
				setIsLoading(false);
			});
	}, []);

	const handleSaveAnswer = () => {
		if (!selectedQna) {
			return;
		}

		axios
			.put(
				getApiLink(appLocalizer, `qna/${selectedQna.id}`),
				{
					question_text: qna,
					answer_text: answer,
					question_visibility:
						selectedQna.question_visibility || 'public',
				},
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				doRefreshTableData({});
				// Reset popup
				setSelectedQna(null);
				setAnswer('');
			})
			.catch(() => {
				alert('Failed to save answer');
			});
	};

	const headers = {
		name: {
			label: __('Product', 'multivendorx'),
		},
		question_text: {
			label: __('Question', 'multivendorx'),
		},
		answer_text: {
			label: __('Ans', 'multivendorx'),
		},
		question_date: {
			label: __('Date', 'multivendorx'),
			type: 'date',
		},
		total_votes: {
			label: __('Votes', 'multivendorx'),
		},
		question_visibility: {
			label: __('Visibility', 'multivendorx'),
		},
		action: {
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Answer', 'multivendorx'),
					icon: 'eye',
					onClick: (row) => fetchQnaById(row.id),
				},
				{
					label: __('Delete', 'multivendorx'),
					icon: 'delete',
					onClick: (row) => {
						setSelectedQn({ id: row.id });
						setConfirmOpen(true);
					},
				},
			],
		},
	};

	const filters = [
		{
			key: 'storeId',
			label: __('Stores', 'multivendorx'),
			type: 'select',
			options: store,
		},
		{
			key: 'questionVisibility',
			label: __('Status', 'multivendorx'),
			type: 'select',
			options: [
				{ label: __('All', 'multivendorx'), value: '' },
				{ label: __('Public', 'multivendorx'), value: 'public' },
				{ label: __('Private', 'multivendorx'), value: 'private' },
			],
		},
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'qna'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: query.categoryFilter || '',
					search_value: query.searchValue || '',
					store_id: query?.filter?.storeId,
					start_date: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					end_date: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					question_visibility: query?.filter?.questionVisibility,
					order_by: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item: any) => item?.id != null)
					.map((item: any) => item.id);

				setRowIds(ids);
				setRows(items);

				setCategoryCounts([
					{
						value: 'all',
						label: __('All', 'multivendorx'),
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'has_answer',
						label: __('Answered', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-answered']) ||
							0,
					},
					{
						value: 'no_answer',
						label: __('Unanswered', 'multivendorx'),
						count:
							Number(
								response.headers['x-wp-status-unanswered']
							) || 0,
					},
				]);

				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	return (
		<>
			<PopupUI
				position="lightbox"
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				width={31.25}
			>
				<Popup
					confirmMode
					title={__('Delete Question', 'multivendorx')}
					confirmMessage={
						selectedQn
							? __('Are you sure you want to delete Question?', 'multivendorx')
							: ''
					}
					confirmYesText={__('Delete', 'multivendorx')}
					confirmNoText={__('Cancel', 'multivendorx')}
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
						setSelectedQn(null);
					}}
				/>
			</PopupUI>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				categoryCounts={categoryCounts}
				search={{}}
				filters={filters}
				format={appLocalizer.date_format}
			/>
			{selectedQna && (
				<PopupUI
					open={selectedQna}
					onClose={() => setSelectedQna(null)}
					width={30}
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
						<AdminButtonUI
							buttons={[
								{
									icon: 'close',
									text: __('Cancel', 'multivendorx'),
									color: 'red',
									onClick: () => setSelectedQna(null),
								},
								{
									icon: 'save',
									text: __('Save Answer', 'multivendorx'),
									onClick: () => handleSaveAnswer(),
								},
							]}
						/>
					}
				>
					<FormGroupWrapper>
						<FormGroup
							label={__('Question', 'multivendorx')}
							htmlFor="phone"
						>
							<BasicInputUI
								name="phone"
								value={qna}
								onChange={(value: string) => setQna(value)}
							/>
						</FormGroup>
						<FormGroup
							label={__('Answer', 'multivendorx')}
							htmlFor="ans"
						>
							<TextAreaUI
								name="answer"
								value={answer}
								onChange={(value: string) => setAnswer(value)}
							/>
						</FormGroup>
						<FormGroup
							label={__(
								'Decide whether this Q&A is visible to everyone or only to the store team',
								'multivendorx'
							)}
							htmlFor="visibility"
						>
							<ToggleSettingUI
								options={[
									{
										key: 'public',
										value: 'public',
										label: __('Public', 'multivendorx'),
									},
									{
										key: 'private',
										value: 'private',
										label: __('Private', 'multivendorx'),
									},
								]}
								value={
									selectedQna.question_visibility || 'public'
								}
								onChange={(value) =>
									setSelectedQna((prev) =>
										prev
											? {
												...prev,
												question_visibility: value,
											}
											: prev
									)
								}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</PopupUI>
			)}
		</>
	);
};

export default Qna;
