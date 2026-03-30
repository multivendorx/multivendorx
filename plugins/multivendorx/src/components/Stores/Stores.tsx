/* global appLocalizer */
import { useLocation, useNavigate } from 'react-router-dom';
import StoreTable from './StoreTable';
import EditStore from './Edit/EditStore';
import {
	ButtonInputUI,
	BasicInputUI,
	EmailsInputUI,
	FileInputUI,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	NavigatorHeader,
	PopupUI,
	SelectInputUI,
	TextAreaUI,
} from 'zyra';
import { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

const Stores = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const [addStore, setAddStore] = useState(false);
	const [formData, setFormData] = useState<Record<string, string>>({});
	const [error, setError] = useState<
		Record<string, { type: string; message: string }>
	>({});

	const hash = location.hash;
	const isTabActive = hash.includes('tab=stores');
	const isEditStore = hash.includes('edit');
	const generateSlug = (text: string) =>
		text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/--+/g, '-');

	const checkSlugExists = async (slug: string): Promise<boolean> => {
		try {
			const response = await axios.get(
				getApiLink(appLocalizer, 'store'),
				{
					params: { slug },
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);
			return response.data.exists;
		} catch {
			return false;
		}
	};

	const setFieldError = (key: string, message: string) => {
		setError((prev) => ({ ...prev, [key]: { type: 'error', message } }));
	};

	const setFieldSuccess = (key: string, message: string) => {
		setError((prev) => ({ ...prev, [key]: { type: 'success', message } }));
	};

	const handleSlugCheck = async () => {
		if (!formData.slug) {
			setError({
				slug: {
					type: 'error',
					message: 'Slug is required',
				},
			});
			return;
		}

		const exists = await checkSlugExists(formData.slug);

		if (exists) {
			setFieldError(
				'slug',
				`${__('Slug', 'multivendorx')} "${formData.slug}" ${__('already exists.', 'multivendorx')}`
			);
		} else {
			setFieldSuccess('slug', __('Available', 'multivendorx'));
		}
	};

	const handleChange = (name: 'name' | 'slug', value: string) => {
		setFormData((prev) => {
			if (name === 'name') {
				return {
					...prev,
					name: value,
					slug: generateSlug(value),
				};
			}
			if (name === 'slug') {
				return {
					...prev,
					slug: value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase(),
				};
			}
			return prev;
		});

		clearFieldError(name);
		
	};

	const saveEmails = (emailList: string[], primary: string) => {
		setFormData((prev) => ({
			...prev,
			primary_email: primary,
			emails: emailList,
		}));

		clearFieldError('email');
	};

	const resetForm = () => {
		setFormData({});
		setError({});
	};

	const handleSubmit = async () => {
		const { name, slug, store_owners } = formData;

		if (!name?.trim()) {
			setFieldError(
				'name',
				__('Store name is required.', 'multivendorx')
			);
			return;
		}

		if (!slug?.trim()) {
			setFieldError(
				'slug',
				__('Store slug is required.', 'multivendorx')
			);
			return;
		}

		if (!formData.primary_email?.trim()) {
			setFieldError(
				'email',
				__('Store email is required.', 'multivendorx')
			);
			return;
		}

		if (!store_owners) {
			setFieldError(
				'primary',
				__('Primary owner is required.', 'multivendorx')
			);
			return;
		}

		// Re-check slug in case it was manually changed after the last check
		const exists = await checkSlugExists(slug);
		if (exists) {
			setFieldError(
				'slug',
				`${__('Slug', 'multivendorx')} "${slug}" ${__('already exists.', 'multivendorx')}`
			);
			return;
		}

		setError({});

		try {
			const response = await axios({
				method: 'POST',
				url: getApiLink(appLocalizer, 'store'),
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				data: { formData: { ...formData, status: 'active' } },
			});

			if (response.data.success) {
				setAddStore(false);
				resetForm();
				navigate(
					`?page=multivendorx#&tab=stores&edit/${response.data.id}`
				);
			}
		} catch {
			setFieldError(
				'name',
				__(
					'Something went wrong while saving the store.',
					'multivendorx'
				)
			);
		}
	};

	// This function now returns the notice props instead of the Notice component
	const getFieldNotice = (key: string) => {
		const err = error?.[key];
		if (!err?.message) {
			return { notice: undefined, noticeType: 'error' };
		}

		return {
			notice: err.message,
			noticeType: err.type as 'error' | 'success',
		};
	};

	const clearFieldError = (key: string) => {
		setError((prev) => {
			const updated = { ...prev };
			delete updated[key];
			return updated;
		});
	};
	return (
		<>
			{isTabActive && isEditStore && <EditStore />}

			{!isEditStore && (
				<>
					<NavigatorHeader
						headerIcon="storefront"
						headerTitle={__('Stores', 'multivendorx')}
						headerDescription={__(
							'Manage marketplace stores with ease. Review, edit, or add new stores anytime.',
							'multivendorx'
						)}
						buttons={[
							{
								label: __('Add Store', 'multivendorx'),
								icon: 'plus',
								onClick: () => {
									setAddStore(true);
								},
							},
						]}
					/>
					{addStore && (
						<PopupUI
							open={addStore}
							width={31.25}
							onClose={() => {
								resetForm();
								setAddStore(false);
							}}
							header={{
								icon: 'storefront',
								title: __('Add Store', 'multivendorx'),
								description: __(
									'Create a new store and set it up with essential details.',
									'multivendorx'
								),
							}}
							footer={
								<ButtonInputUI
									buttons={[
										{
											icon: 'close',
											text: __('Cancel', 'multivendorx'),
											color: 'red',
											onClick: () => {
												resetForm();
												setAddStore(false);
											},
										},
										{
											icon: 'save',
											text: __('Submit', 'multivendorx'),
											onClick: handleSubmit,
										},
									]}
								/>
							}
						>
							<FormGroupWrapper>
								<FormGroup
									label={__('Store name', 'multivendorx')}
									htmlFor="store-name"
									{...getFieldNotice('name')}
								>
									<BasicInputUI
										name="name"
										value={formData.name || ''}
										onChange={(val) =>
											handleChange('name', val as string)
										}
									/>
								</FormGroup>

								<FormGroup
									label={__('Store slug', 'multivendorx')}
									htmlFor="store-slug"
									{...getFieldNotice('slug')}
								>
									<BasicInputUI
										name="slug"
										value={formData.slug || ''}
										onChange={(val) =>
											handleChange('slug', val as string)
										}
									/>
									<ButtonInputUI
										buttons={{
											text: __(
												'Check Slug',
												'multivendorx'
											),
											onClick: handleSlugCheck,
										}}
									/>
								</FormGroup>

								<FormGroup
									label={__('Store Email', 'multivendorx')}
									{...getFieldNotice('email')}
								>
									<EmailsInputUI
										value={formData.emails || []}
										enablePrimary={true}
										onChange={(list, primary) =>
											saveEmails(list, primary)
										}
									/>
								</FormGroup>

								<FormGroup
									label={__('Description', 'multivendorx')}
									htmlFor="Description"
								>
									<TextAreaUI
										name="description"
										value={formData.description || ''}
										onChange={(val: string) =>
											setFormData((prev) => ({
												...prev,
												description: val,
											}))
										}
										usePlainText={false}
										tinymceApiKey={
											appLocalizer
												.settings_databases_value[
												'overview'
											]?.['tinymce_api_section'] ?? ''
										}
									/>
								</FormGroup>

								<FormGroup
									label={__('Primary owner', 'multivendorx')}
									htmlFor="store_owners"
									{...getFieldNotice('primary')}
								>
									<SelectInputUI
										name="store_owners"
										options={
											appLocalizer?.store_owners || []
										}
										value={formData.store_owners}
										type="single-select"
										onChange={(newValue) => {
											setFormData((prev) => ({
												...prev,
												store_owners: newValue,
											}));

											clearFieldError('primary');
										}}
									/>
								</FormGroup>

								<FormGroup
									label={__('Profile image', 'multivendorx')}
									htmlFor="store_owners"
								>
									<FileInputUI
										name="image"
										accept={
											'.jpg,.jpeg,.png,.gif,.pdf,.zip'
										}
										imageSrc={formData.image || ''}
										imageWidth={75}
										imageHeight={75}
										openUploader={__(
											'Upload Image',
											'multivendorx'
										)}
										onChange={(val) => {
											const [file] = Array.isArray(val)
												? val
												: [val];
											const url = file?.url || '';

											setFormData((prev) => ({
												...prev,
												image: url,
											}));
										}}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</PopupUI>
					)}
					<StoreTable />
				</>
			)}
		</>
	);
};

export default Stores;
