import React, { useState } from 'react';
import { PopupUI, Container, Column } from 'zyra';
import ShowProPopup from '../Popup/Popup';
import './enquiryMessages.scss';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

// Demo data
const demoChatList = [
    {
        id: 1,
        name: 'Emily Carter',
        lastChat: 'Yes, this product is currently available in stock.',
        date: 'June 11, 2026',
        active: false
    },
    {
        id: 2,
        name: 'Michael Johnson',
        lastChat: 'The bulk pricing starts from an order of 50 units.',
        date: 'June 11, 2026',
        active: false
    },
    {
        id: 3,
        name: 'Sophia Williams',
        lastChat: 'I have shared the product dimensions below.',
        date: 'June 11, 2026',
        active: true
    },
    {
        id: 4,
        name: 'Daniel Brown',
        lastChat: 'The item will be back in stock next week.',
        date: 'June 10, 2026',
        active: false
    },
    {
        id: 5,
        name: 'Olivia Taylor',
        lastChat: "I've sent you the quotation for 100 units.",
        date: 'June 10, 2026',
        active: false
    },
    {
        id: 6,
        name: 'James Anderson',
        lastChat: 'Can you confirm the estimated delivery time?',
        date: 'June 10, 2026',
        active: false
    },
    {
        id: 7,
        name: 'Isabella Martinez',
        lastChat: 'The sample order has been shipped today.',
        date: 'June 9, 2026',
        active: false
    },
    {
        id: 8,
        name: 'William Thomas',
        lastChat: 'Yes, we can customize the packaging for your order.',
        date: 'June 9, 2026',
        active: false
    },
    {
        id: 9,
        name: 'Ava Garcia',
        lastChat: 'Please let me know if you need a revised quotation.',
        date: 'June 9, 2026',
        active: false
    },
    {
        id: 10,
        name: 'Benjamin Wilson',
        lastChat: 'The minimum order quantity is 25 pieces.',
        date: 'June 8, 2026',
        active: false
    },
    {
        id: 11,
        name: 'Mia Rodriguez',
        lastChat: 'Your payment has been received successfully.',
        date: 'June 8, 2026',
        active: false
    },
    {
        id: 12,
        name: 'Lucas Moore',
        lastChat: 'We have updated the tracking information.',
        date: 'June 8, 2026',
        active: false
    },
    {
        id: 13,
        name: 'Charlotte Jackson',
        lastChat: 'Thank you for your enquiry. We will get back to you shortly.',
        date: 'June 7, 2026',
        active: false
    },
    {
        id: 14,
        name: 'Henry White',
        lastChat: 'The requested color variant is currently unavailable.',
        date: 'June 7, 2026',
        active: false
    },
    {
        id: 15,
        name: 'Amelia Harris',
        lastChat: 'A discount has been applied to your wholesale account.',
        date: 'June 7, 2026',
        active: false
    }
];

