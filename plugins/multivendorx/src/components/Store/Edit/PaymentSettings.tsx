import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, getApiLink } from 'zyra';

const PaymentSettings = ({ id }: { id: string }) => {

    const [formData, setFormData] = useState<{ [key: string]: string }>({});
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
			})
	}, [id]);

    useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };
		setFormData(updated);
		autoSave(updated);
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
            {successMsg && (
				<>
					<div className="admin-notice-wrapper">
						<i className="admin-font adminlib-icon-yes"></i>
						<div className="notice-details">
							<div className="title">Great!</div>
							<div className="desc">{successMsg}</div>
						</div>
					</div>
				</>
			)}

			<div className="container-wrapper">
			
                <div className="card-title">
                    Commission
                </div>

                    <div className="form-group">
                        <label htmlFor="product-name">Fixed</label>
                        <BasicInput name="commission_fixed" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.commission_fixed} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="product-name">Percentage</label>
                        <BasicInput name="commission_percentage" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.commission_percentage} onChange={handleChange} />
                    </div>
            </div>

        </>
    )
};

export default PaymentSettings;