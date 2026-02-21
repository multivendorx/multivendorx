/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	FormGroupWrapper,
	FormGroup,
	TableCard,
	BasicInputUI,
	TextAreaUI,
	PopupUI,
	AdminButtonUI,
	NavigatorHeader,
	TableRow,
	QueryProps,
	CategoryCount,
} from 'zyra';
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

const CustomerQuestions: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);

	const [selectedQna, setSelectedQna] = useState<StoreQnaRow | null>(null);
	const [answer, setAnswer] = useState('');
	const [qna, setQna] = useState('');
	const [saving, setSaving] = useState(false);

	// Save answer
	const handleSaveAnswer = () => {
		if (!selectedQna) {
			return;
		}
		setSaving(true);
		axios
			.put(
				getApiLink(appLocalizer, `qna/${selectedQna.id}`),
				{
					question_text: qna,
					answer_text: answer,
					question_visibility: 'public',
				},
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				doRefreshTableData({});
				setSelectedQna(null);
				setAnswer('');
				setSaving(false);
			})
			.catch(() => {
				alert('Failed to save answer');
				setSaving(false);
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
			key: 'action',
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Answer', 'multivendorx'),
					icon: 'eye',
					onClick: (row) => fetchQnaById(row.id),
				},
			],
		},
	};
	const filters = [
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
					params: {
						page: query.paged || 1,
						row: query.per_page || 10,
						status: query.categoryFilter || '',
						search_value: query.searchValue || '',
						store_id: appLocalizer.store_id,
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
			<NavigatorHeader
				headerTitle={__('Customer questions', 'multivendorx')}
				headerDescription={__(
					'Track and respond to customer product questions.',
					'multivendorx'
				)}
			/>

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
									text: saving
										? __('Saving...', 'multivendorx')
										: __('Save Answer', 'multivendorx'),
									disabled: saving,
									onClick: handleSaveAnswer,
								},
							]}
						/>
					}
				>
					<FormGroupWrapper>
						<FormGroup
							label={__('Question', 'multivendorx')}
							htmlFor="question"
						>
							<BasicInputUI
								name="question"
								value={qna}
								onChange={(value) => setQna(value)}
							/>
						</FormGroup>

						<FormGroup
							label={__('Answer', 'multivendorx')}
							htmlFor="ans"
						>
							<TextAreaUI
								name="answer"
								value={answer}
								onChange={(value) => setAnswer(value)}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</PopupUI>
			)}
		</>
	);
};

export default CustomerQuestions;
