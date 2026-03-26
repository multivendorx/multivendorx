/* global appLocalizer */
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	getApiLink,
	Container,
	Column,
	Card,
	FormGroupWrapper,
	FormGroup,
	Skeleton,
	PdfDownloadButton,
	ButtonInputUI,
	TextAreaUI,
	NoticeManager,
	Analytics,
	ItemListUI,
	Notice,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDate } from '@/services/commonFunction';

const styles = StyleSheet.create({
	page: { padding: 24, fontSize: 12 },
	title: { fontSize: 16, marginBottom: 12 },
	row: { marginBottom: 6 },
	label: { fontWeight: 'bold' },
});
interface RegistrationData {
	[key: string]: string | number | boolean | null | undefined;
}

interface RegistrationPdfProps {
	registrationData: RegistrationData | null;
}

interface StoreNote {
	note: string;
	date: string;
}

interface StoreRegistrationFormData {
	status?: 'approve' | 'rejected' | string;
	store_application_note?: StoreNote[];
	[key: string]: string | number | boolean | StoreNote[] | undefined;
}

const RegistrationPdf: React.FC<RegistrationPdfProps> = ({
	registrationData,
}) => {
	const data = registrationData || {};
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<Text style={styles.title}>
					{__('Registration Data', 'multivendorx')}
				</Text>
				{Object.keys(data).length === 0 ? (
					<Text>
						{__(
							'Store submitted application without filling out registration form.',
							'multivendorx'
						)}
					</Text>
				) : (
					Object.entries(data).map(([label, value], index) => (
						<View key={index} style={styles.row}>
							<Text>
								<Text style={styles.label}>
									{__(label, 'multivendorx')}:{' '}
								</Text>
								{String(
									value ||
									__('[Not Provided]', 'multivendorx')
								)}
							</Text>
						</View>
					))
				)}
			</Page>
		</Document>
	);
};

