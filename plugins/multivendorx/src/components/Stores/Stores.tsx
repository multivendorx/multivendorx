import { useLocation, useNavigate } from 'react-router-dom';
import StoreTable from './StoreTable';
import EditStore from './Edit/EditStore';
import {
	AdminButtonUI,
	BasicInputUI,
	EmailsInput,
	FileInput,
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
	const [addStore, setaddStore] = useState(false);
	const [formData, setFormData] = useState<Record<string, string>>({});
	const [imagePreview, setImagePreview] = useState<string>('');
	const [error, setError] = useState<{
		[key: string]: { type: string; message: string };
	}>({});

	const hash = location.hash;
	const navigate = useNavigate();

	const isTabActive = hash.includes('tab=stores');
	const isAddStore = hash.includes('create');
	const iseditStore = hash.includes('edit');

	const generateSlug = (text: string) => {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/--+/g, '-');
	};

	const checkSlugExists = async (slug: string) => {
		try {
			const response = await axios.get(
				getApiLink(appLocalizer, 'store'),
				{
					params: { slug },
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);
			return response.data.exists;
		} catch (err) {
			return false;
		}
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
			setError((prev) => ({
				...prev,
				slug: {
					type: 'invalid-massage',
					message: `Slug "${formData.slug}" already exists.`,
				},
			}));
		} else {
			setError((prev) => ({
				...prev,
				slug: {
					type: 'success-massage',
					message: 'Available',
				},
			}));
		}
	};


	// update text in state immediately (no API here)
	// const handleChange = (
	// 	e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	// ) => {
	// 	const { name, value } = e.target;
	// 	const updated = { ...formData, [name]: value };

	// 	if (name === 'slug') {
	// 		const clean = value.replace(/[^a-zA-Z0-9-]/g, '');
	// 		updated.slug = clean.toLowerCase();
	// 	} else if (name === 'name') {
	// 		updated.name = value;
	// 		updated.slug = generateSlug(value);
	// 	}

	// 	setFormData(updated);
	// };

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
		const updated = {
			...formData,
			primary_email: primary,
			emails: emailList,
		};
		setFormData(updated);
	};

	const handleSubmit = async () => {

		const { name, slug, email, store_owners } = formData;

		if (!name?.trim()) {
			setError((prev) => ({
				...prev,
				name: {
					type: 'invalid-massage',
					message: 'Store name is required.',
				},
			}));
			return;
		}

		if (!slug?.trim()) {
			setError((prev) => ({
				...prev,
				slug: {
					type: 'invalid-massage',
					message: 'Store slug is required.',
				},
			}));
			return;
		}

		if (!formData.primary_email?.trim()) {
			setError((prev) => ({
				...prev,
				email: {
					type: 'invalid-massage',
					message: 'Store email is required.',
				},
			}));
			return;
		}

		if (!store_owners) {
			setError((prev) => ({
				...prev,
				primary: {
					type: 'invalid-massage',
					message: 'Primary owners is required.',
				},
			}));
			return;
		}

		// Check again before submit (in case slug manually changed)
		const exists = await checkSlugExists(slug);
		if (exists) {
			setError((prev) => ({
				...prev,
				slug: {
					type: 'invalid-massage',
					message: `Slug "${formData.slug}" already exists.`,
				},
			}));
			return;
		}

		setError({});

		const payload = { ...formData, status: 'active' };

		try {
			const response = await axios({
				method: 'POST',
				url: getApiLink(appLocalizer, 'store'),
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				data: { formData: payload },
			});

			if (response.data.success) {
				setaddStore(false);
				navigate(
					`?page=multivendorx#&tab=stores&edit/${response.data.id}`
				);
			}
		} catch (err) {
			setError((prev) => ({
				...prev,
				name: {
					type: 'invalid-massage',
					message: 'Something went wrong while saving the store.',
				},
			}));
		}
	};

	// Open WordPress media uploader
	const runUploader = (key: string) => {
		const frame: any = (window as any).wp.media({
			title: 'Select or Upload Image',
			button: { text: 'Use this image' },
			multiple: false,
		});

		frame.on('select', function () {
			const attachment = frame.state().get('selection').first().toJSON();
			const updated = { ...formData, [key]: attachment.url };

			setFormData(updated);
			setImagePreview(attachment.url);
		});

		frame.open();
	};

	// Remove image
	const handleRemoveImage = (key: string) => {
		const updated = { ...formData, [key]: '' };
		setFormData(updated);
		setImagePreview('');
	};

	// Replace image
	const handleReplaceImage = (key: string) => {
		runUploader(key);
	};
	return (
		<>
			{isTabActive && iseditStore && !isAddStore && <EditStore />}

			{!isAddStore && !iseditStore && (
				<>
					<NavigatorHeader
						headerIcon="adminfont-storefront"
						headerTitle="Stores"
						headerDescription={
							'Manage marketplace stores with ease. Review, edit, or add new stores anytime.'
						}
						buttons={[
							{
								label: __('Add Store', 'multivendorx'),
								className: "admin-btn btn-purple-bg",
								iconClass: 'adminfont-plus',
								onClick: () => {
									setFormData({});
									setImagePreview('');
									setaddStore(true);
								}
							}
						]}
					/>
					{addStore && (
						<PopupUI
							open={addStore}
							width={31.25}
							onClose={() => {
								setFormData({});
								setImagePreview('');
								setaddStore(false);
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
												setFormData({});
												setImagePreview('');
												setaddStore(false);
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
								<FormGroup label={__('Store name', 'multivendorx')} htmlFor="store-name">
									{/* <BasicInputUI
										type="text"
										name="name"
										value={formData.name || ''}
										onChange={handleChange}
										required={true}
										msg={error.name}
									/> */}
									<BasicInputUI
										type="text"
										name="name"
										value={formData.name || ''}
										onChange={(val) => handleChange('name', val as string)}
										msg={error.name}
									/>
								</FormGroup>

								<FormGroup label={__('Store slug', 'multivendorx')} htmlFor="store-slug">
									{/* <BasicInputUI
										type="text"
										name="slug"
										value={formData.slug || ''}
										 
										onChange={handleChange}
										required={true}
										clickBtnName={__(
											'Check Slug',
											'multivendorx'
										)}
										onclickCallback={handleNameBlur}
										msg={error.slug}
									/> */}
									<BasicInputUI
										type="text"
										name="slug"
										value={formData.slug}
										onChange={(val) => handleChange('slug', val as string)}
										msg={error.slug}
									/>

									<AdminButtonUI
										buttons={{
											text: 'Check Slug',
											onClick: handleSlugCheck,
										}}
									/>
								</FormGroup>

								<FormGroup label={__('Store Email', 'multivendorx')}>
									<EmailsInput
										value={formData.emails || []}
										enablePrimary={true}
										onChange={(list, primary) => {
											saveEmails(list, primary);
										}}
									/>
									{error?.email?.message && (
										<div className="invalid-massage">
											{error?.email?.message}
										</div>
									)}
								</FormGroup>

								<FormGroup label={__('Description', 'multivendorx')} htmlFor="Description">
									<TextAreaUI
										name="description"
										value={formData.description || ''}
										onChange={handleChange}
										usePlainText={false}
										tinymceApiKey={
											appLocalizer
												.settings_databases_value[
											'overview'
											]['tinymce_api_section'] ?? ''
										}
									/>
								</FormGroup>

								<FormGroup label={__('Primary owner', 'multivendorx')} htmlFor="store_owners">
									<SelectInputUI
										name="store_owners"
										options={
											appLocalizer?.store_owners || []
										}
										value={formData.store_owners}
										type="single-select"
										onChange={(newValue: any) => {
											if (
												!newValue ||
												Array.isArray(newValue)
											) {
												return;
											}
											const updated = {
												...formData,
												store_owners:
													newValue.value,
											};
											setFormData(updated);
										}}
									/>
									{error?.primary?.message && (
										<div className="invalid-massage">
											{error?.primary?.message}
										</div>
									)}
								</FormGroup>

								<FormGroup label={__('Profile image', 'multivendorx')} htmlFor="store_owners">
									{/* <FileInput
										value={formData.image || ''}
										inputClass="form-input"
										name="image"
										type="hidden"
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
									/> */}
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
