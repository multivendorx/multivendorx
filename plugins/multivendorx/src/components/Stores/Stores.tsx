import { useLocation, useNavigate } from 'react-router-dom';
import StoreTable from './StoreTable';
import EditStore from './Edit/EditStore';
import {
	AdminButtonUI,
	BasicInputUI,
	EmailsInput,
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
	const [imagePreview, setImagePreview] = useState<string>('');
	const [error, setError] = useState<
		Record<string, { type: string; message: string }>
	>({});

	const hash = location.hash;
	const isTabActive = hash.includes('tab=stores');
	const isAddStore = hash.includes('create');
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
			const response = await axios.get(getApiLink(appLocalizer, 'store'), {
				params: { slug },
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			});
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
			setFieldError('slug', `${__('Slug', 'multivendorx')} "${formData.slug}" ${__('already exists.', 'multivendorx')}`);
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
	};

	const saveEmails = (emailList: string[], primary: string) => {
		setFormData((prev) => ({ ...prev, primary_email: primary, emails: emailList }));
	};

	const resetForm = () => {
		setFormData({});
		setImagePreview('');
		setError({});
	};

	const handleSubmit = async () => {
		const { name, slug, store_owners } = formData;

		if (!name?.trim()) {
			setFieldError('name', __('Store name is required.', 'multivendorx'));
			return;
		}

		if (!slug?.trim()) {
			setFieldError('slug', __('Store slug is required.', 'multivendorx'));
			return;
		}

		if (!formData.primary_email?.trim()) {
			setFieldError('email', __('Store email is required.', 'multivendorx'));
			return;
		}

		if (!store_owners) {
			setFieldError('primary', __('Primary owner is required.', 'multivendorx'));
			return;
		}

		// Re-check slug in case it was manually changed after the last check
		const exists = await checkSlugExists(slug);
		if (exists) {
			setFieldError('slug', `${__('Slug', 'multivendorx')} "${slug}" ${__('already exists.', 'multivendorx')}`);
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
				navigate(`?page=multivendorx#&tab=stores&edit/${response.data.id}`);
			}
		} catch {
			setFieldError('name', __('Something went wrong while saving the store.', 'multivendorx'));
		}
	};

	// Open WordPress media uploader
	const runUploader = (key: string) => {
		const frame: any = (window as any).wp.media({
			title: 'Select or Upload Image',
			button: { text: 'Use this image' },
			multiple: false,
		});

		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();
			setFormData((prev) => ({ ...prev, [key]: attachment.url }));
			setImagePreview(attachment.url);
		});

		frame.open();
	};

	const handleRemoveImage = (key: string) => {
		setFormData((prev) => ({ ...prev, [key]: '' }));
		setImagePreview('');
	};

	// This function now returns the notice props instead of the Notice component
	const getFieldNotice = (key: string) => {
		const err = error?.[key];
		if (!err?.message) return { notice: undefined, noticeType: 'error' };

		return {
			notice: err.message,
			noticeType: err.type as 'error' | 'success'
		};
	};

	return (
		<>
			{isTabActive && isEditStore && !isAddStore && <EditStore />}

			{!isAddStore && !isEditStore && (
				<>
					<NavigatorHeader
						headerIcon="storefront"
						headerTitle="Stores"
						headerDescription={__(
							'Manage marketplace stores with ease. Review, edit, or add new stores anytime.',
							'multivendorx'
						)}
						buttons={[
							{
								label: __('Add Store', 'multivendorx'),
								icon: 'plus',
								onClick: () => {
									resetForm();
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
								<AdminButtonUI
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
											color: 'purple',
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
										type="text"
										name="name"
										value={formData.name || ''}
										onChange={(val) => handleChange('name', val as string)}
									/>
								</FormGroup>

								<FormGroup
									label={__('Store slug', 'multivendorx')}
									htmlFor="store-slug"
									{...getFieldNotice('slug')}
								>
									<BasicInputUI
										type="text"
										name="slug"
										value={formData.slug || ''}
										onChange={(val) => handleChange('slug', val as string)}
									/>
									<AdminButtonUI
										buttons={{
											text: __('Check Slug', 'multivendorx'),
											onClick: handleSlugCheck,
										}}
									/>
								</FormGroup>

								<FormGroup
									label={__('Store Email', 'multivendorx')}
									{...getFieldNotice('email')}
								>
									<EmailsInput
										value={formData.emails || []}
										enablePrimary={true}
										onChange={(list, primary) => saveEmails(list, primary)}
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
											setFormData(prev => ({
												...prev,
												description: val
											}))
										}
										usePlainText={false}
										tinymceApiKey={
											appLocalizer.settings_databases_value['overview']?.['tinymce_api_section'] ?? ''
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
										options={appLocalizer?.store_owners || []}
										value={formData.store_owners}
										type="single-select"
										onChange={(newValue: any) => {
											setFormData((prev) => ({
												...prev,
												store_owners: newValue,
											}));
										}}
									/>
								</FormGroup>

								<FormGroup
									label={__('Profile image', 'multivendorx')}
									htmlFor="store_owners"
								>
									<FileInputUI
										value={formData.image || ''}
										name="image"
										accept={
											'.jpg,.jpeg,.png,.gif,.pdf,.zip'
										} // Backend controls file types: "image/*", ".pdf", "image/*,.pdf"
										imageSrc={imagePreview || ''}
										imageWidth={75}
										imageHeight={75}
										openUploader={__(
											'Upload Image',
											'multivendorx'
										)}
										onButtonClick={() =>
											runUploader('image')
										}
										onRemove={() =>
											handleRemoveImage('image')
										}
										onReplace={() =>
											handleReplaceImage('image')
										}
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