const demoMessages = [
    {
        id: 1,
        date: 'June 11, 2026',
        messages: [
            {
                id: 1,
                name: 'Customer',
                time: '09:12 AM',
                text: 'Hi, is this product currently available in stock?'
            },
            {
                id: 2,
                name: 'Emily Carter',
                time: '09:15 AM',
                text: 'Hello! Yes, the product is currently in stock and ready for dispatch.'
            },
            {
                id: 3,
                name: 'Customer',
                time: '09:18 AM',
                text: 'Great! How long will shipping take to Germany?'
            },
            {
                id: 4,
                name: 'Emily Carter',
                time: '09:21 AM',
                text: 'Standard shipping usually takes 5–7 business days.'
            }
        ]
    },
    {
        id: 2,
        date: 'June 11, 2026',
        messages: [
            {
                id: 5,
                name: 'Customer',
                time: '11:05 AM',
                text: 'Do you offer discounts for bulk purchases?'
            },
            {
                id: 6,
                name: 'Michael Johnson',
                time: '11:09 AM',
                text: 'Yes, we do. Bulk pricing starts from an order of 50 units.'
            },
            {
                id: 7,
                name: 'Customer',
                time: '11:12 AM',
                text: 'Can you send me a quotation for 75 units?'
            },
            {
                id: 8,
                name: 'Michael Johnson',
                time: '11:16 AM',
                text: 'Certainly! I\'ll prepare the quotation and send it to your email shortly.'
            }
        ]
    },
    {
        id: 3,
        date: 'June 11, 2026',
        messages: [
            {
                id: 9,
                name: 'Customer',
                time: '02:30 PM',
                text: 'Could you tell me the dimensions of this product?'
            },
            {
                id: 10,
                name: 'Sophia Williams',
                time: '02:34 PM',
                text: 'Of course! The product measures 45 × 30 × 18 cm.'
            },
            {
                id: 11,
                name: 'Customer',
                time: '02:36 PM',
                text: 'Is it suitable for outdoor use?'
            },
            {
                id: 12,
                name: 'Sophia Williams',
                time: '02:39 PM',
                text: "Yes, it's made from weather-resistant materials and is suitable for outdoor use."
            }
        ]
    },
    {
        id: 4,
        date: 'June 10, 2026',
        messages: [
            {
                id: 13,
                name: 'Customer',
                time: '04:08 PM',
                text: 'This product shows as out of stock. When will it be available again?'
            },
            {
                id: 14,
                name: 'Daniel Brown',
                time: '04:12 PM',
                text: 'Our next shipment is expected early next week.'
            },
            {
                id: 15,
                name: 'Customer',
                time: '04:14 PM',
                text: 'Can I reserve one in advance?'
            },
            {
                id: 16,
                name: 'Daniel Brown',
                time: '04:17 PM',
                text: 'Absolutely! I can reserve one for you once the stock arrives.'
            }
        ]
    },
    {
        id: 5,
        date: 'June 10, 2026',
        messages: [
            {
                id: 17,
                name: 'Customer',
                time: '08:42 AM',
                text: 'I\'m interested in ordering 100 units. Can I get a custom quotation?'
            },
            {
                id: 18,
                name: 'Olivia Taylor',
                time: '08:47 AM',
                text: 'Certainly! I\'ve prepared a quotation based on your requested quantity.'
            },
            {
                id: 19,
                name: 'Customer',
                time: '08:50 AM',
                text: 'Does the quotation include shipping charges?'
            },
            {
                id: 20,
                name: 'Olivia Taylor',
                time: '08:53 AM',
                text: 'Yes, the quotation includes both product and estimated shipping costs.'
            }
        ]
    }
];

const EnquiryMessages = () => {
    const MessageComponent = applyFilters(
        'catalogx_enquiry_messages_component',
        DummyEnquiryMessages
    );

    return (
        <Container general>
            <Column>
                <MessageComponent />
            </Column>
        </Container>
    );
};

