import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput,SelectInput, getApiLink } from 'zyra';

const StoreSettings = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});

	const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
	const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
		.then((res) => {
		const data = res.data || {};
		setFormData((prev) => ({ ...prev, ...data }));
		setImagePreviews({
			image: data.image || '',
			banner: data.banner || '',
		});
		})
	}, [id]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	useEffect(() => {
		if (formData.country) {
			fetchStatesByCountry(formData.country);
		}
	}, [formData.country]);


	const fetchStatesByCountry = (countryCode: string) => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `states/${countryCode}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			setStateOptions(res.data || []);
		})
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };
		setFormData(updated);
		autoSave(updated); 
	};

	const runUploader = (key: string) => {
		const frame = (window as any).wp.media({
			title: 'Select or Upload Image',
			button: { text: 'Use this image' },
			multiple: false,
		});

		frame.on('select', function () {
			const attachment = frame.state().get('selection').first().toJSON();
			const updated = { ...formData, [key]: attachment.url };

			setFormData(updated);
			setImagePreviews((prev) => ({ ...prev, [key]: attachment.url }));
			autoSave(updated);
		});

		frame.open();
	};

    const autoSave = (updatedData: { [key: string]: string }) => {
        axios({
        method: 'PUT',
        url: getApiLink(appLocalizer, `store/${id}`),
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
        data: updatedData,
        }).then((res) => {
            if (res.data.success) {
              setSuccessMsg('Store saved successfully!');
            }
        })
    };

	return (
    <>
		{successMsg && <div className="text-green-600">{successMsg}</div>}

		<label>Name</label>
		<BasicInput name="name" value={formData.name} onChange={handleChange} />

		<label>Slug</label>
		<BasicInput name="slug" value={formData.slug} onChange={handleChange} />

		<label>Profile Image</label>
		<FileInput
			value={formData.image}
			inputClass="form-input"
			name="image"
			type="hidden"
			onButtonClick={() => runUploader('image')}
			imageWidth={75}
			imageHeight={75}
			openUploader="Upload Image"
			imageSrc={imagePreviews.image}
			buttonClass="admin-btn btn-purple"
		/>

		<label>Store Banner Image</label>
		<FileInput
			value={formData.banner}
			inputClass="form-input"
			name="banner"
			type="hidden"
			onButtonClick={() => runUploader('banner')}
			imageWidth={100}
			imageHeight={100}
			openUploader="Upload Image"
			imageSrc={imagePreviews.banner}
			buttonClass="admin-btn btn-purple"
		/>

		<label>Description</label>
		<TextArea name="description" value={formData.description} onChange={handleChange} /><br/>

		<label>Phone</label>
		<BasicInput name="phone" value={formData.phone} onChange={handleChange} />

		<label>Address</label>
		<BasicInput name="address_1" value={formData.address_1} onChange={handleChange} />
		<BasicInput name="address_2" value={formData.address_2} onChange={handleChange} />


		<label>Country</label>
		<SelectInput
			name="country"
			value={formData.country}
			options={appLocalizer.country_list || []}
			type="single-select"
			onChange={(newValue) => {
				if (!newValue || Array.isArray(newValue)) return;
				const updated = { ...formData, country: newValue.value, state: '' }; // reset state
				setFormData(updated);
				autoSave(updated);
				fetchStatesByCountry(newValue.value);				
			}}
		/>

		<label>State</label>
		<SelectInput
			name="state"
			value={formData.state}
			options={stateOptions}
			type="single-select"
			onChange={(newValue) => {
				if (!newValue || Array.isArray(newValue)) return;
				const updated = { ...formData, state: newValue.value };
				setFormData(updated);
				autoSave(updated);
			}}
		/>

		<label>City</label>
		<BasicInput name="city" value={formData.city} onChange={handleChange} />

		<label>ZIP</label>
		<BasicInput name="postcode" value={formData.postcode} onChange={handleChange} />

    </>
  );
};

export default StoreSettings;