const StoreRegistration = ({ id }: { id: string | null }) => {
	const [formData, setFormData] = useState<{ [key: string]: any }>({});
	const [previousNotes, setPreviousNotes] = useState<
		{ note: string; date: string }[]
	>([]);

	const FileDisplay = ({
		fileUrl,
		fileType,
	}: {
		fileUrl: string;
		fileType: string;
	}) => {
		const renderFile = () => {
			if (fileType.includes('image')) {
				return (
					<img
						src={fileUrl}
						alt="file"
						style={{ maxWidth: '100%' }}
					/>
				);
			} else {
				return (
					<div>
						<a
							href={fileUrl}
							target="_blank"
							rel="noopener noreferrer"
							download
						>
							{__('Download Attachment', 'multivendorx')}
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

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name]: type === 'checkbox' ? checked : (value ?? ''),
			};
			autoSave(updated);
			return updated;
		});
	};

	const autoSave = (updatedData: StoreRegistrationFormData) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				NoticeManager.add({
					title: __('Success', 'multivendorx'),
					message: __('Store saved successfully!', 'multivendorx'),
					type: 'success',
					position: 'float',
				});
			}
		});
	};

	const handleSubmit = (status: 'approve' | 'rejected') => {
		const updatedData = { ...formData, status };
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				NoticeManager.add({
					title: status === 'approve' ? 'Success' : 'Error!',
					message:
						status === 'approve'
							? __('Store approved successfully!', 'multivendorx')
							: __(
								'Store rejected successfully!',
								'multivendorx'
							),
					type: status === 'approve' ? 'success' : 'error',
					position: 'float',
				});
				setFormData(updatedData); // update local state
				window.location.reload();
			}
		});
	};
	const overviewData = [
		{
			id: 'approved',
			label: __('Approved', 'multivendorx'),
			count: 24,
			icon: 'order',
		},
		{
			id: 'Ppnding',
			label: __('Pending', 'multivendorx'),
			count: 5,
			icon: 'facilitator',
		},
		{
			id: 'rejected',
			label: __('Rejected', 'multivendorx'),
			count: 20,
			icon: 'credit-card',
		},
		{
			id: 'total_items',
			label: __('Total Items', 'multivendorx'),
			count: 5,
			icon: 'facilitator',
		},
	];
	const activities = [
		{
			title: 'GST Certificate approved by Admin',
			message: '',
			created_at: '2026-03-21 11:42:00',
		},
		{
			title: 'Address Proof rejected — blurry image',
			message: '',
			created_at: '2026-03-21 10:15:00',
		},
		{
			title: 'Business Reg. approved by Admin',
			message: '',
			created_at: '2026-03-20 15:08:00',
		},
		{
			title: 'PAN Card approved by Admin',
			message: '',
			created_at: '2026-03-20 14:55:00',
		},
		{
			title: 'Store application submitted by vendor',
			message: '',
			created_at: '2026-03-18 09:00:00',
		},
	];
	return (
		<Container>
			<Column grid={8}>
				<Analytics
					cols={4}
					variant="small"
					data={overviewData.map((item, idx) => ({
						icon: item.icon,
						iconClass: `admin-color${idx + 2}`,
						number: item.count,
						text: __(item.label, 'multivendorx'),
					}))}
				/>
				<Card
					title={__('Verification Methods', 'multivendorx')}
					action={
						<>
							<span className="admin-badge green">1 Approved</span>
							<span className="admin-badge yellow">1 Pending</span>
							<span className="admin-badge red">1 Rejected</span>
						</>
					}
				>
					<ItemListUI
						className="mini-card"
						// background
						border
						items={[
							{
								title: __('Business Registration Certificate', 'multivendorx'),
								desc: __(
									'Confirms the store is legally registered as a business entity.',
									'multivendorx'
								),
								tags: (
									<>
										<span className="admin-badge green">
											{__('Approved', 'multivendorx')}
										</span>
										<ButtonInputUI
											buttons={[
												{
													icon: 'eye',
													text: __('View', 'multivendorx'),
													color: 'blue'
												},
											]}
										/>
									</>
								),
							},
							{
								title: __('Trade License or Permit', 'multivendorx'),
								desc: __(
									'Validates that the store is authorized to operate and conduct business legally.',
									'multivendorx'
								),
								tags: (
									<>
										<span className="admin-badge yellow">
											{__('Pending', 'multivendorx')}
										</span>
										<ButtonInputUI
											buttons={[
												{
													icon: 'eye',
													text: __('View', 'multivendorx'),
													color: 'blue'
												},
											]}
										/>
									</>
								),
							},
							{
								title: __('Address Proof of Business Location', 'multivendorx'),
								desc: __(
									'Confirms the stores physical or operational business address.',
									'multivendorx'
								),
								tags: (
									<>
										<span className="admin-badge red">
											{__('Rejected', 'multivendorx')}
										</span>
										<ButtonInputUI
											buttons={[
												{
													icon: 'eye',
													text: __('View', 'multivendorx'),
													color: 'blue'
												},
											]}
										/>
									</>
								),
							},
						]}
					/>
				</Card>
				<Card
					title={__('Tax Compliance & Financial Documents', 'multivendorx')}
					action={
							<span className="admin-badge yellow">2 Pending</span>
					}
				>
					<div className="title">Required Uploads</div>
					<ItemListUI
						className="mini-card"
						// background
						border
						items={[
							{
								title: __('Bank Account Details', 'multivendorx'),
								desc: __(
									'Cancelled cheque • Uploaded Mar 20, 2026 • 520 KB',
									'multivendorx'
								),
								tags: (
									<>
										<span className="admin-badge green">
											{__('Approved', 'multivendorx')}
										</span>
										<ButtonInputUI
											buttons={[
												{
													icon: 'eye',
													text: __('View', 'multivendorx'),
													color: 'blue'
												},
											]}
										/>
									</>
								),
							},
							{
								title: __('GST Registration Certificate', 'multivendorx'),
								desc: __(
									'Tax identification • Uploaded Mar 20, 2026 • 780 KB',
									'multivendorx'
								),
								tags: (
									<>
										<span className="admin-badge yellow">
											{__('Pending', 'multivendorx')}
										</span>
										<ButtonInputUI
											buttons={[
												{
													icon: 'eye',
													text: __('View', 'multivendorx'),
													color: 'blue'
												},
											]}
										/>
									</>
								),
							},
							{
								title: __('PAN Card — Business', 'multivendorx'),
								desc: __(
									'Tax ID document • Uploaded Mar 19, 2026 • 210 KB',
									'multivendorx'
								),
								tags: (
									<>
										<span className="admin-badge yellow">
											{__('Pending', 'multivendorx')}
										</span>
										<ButtonInputUI
											buttons={[
												{
													icon: 'eye',
													text: __('View', 'multivendorx'),
													color: 'blue'
												},
											]}
										/>
									</>
								),
							},
							{
								title: __('Business Registration — MCA Filing', 'multivendorx'),
								desc: __(
									'Business Registration — MCA FilingIncorporation proof • Uploaded Mar 18, 2026 • 1.4 MB',
									'multivendorx'
								),
								tags: (
									<>
										<span className="admin-badge yellow">
											{__('Pending', 'multivendorx')}
										</span>
										<ButtonInputUI
											buttons={[
												{
													icon: 'eye',
													text: __('View', 'multivendorx'),
													color: 'blue'
												},
											]}
										/>
									</>
								),
							},
						]}
					/>
					<Notice
						type="info"
						displayPosition="inline-notice"
						message={__('ℹ Stores must provide valid bank account details and tax documents (PAN, GST, VAT, TIN) to receive payouts. Payment processor verification may be required. Non-compliant stores may be restricted from payouts.', 'multivendorx')}
					/>
				</Card>
			</Column>

			<Column grid={4}>
				<Card
					title={__('Registration Details', 'multivendorx')}
					action={
						<span className="admin-badge green">Submitted</span>
					}
				>
					<FormGroupWrapper>
						<FormGroup
							row
							label={__('Business Name', 'multivendorx')}
						>
							{__('TechNest Electronics Pvt. Ltd.', 'multivendorx')}
						</FormGroup>
						<FormGroup row label={__('Owner Name', 'multivendorx')} >
							{__('Arjun Mehta', 'multivendorx')}
						</FormGroup>
						<FormGroup row label={__('Email', 'multivendorx')} >
							{__('arjun@technest.in', 'multivendorx')}
						</FormGroup>
						<FormGroup row label={__('Phone', 'multivendorx')} >
							{__('+91 98765 43210', 'multivendorx')}
						</FormGroup>
						<FormGroup row label={__('Business Address', 'multivendorx')} >
							{__('14B, Sector 5, Salt Lake, Kolkata — 700 091', 'multivendorx')}
						</FormGroup>
						<FormGroup row label={__('Business Type', 'multivendorx')} >
							{__('Private Limited Company', 'multivendorx')}
						</FormGroup>
						<FormGroup row label={__('Category', 'multivendorx')} >
							{__('Electronics, Gadgets & Accessories', 'multivendorx')}
						</FormGroup>
						<FormGroup row label={__('Website', 'multivendorx')} >
							{__('technestindia.com', 'multivendorx')}
						</FormGroup>
					</FormGroupWrapper>
				</Card>
				<Card title={__('Activity Log', 'multivendorx')}>
					<div className="activity-log">
						{Array.isArray(activities) &&
							activities.length > 0 ? (
							activities.slice(0, 5).map((a, i) => (
								<div key={i} className="activity">
									<div className="title">{a.title}</div>
									<div className="des">{a.message}</div>
									<span>{formatDate(a.created_at)}</span>
								</div>
							))
						) : (
							<div className="no-data">
								{__('No activity found.', 'multivendorx')}
							</div>
						)}
					</div>
				</Card>
			</Column>

			<Column>
				{(formData.core_data?.status == 'pending' ||
					formData.core_data?.status == 'rejected') && (
						<>
							<div className="card-content">
								<div className="card-header">
									<div className="left">
										<div className="title">
											{__('Store details', 'multivendorx')}
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
								Object.keys(formData.registration_data).length >
								0 && (
									<div className="admin-btn btn-purple">
										<i className="adminfont-download"></i>
										<PdfDownloadButton
											PdfComponent={RegistrationPdf}
											fileName="registration-data.pdf"
											data={{
												registrationData:
													formData.registration_data,
											}}
										/>
									</div>
								)}
						</div>
					</div>
					<div className="card-body" id="registration-archive">
						{/* Registration Data */}
						{formData.registration_data &&
							Object.keys(formData.registration_data).length > 0 ? (
							Object.entries(formData.registration_data).map(
								([label, value]) => {
									const isAttachment =
										value &&
										typeof value === 'object' &&
										value.attachment;

									return (
										<div
											className="form-details"
											key={label}
										>
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
															fileUrl={
																value.attachment
															}
															fileType={
																value.attachment_type
															}
														/>
													</a>
												) : (
													value ||
													__(
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
												formData.primary_owner_info?.data
													?.user_login
											)?.charAt(0) || ''
										).toUpperCase()}
									</div>
									<div className="details">
										<div className="name">
											{formData.primary_owner_info?.data
												?.display_name ?? (
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
												{previousNotes.map((item, idx) => (
													<li key={idx}>
														<strong>
															{item.date}:
														</strong>{' '}
														{item.note}
													</li>
												))}
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
												<TextAreaUI
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
															formData.store_permanent_reject ||
															false
														}
														onChange={handleChange}
													/>
													{__(
														'Reject store permanently',
														'multivendorx'
													)}
												</label>
											</FormGroup>
											<ButtonInputUI
												buttons={[
													{
														text: __(
															'Approve',
															'multivendorx'
														),
														color: 'green',
														onClick: () =>
															handleSubmit('approve'),
													},
													{
														text: __(
															'Reject',
															'multivendorx'
														),
														color: 'red',
														onClick: () =>
															handleSubmit('rejected'),
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
	);
};

export default StoreRegistration;