const DummyEnquiryMessages = () => {
    const [openPopup, setopenPopup] = useState(false);
    return (
        <div id="enquiry-messages">
            {openPopup && (
                <PopupUI
                    position="lightbox"
                    open={openPopup}
                    onClose={() => setopenPopup(false)}
                    width={31.25}
                    height="auto"
                >
                    <ShowProPopup />
                </PopupUI>
            )}

            <Container>
                <Column>
                    <div
                        id="enquiry-messages"
                        className="demo-wrapper"
                        onClick={() => {
                            setopenPopup(true);
                        }}
                    >
                        <div className="watermark">{__('This is sample Data', 'catalogx')}</div>
                        <div className="enquiry-container">
                            <div className="chat-list">
                                <div className="header-container-wrapper">
                                    <div className="search-field">
                                        <div className="search-section">
                                            <div className="setting-form-input input-wrapper">
                                                <input
                                                    className="basic-input"
                                                    type="text"
                                                    name="basic-input"
                                                    placeholder="Search here..."
                                                    autoComplete="off"
                                                    value=""
                                                />
                                            </div>
                                            <i className="adminfont-search"></i>
                                        </div>
                                    </div>
                                    <div className="date-filter">
                                        <div className="settings-calender">
                                            <input
                                                className="basic-input calender-input"
                                                readOnly
                                                name="calendar-input"
                                                placeholder="MMMM DD YYYY"
                                                value=""
                                            />
                                        </div>
                                    </div>
                                    <span className="starter-message">
                                        <i className="admin-font adminfont-more-vertical"></i>
                                    </span>
                                </div>

                                <div className="chat-list-container">
                                    <div className="recent-message">
                                        {__('Enquiry Messages', 'catalogx')}
                                        <span className="total-message">({demoChatList.length})</span>
                                    </div>
                                    <div className="chat-list-wrapper">
                                        {demoChatList.map((chat) => (
                                            <div
                                                key={chat.id}
                                                className={`chat-item ${chat.active ? 'active' : ''}`}
                                            >
                                                <div className="chat-item-container">
                                                    <div className="chat-img">
                                                        <img
                                                            src="https://secure.gravatar.com/avatar/be3221a6fac131657111728b4d912a877ec158b123d5db3afef3bd8a59784ece?s=96&d=mm&r=g"
                                                            alt="Avatar"
                                                        />
                                                    </div>
                                                    <div className="chat-meta">
                                                        <div className="name">{chat.name}</div>
                                                        <div className="last-chat">{chat.lastChat}</div>
                                                    </div>
                                                    <span className="date">{chat.date}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="enquiry-details">
                                <div className="enquiry-navbar">
                                    <div className="chat-meta">
                                        <img
                                            src="https://secure.gravatar.com/avatar/be3221a6fac131657111728b4d912a877ec158b123d5db3afef3bd8a59784ece?s=96&d=mm&r=g"
                                            alt="Avatar"
                                        />
                                        <div className="chat-name">{__('admin', 'catalogx')}</div>
                                        <div className="enquery-id">
                                            <b>{__('Enquiry ID', 'catalogx')}</b>{__('#3', 'catalogx')}
                                        </div>
                                    </div>
                                    <div className="chat-more-option">
                                        <ul>
                                            <li className="chat-more-option-item">
                                                <div className="input-container">
                                                    <input
                                                        placeholder="Search..."
                                                        className="input"
                                                        type="text"
                                                    />
                                                    <i className="admin-font icon adminfont-search"></i>
                                                </div>
                                            </li>
                                            <li className="chat-more-option-item">
                                                <button className="chat-more-option-button">
                                                    <i className="admin-font adminfont-info"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="enquiry-body">
                                    {demoMessages.map((messageGroup) => (
                                        <React.Fragment key={messageGroup.id}>
                                            <div className="date">
                                                <span>{messageGroup.date}</span>
                                            </div>
                                            {messageGroup.messages.map((message) => (
                                                <div key={message.id} className="message-box-wrapper">
                                                    <div className="sender-img">
                                                        <img
                                                            src="https://secure.gravatar.com/avatar/be3221a6fac131657111728b4d912a877ec158b123d5db3afef3bd8a59784ece?s=96&d=mm&r=g"
                                                            alt="Avatar"
                                                        />
                                                    </div>
                                                    <div className="chat-content">
                                                        <div className="content">
                                                            <div className="chat-name-wrapper">
                                                                <div className="chat-name">{message.name}</div>
                                                                <span className="chat-time">{message.time}</span>
                                                            </div>
                                                            <div className="message-text">
                                                                <span>{message.text}</span>
                                                            </div>
                                                            <div className="status"></div>
                                                        </div>
                                                    </div>
                                                    <div className="chat-actions">
                                                        <div className="tooltip-wrapper top">
                                                            <i className="action-reply adminfont-reply"></i>
                                                            <span className="tooltip-name">{__('Reply', 'catalogx')}</span>
                                                        </div>
                                                        <div className="tooltip-wrapper top">
                                                            <i className="action-copy adminfont-vendor-form-copy"></i>
                                                            <span className="tooltip-name">{__('Copy', 'catalogx')}</span>
                                                        </div>
                                                        <div className="tooltip-wrapper top">
                                                            <i className="action-push adminfont-pushpin"></i>
                                                            <span className="tooltip-name">{__('Pin', 'catalogx')}</span>
                                                        </div>
                                                        <div className="tooltip-wrapper top">
                                                            <i className="star-icon adminfont-star-o"></i>
                                                            <span className="tooltip-name">{__('Star', 'catalogx')}</span>
                                                        </div>
                                                        <div className="tooltip-wrapper top">
                                                            <i className="action-react adminfont-smile-o"></i>
                                                            <span className="tooltip-name">{__('React', 'catalogx')}</span>
                                                        </div>
                                                        <i className="action-delete adminfont-delete"></i>
                                                    </div>
                                                </div>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <div className="chat-controls-wrapper">
                                    <section className="chat-attachment-wrapper"></section>
                                    <div className="chat-controls">
                                        <div className="typing-section">
                                            <textarea placeholder="Message admin"></textarea>
                                        </div>
                                        <div className="footer-buttons">
                                            <div className="chat-attachment">
                                                <div className="tooltip-wrapper top">
                                                    <i className="plus-icon adminfont-plus"></i>
                                                    <span className="tooltip-name">{__('Add File', 'catalogx')}</span>
                                                </div>
                                                <div className="tooltip-wrapper top">
                                                    <i className="adminfont-form-email"></i>
                                                    <span className="tooltip-name">{__('Tag', 'catalogx')}</span>
                                                </div>
                                                <div className="tooltip-wrapper top">
                                                    <i className="admin-font adminfont-quote"></i>
                                                    <span className="tooltip-name">{__('Quotation', 'catalogx')}</span>
                                                </div>
                                                <div className="tooltip-wrapper top">
                                                    <i className="adminfont-smile-o"></i>
                                                    <span className="tooltip-name">{__('Emoji', 'catalogx')}</span>
                                                </div>
                                            </div>
                                            <div className="message-send-btn">
                                                <i className="send-btn purple-color adminfont-send"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Column>
            </Container>
        </div>
    );
}
export default EnquiryMessages;