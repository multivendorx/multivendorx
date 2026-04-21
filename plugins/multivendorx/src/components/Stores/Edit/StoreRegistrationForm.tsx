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
	ButtonInputUI,
	TextAreaUI,
	NoticeManager,
	ComponentStatusView,
	Notice,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDate } from '@/services/commonFunction';
import { PDFDownloadLink } from '@react-pdf/renderer';

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
			url: getApiLink(appLocalizer, `stores/${id}`),
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
			url: getApiLink(appLocalizer, `stores/${id}`),
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
			url: getApiLink(appLocalizer, `stores/${id}`),
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
				{(formData.core_data?.status == 'pending' ||
					formData.core_data?.status == 'rejected') && (
					<Card title={__('Store details', 'multivendorx')}>
						<FormGroupWrapper>
							{formData.core_data &&
							Object.keys(formData.core_data).length > 0 ? (
								Object.entries(formData.core_data).map(
									([label, value]) => {
										const displayValue =
											value && typeof value === 'object'
												? JSON.stringify(value)
												: value;

										return (
											<FormGroup
												row
												key={label}
												label={label}
											>
												{displayValue ||
													__(
														'[Not Provided]',
														'multivendorx'
													)}
											</FormGroup>
										);
									}
								)
							) : (
								<FormGroup row label="">
									{__(
										'No store details available.',
										'multivendorx'
									)}
								</FormGroup>
							)}
						</FormGroupWrapper>
					</Card>
				)}

				{(formData.core_data?.status == 'pending' ||
					formData.core_data?.status == 'rejected' ||
					formData.core_data?.status == 'permanently_rejected') && (
					<>
						<Card title="Submitted by">
							<FormGroupWrapper>
								<FormGroup row label="Display Name">
									{formData.primary_owner_info?.data
										?.display_name ||
										__('[Not Provided]', 'multivendorx')}
								</FormGroup>

								<FormGroup
									row
									label={__('Email', 'multivendorx')}
								>
									{formData.primary_owner_info?.data
										?.user_email ?? (
										<Skeleton width={9.375} />
									)}
								</FormGroup>
							</FormGroupWrapper>
						</Card>

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
											onChange={(val) =>
												handleChange({
													target: {
														name: 'store_application_note',
														value: val,
														type: 'textarea',
													},
												} as React.ChangeEvent<HTMLTextAreaElement>)
											}
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
				)}
			</Column>
			<Column grid={4}>
				<Card
					title={__('Registration Details', 'multivendorx')}
					action={
						formData.registration_data &&
						Object.keys(formData.registration_data).length > 0 && (
							<div className="admin-btn btn-purple">
								<i className="adminfont-download"></i>
								<PDFDownloadLink
									document={
										<RegistrationPdf
											registrationData={formData.registration_data}
										/>
									}
									fileName="registration-data.pdf"
								>
									{({ loading }) =>
										loading ? 'Generating PDF…' : 'Download PDF'
									}
								</PDFDownloadLink>
							</div>
						)
					}
				>
					<FormGroupWrapper>
						{formData.registration_data &&
						Object.keys(formData.registration_data).length > 0 ? (
							Object.entries(formData.registration_data).map(
								([label, value]) => {
									const isAttachment =
										value &&
										typeof value === 'object' &&
										value.attachment;
									return (
										<FormGroup
											row
											key={label}
											label={label}
										>
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
										</FormGroup>
									);
								}
							)
						) : (
							<Notice
								type="info"
								displayPosition="inline-notice"
								message={__(
									'Store submitted application without filling out registration form.',
									'multivendorx'
								)}
							/>
						)}
					</FormGroupWrapper>
				</Card>

				<Card title={__('Activity Log', 'multivendorx')}>
					<div className="activity-log">
						{Array.isArray(activities) && activities.length > 0 ? (
							activities.slice(0, 5).map((a, i) => (
								<div key={i} className="activity">
									<div className="title">{a.title}</div>
									<div className="des">{a.message}</div>
									<span>{formatDate(a.created_at)}</span>
								</div>
							))
						) : (
							<ComponentStatusView
								title={__(
									'Activity will show up here as your store grows!',
									'multivendorx'
								)}
							/>
						)}
					</div>
				</Card>
			</Column>
		</Container>
	);
};

export default StoreRegistration;
