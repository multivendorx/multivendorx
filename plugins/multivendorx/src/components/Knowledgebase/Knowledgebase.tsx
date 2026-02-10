/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	AdminBreadcrumbs, 
	TextArea,
	CommonPopup,
	ToggleSettingUI,
	Container,
	Column,
	FormGroupWrapper,
	FormGroup, 
	ProPopup,
	TableCard,
	BasicInputUI,
	AdminButtonUI,
} from 'zyra';

import '../Announcements/Announcements.scss';
import { Dialog } from '@mui/material';
import { formatLocalDate, formatWcShortDate, truncateText } from '@/services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';


type KBForm = {
	title: string;
	content: string;
	status?: 'publish' | 'pending' | 'draft';
};

export const KnowledgeBase: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);

	const [submitting, setSubmitting] = useState(false);
	const [addEntry, setAddEntry] = useState(false);

	const [editId, setEditId] = useState<number | null>(null);
	const [formData, setFormData] = useState<KBForm>({
		title: '',
		content: '',
		status: 'draft',
	});
	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});
	const [selectedKb, setSelectedKb] = useState<{
		id: number;
	} | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);


	const handleConfirmDelete = () => {
		if (!selectedKb) return;

		const closeConfirm = () => {
			setConfirmOpen(false);
			setSelectedKb(null);
		};

		axios({
			method: 'DELETE',
			url: getApiLink(appLocalizer, `knowledge/${selectedKb.id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then(() => {
				fetchData({});
				closeConfirm();
			})
			.catch(() => {
				closeConfirm();
			});
	};

	const validateForm = () => {
		const errors: { [key: string]: string } = {};

		if (!formData.title.trim()) {
			errors.title = __('Title is required', 'multivendorx');
		}

		if (!formData.content.trim()) {
			errors.content = __('Content is required', 'multivendorx');
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleCloseForm = () => {
		setAddEntry(false);
		setFormData({ title: '', content: '', status: 'pending' }); // reset form
		setEditId(null); // reset edit mode
		setValidationErrors({});
	};
	// Handle input changes
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear field error when user types
		if (validationErrors[name]) {
			setValidationErrors((prev) => {
				const updated = { ...prev };
				delete updated[name];
				return updated;
			});
		}
	};

	const handleBulkAction = (action: string, selectedIds: any[] = []) => {
		if (!selectedIds.length) {
			return;
		}

		if (!action) {
			return;
		}

		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, 'knowledge'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { bulk: true, action, ids: selectedIds },
		})
			.then(() => {
				fetchData({});
			})
			.catch(() => {
				console.log(__('Failed to perform bulk action', 'multivendorx'));
			});
	};


	const handleEdit = (id: number) => {
		axios
			.get(
				getApiLink(appLocalizer, `knowledge/${id}`),
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			)
			.then((response) => {
				setFormData({
					title: response.data.title || '',
					content: response.data.content || '',
					status: response.data.status || 'draft',
				});
				setEditId(id);
				setAddEntry(true);
			})
			.catch(() => {
				console.log(__('Failed to load entry', 'multivendorx'));
			});
	};


	// Submit form
	const handleSubmit = (status: 'publish' | 'pending' | 'draft') => {
		if (submitting) return;
		if (!validateForm()) return;

		setSubmitting(true);

		const endpoint = editId
			? getApiLink(appLocalizer, `knowledge/${editId}`)
			: getApiLink(appLocalizer, 'knowledge');

		const method = editId ? 'PUT' : 'POST';
		const payload = { ...formData, status };

		axios({
			method,
			url: endpoint,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: payload,
		})
			.then((response) => {
				if (response.data?.success) {
					handleCloseForm();
					fetchData({});
				}
				setSubmitting(false);
			})
			.catch(() => {
				console.log(__('Failed to save entry', 'multivendorx'));
				setSubmitting(false);
			});
	};


	const headers = [
		{
			key: 'title',
			label: __('Name your article', 'multivendorx'),
		},
		{
			key: 'content',
			label: __('Write your explanation or tutorial', 'multivendorx'),
		},
		{
			key: 'date',
			label: __('Date', 'multivendorx'),
		},
		{
			key: 'status',
			label: __('Status', 'multivendorx'),
		},
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Edit', 'multivendorx'),
					icon: 'edit',
					onClick: (id: number) => handleEdit(id),
				},
				{
					label: __('Delete', 'multivendorx'),
					icon: 'delete',
					onClick: (id: number) => {
						setSelectedKb({
							id: id,
						});
						setConfirmOpen(true);
					},
					className: 'danger',
				},
			],
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'knowledge'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				withCredentials: true,
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: query.categoryFilter || '',
					searchValue: query.searchValue || '',
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
				},
			})
			.then((response) => {
				const items = response.data || [];

				const ids = items
					.filter((kb: any) => kb?.id != null)
					.map((kb: any) => kb.id);

				setRowIds(ids);

				const mappedRows = items.map((kb: any) => [
					{ display: kb.title, value: kb.id },
					{ display: truncateText(kb.content || '', 50), value: kb.content || '' },
					{ display: formatWcShortDate(kb.date), value: kb.date },
					{ display: kb.status, value: kb.status },
				]);

				setRows(mappedRows);

				setCategoryCounts([
					{ value: 'all', label: 'All', count: Number(response.headers['x-wp-total']) || 0 },
					{ value: 'publish', label: 'Published', count: Number(response.headers['x-wp-status-publish']) || 0 },
					{ value: 'pending', label: 'Pending', count: Number(response.headers['x-wp-status-pending']) || 0 },
					{ value: 'draft', label: 'Draft', count: Number(response.headers['x-wp-status-draft']) || 0 },
				]);

				setTotalRows(Number(response.headers['x-wp-total']) || 0);
			})
			.catch(() => {
				setRows([]);
				setTotalRows(0);
			})
			.then(() => {
				setIsLoading(false);
			});
	};

	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		}
	];

	const bulkActions = [
		{ label: 'Published', value: 'publish' },
		{ label: 'Pending', value: 'pending' },
		{ label: 'Delete', value: 'delete' },
	];

	return (
		<>
			<Dialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
			>
				<ProPopup
					confirmMode
					title="Delete Knowledge Base"
					confirmMessage={
						selectedKb
							? `Are you sure you want to delete knowledge base?`
							: ''
					}
					confirmYesText="Delete"
					confirmNoText="Cancel"
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
						setSelectedKb(null);
					}}
				/>
			</Dialog>
			<AdminBreadcrumbs
				activeTabIcon="adminfont-book"
				tabTitle={__('Knowledge Base', 'multivendorx')}
				description={__(
					'Build your knowledge base: add new guides or manage existing ones in one place.',
					'multivendorx'
				)}
				buttons={[
					<div
						className="admin-btn btn-purple-bg"
						onClick={() => {
							setValidationErrors({});
							setAddEntry(true);
						}}
					>
						<i className="adminfont-plus"></i>
						{__('Add New', 'multivendorx')}
					</div>,
				]}
			/>

			{addEntry && (
				<CommonPopup
					open={addEntry}
					onClose={handleCloseForm}
					width="31.25rem"
					height="70%"
					header={{
						icon: 'book',
						title: editId
							? __('Edit Knowledgebase', 'multivendorx')
							: __('Add Knowledgebase', 'multivendorx'),
						description: __(
							'Write and publish a new knowledge base article to help stores navigate their dashboard.',
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
									onClick: handleCloseForm,
								},
								{
									icon: 'save',
									text: __('Save', 'multivendorx'),
									onClick: () => handleSubmit(formData.status || 'draft'),
								},
							]}
						/>
					}
				>
					<>
						<FormGroupWrapper>
							<FormGroup label={__('Title', 'multivendorx')} htmlFor="Title">
								<BasicInputUI
									type="text"
									name="title"
									value={formData.title}
									onChange={handleChange}
								/>
								{validationErrors.title && (
									<p className="invalid-massage">
										{validationErrors.title}
									</p>
								)}
							</FormGroup>
							<FormGroup label={__('Content', 'multivendorx')} htmlFor="Content">
								<TextArea
									name="content"
									value={formData.content}
									onChange={handleChange}
									usePlainText={false}
									tinymceApiKey={
										appLocalizer.settings_databases_value[
										'overview'
										]['tinymce_api_section'] ?? ''
									}
								/>
								{validationErrors.content && (
									<p className="invalid-massage">
										{validationErrors.content}
									</p>
								)}
							</FormGroup>
							<FormGroup label={__('Status', 'multivendorx')} htmlFor="status">
								<ToggleSettingUI
									value={formData.status}
									options={[
										{
											label: __('Draft', 'multivendorx'),
											value: 'draft',
										},
										{
											label: __(
												'Pending',
												'multivendorx'
											),
											value: 'pending',
										},
										{
											label: __(
												'Published',
												'multivendorx'
											),
											value: 'publish',
										},
									]}
									onChange={(value) =>
										setFormData((prev) => ({
											...prev,
											status: value,
										}))
									}
								/>
							</FormGroup>
							<FormGroup label={__('Add tag', 'multivendorx')} htmlFor="Title">
								<BasicInputUI
									type="text"
									name="title"
								// value={formData.title}
								// onChange={handleChange}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</>
				</CommonPopup>
			)}
			<Container general>
				<Column>
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
						bulkActions={bulkActions}
						onBulkActionApply={(action: string, selectedIds: []) => {
							handleBulkAction(action, selectedIds)
						}}
					/>
				</Column>
			</Container>
		</>
	);
};

export default KnowledgeBase;
