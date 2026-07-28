/* global appLocalizer */
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, sendApiResponse } from '@zyra/core';
import { NoticeManager, PopupComponent } from '@zyra/components';
import { ButtonInput, SelectInput, TextInput } from '@zyra/inputs';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../../services/useApiList';
import TablePage from '../../components/TablePage/TablePage';

interface RedirectRow extends TableRow {
	id: number;
	source_path: string;
	target_url: string;
	redirect_type: 301 | 302;
	hit_count: number;
	is_active: 0 | 1;
	created_at: string;
}

interface NotFoundLogRow extends TableRow {
	id: number;
	requested_path: string;
	referrer: string | null;
	hit_count: number;
	last_seen_at: string;
}

/**
 * Readme.txt's "Redirects & 404s" — a real 301/302 redirect manager plus a
 * 404 visit log, closing the gap the SEO tab's own "Not available yet"
 * placeholder card used to point at (its own Settings → Scanning → SEO
 * toggles previously round-tripped with nothing behind them). Two
 * independent TableCard sections, same "each its own useApiList instance"
 * shape SEO.tsx's per-section FindingsTable usage already established,
 * since a redirect and a 404 log entry are different resources with
 * different actions, not one filtered view of the same list.
 *
 * The Add/Edit form is a controlled popup (not an inline row like
 * AiProvidersPanel.tsx's single-row-at-a-time form) since this table can
 * hold many rows at once, unlike the small, fixed set of AI provider
 * adapters that panel manages.
 */
