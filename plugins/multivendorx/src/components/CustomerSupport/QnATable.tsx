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
} from 'zyra';

// import { Dialog } from '@mui/material';
import { formatLocalDate, formatWcShortDate, truncateText } from '@/services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

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
		categoryCounts[] | null
	>(null);

	const [selectedQna, setSelectedQna] = useState<StoreQnaRow | null>(null);
	const [answer, setAnswer] = useState('');
	const [qna, setQna] = useState('');

	const [selectedQn, setSelectedQn] = useState<{
		id: number;
	} | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleConfirmDelete = () => {
		if (!selectedQn) return;

		axios({
			method: 'DELETE',
			url: getApiLink(appLocalizer, `qna/${selectedQn.id}`),
			headers: {
				'X-WP-Nonce': appLocalizer.nonce,
			},
		})
			.then(() => {
				fetchData({});
			})
			.finally(() => {
				setConfirmOpen(false);
				setSelectedQn(null);
			});
	};

	const fetchQnaById = (id: number) => {
		setIsLoading(true);

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
			})
			.finally(() => setIsLoading(false));
	};

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const options =
					(response.data || []).map((store: any) => ({
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
		if (!selectedQna) return;

		axios
			.put(
				getApiLink(appLocalizer, `qna/${selectedQna.id}`),
				{
					question_text: qna,
					answer_text: answer,
					question_visibility: selectedQna.question_visibility || 'public',
				},
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				fetchData({});
				// Reset popup
				setSelectedQna(null);
				setAnswer('');
			})
			.catch(() => {
				alert('Failed to save answer');
			});
	};


	const headers = [
		{ key: 'product', label: 'Product' },
		{ key: 'question', label: 'Question' },
		{ key: 'question_date', label: 'Date' },
		{ key: 'votes', label: 'Votes' },
		{ key: 'status', label: 'Visibility' },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Answer', 'multivendorx'),
					icon: 'eye',
					onClick: (id: number) => fetchQnaById(id),
				},
				{
					label: __('Delete', 'multivendorx'),
					icon: 'delete',
					onClick: (id: number) => {
						setSelectedQn({ id: id, });
						setConfirmOpen(true);
					},
				},
			],
		},
	];

	const filters = [
		{
			key: 'storeId',
			label: 'Stores',
			type: 'select',
			options: store,
		},
		{
			key: 'questionVisibility',
			label: 'Status',
			type: 'select',
			options: [
				{ label: 'All', value: '' },
				{ label: 'Public', value: 'public' },
				{ label: 'Private', value: 'private' },
			],
		},
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'qna'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: query.categoryFilter || '',
					searchValue: query.searchValue || '',
					storeId: query?.filter?.storeId,
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					questionVisibility: query?.filter?.questionVisibility,
					orderBy: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((ann: any) => ann?.id != null)
					.map((ann: any) => ann.id);

				setRowIds(ids);
				const mappedRows: any[][] = items.map((product: any) => [
					{
						type: 'product',
						value: product.id,
						display: product.name,
						data: {
							name: product.product_name,
							sku: product.sku,
							image: product.images?.[0]?.src || '',
							link: `${appLocalizer.site_url}/wp-admin/post.php?post=${product.id}&action=edit`,
						},
					},
					{
						type: 'card',
						value: product.id,
						display: product.name,
						data: {
							name: `Q : ${truncateText(product.question_text, 50)}`,
							description: `By: ${product.author_name}`,
							subDescription: `A: ${truncateText(product.answer_text, 50)}`
						},
					},
					{ display: formatWcShortDate(product.question_date), value: product.question_date },
					{
						display: product.total_votes,
						value: product.total_votes || 0,
					},
					{ display: product.question_visibility, value: product.question_visibility },
				]);

				setRows(mappedRows);

				setCategoryCounts([
					{
						value: 'all',
						label: 'All',
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'has_answer',
						label: 'Answered',
						count: Number(response.headers['x-wp-status-answered']) || 0,
					},
					{
						value: 'no_answer',
						label: 'Unanswered',
						count: Number(response.headers['x-wp-status-unanswered']) || 0,
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
			{/* <Dialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
			>
				<ProPopup
					confirmMode
					title="Delete Question"
					confirmMessage={
						selectedQn
							? `Are you sure you want to delete Question?`
							: ''
					}
					confirmYesText="Delete"
					confirmNoText="Cancel"
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
						setSelectedQn(null);
					}}
				/>
			</Dialog> */}
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={fetchData}
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
					<>
						<FormGroupWrapper>
							<FormGroup label={__('Question', 'multivendorx')} htmlFor="question">
								<BasicInputUI
									name="phone"
									value={qna}
									onChange={(e) => setQna(e.target.value)}
								/>
							</FormGroup>
							<FormGroup label={__('Answer', 'multivendorx')} htmlFor="ans">
								<TextAreaUI
									name="answer"
									value={answer}
									onChange={(e) => setAnswer(e.target.value)}
								/>
							</FormGroup>
							<FormGroup label={__('Decide whether this Q&A is visible to everyone or only to the store team', 'multivendorx')} htmlFor="visibility">
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
											label: __(
												'Private',
												'multivendorx'
											),
										},
									]}
									value={
										selectedQna.question_visibility ||
										'public'
									}
									onChange={(value) =>
										setSelectedQna((prev) =>
											prev
												? {
													...prev,
													question_visibility:
														value,
												}
												: prev
										)
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</>
				</PopupUI>
			)}
		</>
	);
};

export default Qna;
