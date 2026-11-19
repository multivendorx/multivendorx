import React from 'react';
import {
	ContainerComponent,
	ColumnComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import ListGate from '../Popup/ListGate';
import './inbox.scss';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

/** Sample conversations for the preview: name, product asked about, last message, when, unread replies. */
const SAMPLE_CONVERSATIONS = [
	{ name: 'Sophia Williams', product: 'Oak dining table + 1 more', preview: 'Could you share the exact dimensions?', date: __('Today', 'catalogx'), unread: 2 },
	{ name: 'Michael Johnson', product: 'Linen armchair', preview: 'Bulk pricing starts from 50 units.', date: __('Today', 'catalogx'), unread: 0 },
	{ name: 'Emily Carter', product: 'Walnut bookshelf', preview: 'Yes, it is in stock and ready to ship.', date: __('Yesterday', 'catalogx'), unread: 1 },
	{ name: 'Daniel Brown', product: 'Rattan pendant lamp', preview: 'Back in stock next week.', date: 'Mon', unread: 0 },
	{ name: 'Olivia Taylor', product: 'Ceramic vase set', preview: 'I have sent the quotation for 100 units.', date: 'Nov 9', unread: 0 },
	{ name: 'James Anderson', product: 'Velvet sofa', preview: 'Can you confirm the delivery time?', date: 'Nov 8', unread: 0 },
];

/** The open sample conversation: the enquiry form, then the replies. */
const SAMPLE_FORM = [
	{ label: __('Name', 'catalogx'), value: 'Sophia Williams' },
	{ label: __('Email', 'catalogx'), value: 'sophia@example.com' },
	{ label: __('Message', 'catalogx'), value: 'We are furnishing a café. Is the oak table available in a 6-seat size, and do you offer trade prices?' },
];

const SAMPLE_MESSAGES = [
	{ own: true, author: __('You', 'catalogx'), time: '10:12 AM', text: 'Hi Sophia, yes, the 6-seat version is in stock. For 4 tables or more we offer 12% off.' },
	{ own: false, author: 'Sophia Williams', time: '10:40 AM', text: 'That works. Could you share the exact dimensions?' },
	{ own: false, author: 'Sophia Williams', time: '10:41 AM', text: 'And a quote for 5 tables with the chairs, please.' },
];

const SAMPLE_PRODUCTS = [
	{ name: 'Oak dining table', meta: '$480 × 5', stock: __('In stock', 'catalogx'), stockClass: 'is-good' },
	{ name: 'Linen dining chair', meta: '$95 × 20', stock: __('On backorder', 'catalogx'), stockClass: 'is-warn' },
];

const AVATAR_COLORS = ['#5007aa', '#0e7490', '#b45309', '#15803d', '#be123c', '#4338ca'];

/** Initials avatar, as the real inbox draws it. */
const Avatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => (
	<span
		className={`cx-inbox-avatar is-${size}`}
		style={{
			background:
				AVATAR_COLORS[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_COLORS.length],
		}}
		aria-hidden="true"
	>
		{name
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part.charAt(0))
			.join('')}
	</span>
);

/**
 * Enquiry Messages: CatalogX Pro's inbox (swapped in through `catalogx_enquiry_messages_component`). Without Pro, or
 * with the Enquiry module off, the sample inbox is drawn behind the same card as every other Pro page.
 */