const Redirects = () => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [sourcePath, setSourcePath] = useState('');
	const [targetUrl, setTargetUrl] = useState('');
	const [redirectType, setRedirectType] = useState<string>('301');
	const [isSaving, setIsSaving] = useState(false);

	const [convertingLogId, setConvertingLogId] = useState<number | null>(
		null
	);
	const [convertTargetUrl, setConvertTargetUrl] = useState('');

	const activeOptions = [
		{ label: __('Active', 'vulopilot'), value: '1' },
		{ label: __('Inactive', 'vulopilot'), value: '0' },
	];

	const redirects = useApiList<RedirectRow>(
		'redirects',
		{},
		{ key: 'is_active', options: activeOptions }
	);

	const notFoundLogs = useApiList<NotFoundLogRow>('not-found-logs', {
		orderby: 'last_seen_at',
	});

	const resetForm = () => {
		setEditingId(null);
		setSourcePath('');
		setTargetUrl('');
		setRedirectType('301');
	};

	const openAddForm = () => {
		resetForm();
		setIsFormOpen(true);
	};

	const openEditForm = (row: RedirectRow) => {
		setEditingId(row.id);
		setSourcePath(row.source_path);
		setTargetUrl(row.target_url);
		setRedirectType(String(row.redirect_type));
		setIsFormOpen(true);
	};

	const handleSaveRedirect = () => {
		setIsSaving(true);

		const endpoint = editingId
			? `redirects/${editingId}`
			: 'redirects';

		sendApiResponse(appLocalizer, getApiLink(appLocalizer, endpoint), {
			...(editingId ? {} : { source_path: sourcePath }),
			target_url: targetUrl,
			redirect_type: Number(redirectType),
		})
			.then((response) => {
				NoticeManager.add({
					uniqueKey: 'vulopilot-redirect-save',
					type: response ? 'success' : 'error',
					position: 'float',
					message: response
						? __('Redirect saved.', 'vulopilot')
						: __(
								'Could not save this redirect — check the path and URL and try again.',
								'vulopilot'
							),
				});

				if (response) {
					setIsFormOpen(false);
					resetForm();
					redirects.refetch();
				}
			})
			.finally(() => setIsSaving(false));
	};

	const handleToggleActive = (row: RedirectRow) => {
		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, `redirects/${row.id}`),
			{ is_active: row.is_active ? 0 : 1 }
		).then((response) => {
			if (response) {
				redirects.refetch();
			}
		});
	};

	const handleDeleteRedirect = (row: RedirectRow) => {
		if (
			!window.confirm(
				__('Delete this redirect? This cannot be undone.', 'vulopilot')
			)
		) {
			return;
		}

		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, `redirects/${row.id}/delete`),
			{}
		).then((response) => {
			NoticeManager.add({
				uniqueKey: 'vulopilot-redirect-delete',
				type: response ? 'success' : 'error',
				position: 'float',
				message: response
					? __('Redirect deleted.', 'vulopilot')
					: __('Could not delete this redirect.', 'vulopilot'),
			});

			if (response) {
				redirects.refetch();
			}
		});
	};

	const handleDismissLog = (row: NotFoundLogRow) => {
		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, `not-found-logs/${row.id}/delete`),
			{}
		).then((response) => {
			if (response) {
				notFoundLogs.refetch();
			}
		});
	};

	const handleConvertLog = (row: NotFoundLogRow) => {
		if (convertingLogId !== row.id) {
			setConvertingLogId(row.id);
			setConvertTargetUrl('');
			return;
		}

		if ('' === convertTargetUrl.trim()) {
			return;
		}

		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, `not-found-logs/${row.id}/convert`),
			{ target_url: convertTargetUrl }
		).then((response) => {
			NoticeManager.add({
				uniqueKey: 'vulopilot-log-convert',
				type: response ? 'success' : 'error',
				position: 'float',
				message: response
					? __('Redirect created from this log entry.', 'vulopilot')
					: __(
							'Could not create a redirect — a redirect for this path may already exist.',
							'vulopilot'
						),
			});

			if (response) {
				setConvertingLogId(null);
				setConvertTargetUrl('');
				notFoundLogs.refetch();
				redirects.refetch();
			}
		});
	};

	return (
		<TablePage
			headerIcon="admin-links"
			headerTitle={__('Redirects & 404s', 'vulopilot')}
			headerDescription={__(
				'Manage 301/302 redirects and see which missing URLs visitors are actually hitting.',
				'vulopilot'
			)}
			headerAction={
				<ButtonInput
					buttons={{
						text: __('Add redirect', 'vulopilot'),
						icon: 'plus',
						onClick: openAddForm,
					}}
				/>
			}
			error={redirects.error}
			onRetry={redirects.refetch}
			errorTitle={__('Could not load redirects', 'vulopilot')}
		>
			<TableCard
				buttonActions={[
					{
						label: __('Add redirect', 'vulopilot'),
						onClick: openAddForm,
					},
				]}
				search={{
					placeholder: __('Search redirects…', 'vulopilot'),
				}}
				headers={{
					source_path: {
						label: __('From', 'vulopilot'),
					},
					target_url: {
						label: __('To', 'vulopilot'),
					},
					redirect_type: {
						label: __('Type', 'vulopilot'),
					},
					hit_count: {
						label: __('Hits', 'vulopilot'),
						isSortable: true,
					},
					is_active: {
						label: __('Status', 'vulopilot'),
						type: 'badge',
						statusClass: (row: RedirectRow) =>
							row.is_active ? 'status-active' : 'status-inactive',
					},
					actions: {
						label: __('Actions', 'vulopilot'),
						type: 'action',
						actions: [
							{
								label: __('Edit', 'vulopilot'),
								icon: 'edit',
								onClick: (row?: Record<string, unknown>) =>
									row && openEditForm(row as RedirectRow),
							},
							{
								label: (row?: Record<string, unknown>) =>
									row?.is_active
										? __('Deactivate', 'vulopilot')
										: __('Activate', 'vulopilot'),
								icon: 'controls-repeat',
								onClick: (row?: Record<string, unknown>) =>
									row &&
									handleToggleActive(row as RedirectRow),
							},
							{
								label: __('Delete', 'vulopilot'),
								icon: 'trash',
								onClick: (row?: Record<string, unknown>) =>
									row &&
									handleDeleteRedirect(row as RedirectRow),
							},
						] as any[],
					},
				}}
				rows={redirects.data}
				ids={redirects.data.map((row) => row.id)}
				totalRows={redirects.total}
				categoryCounts={redirects.categoryCounts}
				isLoading={redirects.isLoading}
				onQueryUpdate={redirects.onQueryUpdate}
				emptyMessage={__(
					'No redirects yet — add one, or convert an entry from the 404 log below.',
					'vulopilot'
				)}
			/>

			<TableCard
				search={{
					placeholder: __('Search missing URLs…', 'vulopilot'),
				}}
				headers={{
					requested_path: {
						label: __('Requested URL', 'vulopilot'),
					},
					hit_count: {
						label: __('Hits', 'vulopilot'),
						isSortable: true,
					},
					last_seen_at: {
						label: __('Last seen', 'vulopilot'),
						type: 'date',
						isSortable: true,
						defaultSort: true,
						defaultOrder: 'desc',
					},
					actions: {
						label: __('Actions', 'vulopilot'),
						type: 'action',
						actions: [
							{
								label: (row?: Record<string, unknown>) =>
									convertingLogId === row?.id
										? __('Confirm →', 'vulopilot')
										: __('Create redirect', 'vulopilot'),
								icon: 'admin-links',
								onClick: (row?: Record<string, unknown>) =>
									row &&
									handleConvertLog(row as NotFoundLogRow),
							},
							{
								label: __('Dismiss', 'vulopilot'),
								icon: 'no',
								onClick: (row?: Record<string, unknown>) =>
									row && handleDismissLog(row as NotFoundLogRow),
							},
						] as any[],
					},
				}}
				rows={notFoundLogs.data}
				ids={notFoundLogs.data.map((row) => row.id)}
				totalRows={notFoundLogs.total}
				isLoading={notFoundLogs.isLoading}
				onQueryUpdate={notFoundLogs.onQueryUpdate}
				emptyMessage={__(
					'No 404s logged yet — turn on "Log 404s" in Settings → Scanning → SEO to start tracking missing-page visits.',
					'vulopilot'
				)}
			/>

			{convertingLogId && (
				<div className="vulopilot-redirect-convert-inline">
					<TextInput
						name="convert_target_url"
						placeholder={__(
							'Redirect this URL to…',
							'vulopilot'
						)}
						value={convertTargetUrl}
						onChange={(newValue) =>
							setConvertTargetUrl(newValue as string)
						}
					/>
				</div>
			)}

			<PopupComponent
				open={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					resetForm();
				}}
				width={28}
				height="auto"
				position="lightbox"
				header={{
					title: editingId
						? __('Edit redirect', 'vulopilot')
						: __('Add redirect', 'vulopilot'),
				}}
			>
				<div className="vulopilot-redirect-form">
					<TextInput
						name="source_path"
						placeholder={__('/old-page/', 'vulopilot')}
						value={sourcePath}
						disabled={!!editingId}
						onChange={(newValue) =>
							setSourcePath(newValue as string)
						}
					/>
					<TextInput
						name="target_url"
						placeholder={__(
							'https://example.com/new-page/',
							'vulopilot'
						)}
						value={targetUrl}
						onChange={(newValue) =>
							setTargetUrl(newValue as string)
						}
					/>
					<SelectInput
						name="redirect_type"
						value={redirectType}
						options={[
							{ label: '301 (Permanent)', value: '301' },
							{ label: '302 (Temporary)', value: '302' },
						]}
						onChange={(newValue) =>
							setRedirectType(newValue as string)
						}
						size="12rem"
					/>
					<ButtonInput
						buttons={{
							text: __('Save', 'vulopilot'),
							onClick: handleSaveRedirect,
							disabled: isSaving,
						}}
					/>
				</div>
			</PopupComponent>
		</TablePage>
	);
};

export default Redirects;
