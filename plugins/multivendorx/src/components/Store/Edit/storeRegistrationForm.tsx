import { useEffect, useState } from 'react';
import axios from 'axios';
import { TextArea, getApiLink, SuccessNotice, Container, Column, Card, FormGroupWrapper, FormGroup, AdminButton, Skeleton } from 'zyra';
import { jsPDF } from 'jspdf';
import { __ } from '@wordpress/i18n';

const StoreRegistration = ({ id }: { id: string | null }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [previousNotes, setPreviousNotes] = useState<
		{ note: string; date: string }[]
	>([]);

	const handleDownloadPDF = () => {
		const doc = new jsPDF();
		doc.setFontSize(16);
		doc.text('Registration Data', 10, 15);
		doc.setFontSize(12);

		const registrationData = formData.registration_data || {};

		if (Object.keys(registrationData).length === 0) {
			doc.text(
				'Store submitted application without filling out registration form.',
				10,
				30
			);
		} else {
			let y = 30;
			Object.entries(registrationData).forEach(([label, value]) => {
				doc.text(`${label}: ${value || '[Not Provided]'}`, 10, y);
				y += 10;
			});
		}

		doc.save('registration-data.pdf');
	};

	const FileDisplay = ({ fileUrl, fileType }) => {
		const renderFile = () => {
			""
			if (fileType.includes('image')) {
				return <img src={fileUrl} alt="file" style={{ maxWidth: '100%' }} />;
			} else {
				return (
					<div>
						<a href={fileUrl} target="_blank" rel="noopener noreferrer" download>
							{__('Download Attachment', 'catalogx-pro')}
						</a>
					</div>
				);
			}
		};

		return <div>{renderFile()}</div>;
	};

	const fetchStoreData = () => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: {
				'X-WP-Nonce': appLocalizer.nonce,
				registrations: 'registrations',
			},
		}).then((res) => {
			const data = res.data || {};
			if (Array.isArray(data.store_application_note)) {
				setPreviousNotes(data.store_application_note);
				delete data.store_application_note;
			}
			setFormData(data);
		});
	};

	useEffect(() => {
		if (id) {
			fetchStoreData();
		}
	}, [id]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name]: value ?? '',
			};
			autoSave(updated);
			return updated;
		});
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
		});
	};

	const handleSubmit = (status: 'approve' | 'rejected') => {
		const updatedData = { ...formData, status };
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg(
					status === 'approve'
						? 'Store approved successfully!'
						: 'Store rejected successfully!'
				);
				setFormData(updatedData); // update local state
				window.location.reload();
			}
		});
	};

	return (
		<>
			<SuccessNotice message={successMsg} />

			<Container>
				<Column>
					{(formData.core_data?.status == 'pending' ||
						formData.core_data?.status == 'rejected') && (
							<>
								<div className="card-content">
									<div className="card-header">
										<div className="left">
											<div className="title">
												{__(
													'Store details',
													'multivendorx'
												)}
											</div>
										</div>
									</div>

									{/* Core Data */}
									<div className="card-body">
										{formData.core_data &&
											Object.entries(formData.core_data).map(
												([label, value]) => (
													<div
														className="form-details"
														key={label}
													>
														<label className="label">
															{label} :
														</label>
														<div className="value">
															{value ||
																__(
																	'[Not Provided]',
																	'multivendorx'
																)}
														</div>
													</div>
												)
											)}
									</div>
									{/* Registration Data (if needed) */}
								</div>
							</>
						)}
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{formData.core_data?.status === 'pending' ||
										formData.core_data?.status === 'rejected'
										? __(
											'Registration form details',
											'multivendorx'
										)
										: __('Archive data', 'multivendorx')}
								</div>
							</div>
							<div className="right">
								{formData.registration_data &&
									Object.keys(formData.registration_data)
										.length > 0 && (
										<div
											onClick={() => handleDownloadPDF()}
											className="admin-btn btn-purple"
										>
											<i className="adminfont-download"></i>{' '}
											{__('Download', 'multivendorx')}
										</div>
									)}
							</div>
						</div>
						<div className="card-body">
							{/* Registration Data */}
							{formData.registration_data &&
								Object.keys(formData.registration_data).length >
								0 ? (
								Object.entries(formData.registration_data).map(
									([label, value]) => {
										const isAttachment =
											value &&
											typeof value === 'object' &&
											value.attachment;

										return (
											<div className="form-details" key={label}>
												<label className="label">
													{label} :
												</label>

												<div className="value">
													{isAttachment ? (
														<a
															href={value.attachment}
															target="_blank"
															rel="noopener noreferrer"
														>
															<FileDisplay
																fileUrl={value.attachment}
																fileType={value.attachment_type}
															/>
														</a>
													) : (
														value || __(
															'[Not Provided]',
															'multivendorx'
														)
													)}
												</div>
											</div>
										);
									}
								)
							) : (
								<div className="no-data">
									{__(
										'Store submitted application without filling out registration form.',
										'multivendorx'
									)}
								</div>
							)}
						</div>
					</div>
				</Column>

				{(formData.core_data?.status == 'pending' ||
					formData.core_data?.status == 'rejected' ||
					formData.core_data?.status == 'permanently_rejected') && (
						<Column grid={8}>
							<Card title="Submitted by">
								<div className="store-owner-details owner">
									<div className="profile">
										<div className="avatar">
											{(
												(
													formData.primary_owner_info?.data?.display_name?.trim() ||
													formData.primary_owner_info
														?.data?.user_login
												)?.charAt(0) || ''
											).toUpperCase()}
										</div>
										<div className="details">
											<div className="name">
												{formData.primary_owner_info
													?.data?.display_name ?? (
														<Skeleton width={150} />
													)}
											</div>
										</div>
									</div>
									<ul className="contact-details">
										<li>
											<i className="adminfont-mail"></i>
											{formData.primary_owner_info?.data
												?.user_email ?? (
													<Skeleton width={150} />
												)}
										</li>
									</ul>
								</div>
							</Card>
							<>
								{previousNotes.length > 0 && (
									<Card title="Previous Notes">
										<div className="form-group-wrapper">
											<div className="form-group">
												<ul>
													{previousNotes.map(
														(item, idx) => (
															<li key={idx}>
																<strong>
																	{item.date}:
																</strong>{' '}
																{item.note}
															</li>
														)
													)}
												</ul>
											</div>
										</div>
									</Card>
								)}

								{formData.core_data?.status !=
									'permanently_rejected' && (
										<Card title="Note">
											<FormGroupWrapper>
												<FormGroup>
													<TextArea
														name="store_application_note"
														placeholder={__(
															'Optional note for approval or rejection',
															'multivendorx'
														)}
														value={
															formData.store_application_note ||
															''
														}
														onChange={handleChange}
													/>
												</FormGroup>
												<FormGroup>
													<label className="checkbox-label">
														<input
															type="checkbox"
															name="store_permanent_reject"
															checked={
																formData.store_permanent_reject
															}
															onChange={handleChange}
														/>
														{__(
															'Reject store permanently',
															'multivendorx'
														)}
													</label>
												</FormGroup>
												<AdminButton
													buttons={[
														{
															text: __('Approve', 'multivendorx'),
															className: 'green',
															onClick: () => handleSubmit('approve'),
														},
														{
															text: __('Reject', 'multivendorx'),
															className: 'red',
															onClick: () => handleSubmit('rejected'),
														},
													]}
												/>
											</FormGroupWrapper>
										</Card>
									)}
							</>
						</Column>
					)}
			</Container>
		</>
	);
};

export default StoreRegistration;