const EnquiryMessages = () => {
	const MessageComponent = applyFilters(
		'catalogx_enquiry_messages_component',
		SampleInbox
	) as React.ComponentType;

	return (
		<>
			<NavigatorHeaderComponent
				headerIcon="enquiry"
				headerTitle={__('Enquiry Messages', 'catalogx')}
				headerDescription={__(
					'Every enquiry as a conversation: read what the customer asked, reply, attach files and send a quote.',
					'catalogx'
				)}
			/>
			<ContainerComponent general>
				<ColumnComponent>
					<ListGate
						feature={{
							title: __('Enquiry Messages', 'catalogx'),
							description: __(
								'Answer every enquiry from one inbox, with files, tags and a quote button, instead of from your email.',
								'catalogx'
							),
							icon: 'enquiry',
						}}
						module={{ id: 'enquiry', name: __('Enquiry', 'catalogx') }}
						sample={<SampleInbox />}
						isEmpty={false}
						empty={{ heading: '', description: '', actions: null, note: '' }}
					>
						<MessageComponent />
					</ListGate>
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

/**
 * A static copy of the Pro inbox (same markup and classes as catalogx-pro/src/blocks/enquiry-messages), filled with
 * sample data. It is only ever drawn inert behind the Pro card, so nothing in it does anything.
 */
const SampleInbox = () => (
	<div className="cx-inbox">
		<aside className="cx-inbox-list">
			<header className="cx-inbox-list-head">
				<div className="cx-inbox-list-title">
					<h2>{__('Enquiries', 'catalogx')}</h2>
					<span className="cx-inbox-count">{SAMPLE_CONVERSATIONS.length}</span>
				</div>
				<div className="cx-inbox-list-tools">
					<span className="cx-inbox-icon-btn">
						<i className="adminfont-star-o" aria-hidden="true" />
					</span>
					<span className="cx-inbox-icon-btn">
						<i className="adminfont-download" aria-hidden="true" />
					</span>
				</div>
			</header>
			<div className="cx-inbox-filters">
				<span className="cx-inbox-search">
					<i className="adminfont-search" aria-hidden="true" />
					<input type="search" readOnly tabIndex={-1} placeholder={__('Search name, email, product…', 'catalogx')} />
				</span>
				<div className="cx-inbox-filter-row">
					<div className="cx-inbox-tabs">
						<button type="button" tabIndex={-1} className="is-active">
							{__('All', 'catalogx')}
						</button>
						<button type="button" tabIndex={-1}>
							{__('Unread', 'catalogx')}
							<span className="cx-inbox-tab-badge">2</span>
						</button>
					</div>
				</div>
			</div>
			<ul className="cx-inbox-conversations">
				{SAMPLE_CONVERSATIONS.map((conversation, index) => (
					<li key={conversation.name}>
						<span
							className={`cx-inbox-row${0 === index ? ' is-active' : ''}${conversation.unread ? ' is-unread' : ''}`}
						>
							<Avatar name={conversation.name} />
							<span className="cx-inbox-row-body">
								<span className="cx-inbox-row-top">
									<span className="cx-inbox-row-name">{conversation.name}</span>
									<span className="cx-inbox-row-date">{conversation.date}</span>
								</span>
								<span className="cx-inbox-row-product">{conversation.product}</span>
								<span className="cx-inbox-row-bottom">
									<span className="cx-inbox-row-preview">{conversation.preview}</span>
									{conversation.unread > 0 && (
										<span className="cx-inbox-unread">{conversation.unread}</span>
									)}
								</span>
							</span>
						</span>
					</li>
				))}
			</ul>
		</aside>

		<section className="cx-inbox-thread">
			<header className="cx-inbox-thread-head">
				<Avatar name="Sophia Williams" />
				<div className="cx-inbox-thread-who">
					<strong>Sophia Williams</strong>
					<span>{__('Enquiry #1042', 'catalogx')} · sophia@example.com</span>
				</div>
				<div className="cx-inbox-thread-tools">
					<span className="cx-inbox-icon-btn">
						<i className="adminfont-search" aria-hidden="true" />
					</span>
				</div>
			</header>
			<div className="cx-inbox-pinned">
				<i className="adminfont-pushpin" aria-hidden="true" />
				<span className="cx-inbox-pinned-text">
					{__('Trade discount: 12% off for 4 tables or more.', 'catalogx')}
				</span>
			</div>
			<div className="cx-inbox-messages">
				<div className="cx-inbox-day">
					<span>{__('Today', 'catalogx')}</span>
				</div>
				<article className="cx-inbox-form-card">
					<header>
						<i className="adminfont-enquiry" aria-hidden="true" />
						<span>
							<strong>{__('Sophia Williams sent an enquiry', 'catalogx')}</strong>
							<time>09:58 AM</time>
						</span>
					</header>
					<dl>
						{SAMPLE_FORM.map((field) => (
							<div key={field.label}>
								<dt>{field.label}</dt>
								<dd>{field.value}</dd>
							</div>
						))}
					</dl>
				</article>
				{SAMPLE_MESSAGES.map((message) => (
					<div key={message.time} className={`cx-inbox-msg${message.own ? ' is-own' : ''}`}>
						{!message.own && <Avatar name={message.author} size="sm" />}
						<div className="cx-inbox-msg-body">
							<div className="cx-inbox-msg-meta">
								<span className="cx-inbox-msg-author">{message.author}</span>
								<time>{message.time}</time>
							</div>
							<div className="cx-inbox-bubble">
								<div className="cx-inbox-text">{message.text}</div>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="cx-inbox-composer">
				<div className="cx-inbox-compose-box">
					<textarea readOnly tabIndex={-1} rows={1} placeholder={__('Reply to Sophia Williams…', 'catalogx')} />
					<div className="cx-inbox-compose-bar">
						<div className="cx-inbox-compose-tools">
							<span className="cx-inbox-icon-btn">
								<i className="adminfont-plus" aria-hidden="true" />
							</span>
							<span className="cx-inbox-icon-btn">
								<i className="adminfont-smile-o" aria-hidden="true" />
							</span>
						</div>
						<span className="cx-inbox-send">
							{__('Send', 'catalogx')}
							<i className="adminfont-send" aria-hidden="true" />
						</span>
					</div>
				</div>
			</div>
		</section>

		<aside className="cx-inbox-side">
			<div className="cx-inbox-side-head">
				<Avatar name="Sophia Williams" size="lg" />
				<strong>Sophia Williams</strong>
				<span className="cx-inbox-muted">sophia@example.com</span>
			</div>
			<div className="cx-inbox-quote">
				<span className="cx-inbox-btn is-primary is-block">
					<i className="adminfont-quote" aria-hidden="true" />
					{__('Create quote', 'catalogx')}
				</span>
			</div>
			<div className="cx-inbox-side-section">
				<h3>
					{__('Products', 'catalogx')}
					<span className="cx-inbox-count">{SAMPLE_PRODUCTS.length}</span>
				</h3>
				<ul className="cx-inbox-products">
					{SAMPLE_PRODUCTS.map((product) => (
						<li key={product.name} className="cx-inbox-product">
							<span className="cx-inbox-avatar is-sm" style={{ background: '#eef0f6', color: '#6b7280', borderRadius: '0.5rem' }}>
								<i className="adminfont-cart" aria-hidden="true" />
							</span>
							<span className="cx-inbox-product-text">
								<strong>{product.name}</strong>
								<span className="cx-inbox-product-meta">{product.meta}</span>
							</span>
							<span className={`cx-inbox-stock ${product.stockClass}`}>{product.stock}</span>
						</li>
					))}
				</ul>
			</div>
		</aside>
	</div>
);

export default EnquiryMessages;
