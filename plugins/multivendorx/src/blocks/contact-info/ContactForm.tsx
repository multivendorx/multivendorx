import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

const ContactForm: React.FC<{ recipient?: string }> = ({ recipient }) => {
	const [form, setForm] = useState({
		name: '',
		email: '',
		message: '',
	});
	const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
		'idle'
	);

	const storesList = (window as any).storesList;

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus('sending');

		try {
			await axios.post(
				storesList.ajaxUrl,
				{
					action: 'mvx_send_contact_mail',
					recipient,
					...form,
				},
				{
					headers: { 'X-WP-Nonce': storesList.nonce },
				}
			);

			setStatus('sent');
			setForm({ name: '', email: '', message: '' });
		} catch (err) {
			console.error(err);
			setStatus('error');
		}
	};

	return (
		<form className="mvx-contact-form" onSubmit={handleSubmit}>
			<input
				type="text"
				name="name"
				placeholder={__('Your Name', 'multivendorx')}
				value={form.name}
				onChange={handleChange}
				required
			/>

			<input
				type="email"
				name="email"
				placeholder={__('Your Email', 'multivendorx')}
				value={form.email}
				onChange={handleChange}
				required
			/>

			<textarea
				name="message"
				placeholder={__('Message', 'multivendorx')}
				value={form.message}
				onChange={handleChange}
				required
			/>

			<button type="submit" disabled={status === 'sending'}>
				{__('Send Message', 'multivendorx')}
			</button>

			{status === 'sent' && (
				<p className="success">{__('Message sent successfully.', 'multivendorx')}</p>
			)}
			{status === 'error' && (
				<p className="error">{__('Failed to send message.', 'multivendorx')}</p>
			)}
		</form>
	);
};

export default ContactForm;
