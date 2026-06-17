import React, { useState } from 'react';
import { PopupUI, Container, Column } from 'zyra';
import ShowProPopup from '../Popup/Popup';
import './enquiryMessages.scss';

// Demo data
const demoChatList = [
    { id: 1, name: 'admin', lastChat: 'i ask the customer for all details.', date: 'June 11, 2026', active: false },
    { id: 2, name: 'admin', lastChat: 'i ask the customer for all details.', date: 'June 11, 2026', active: false },
    { id: 3, name: 'admin', lastChat: 'i ask the customer for all details.', date: 'June 11, 2026', active: true },
    { id: 4, name: 'admin', lastChat: 'i ask the customer for all details.', date: 'June 10, 2026', active: false },
    { id: 5, name: 'admin', lastChat: 'i ask the customer for all details.', date: 'June 10, 2026', active: false },
];

const demoMessages = [
    {
        id: 1,
        date: 'November 6, 2026',
        messages: [
            { id: 1, name: 'admin', time: '05:50 AM', text: 'The customer reached out but didn\'t include a message—feel free to start the conversation!' }
        ]
    },
    {
        id: 2,
        date: 'December 6, 2026',
        messages: [
            { id: 2, name: 'admin', time: '10:42 AM', text: 'kkk' }
        ]
    }
];

const EnquiryMessages = () => {
    const [openPopup, setopenPopup] = useState(false);

    // If Pro is active, render only mount point
    if (appLocalizer.khali_dabba) {
        return (
            <Container general>
                <Column>
                    <div id="enquiry-messages"></div>
                </Column>
            </Container>
        );
    }

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

            <Container general>
                <Column>
                    <div 
                        id="enquiry-messages" 
                        onClick={() => {
                            setopenPopup(true);
                        }}
                    >
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
                                        Enquiry Messages
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
                                        <div className="chat-name">admin</div>
                                        <div className="enquery-id">
                                            <b>Enquiry ID</b> #3
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
                                                            <span className="tooltip-name">Reply</span>
                                                        </div>
                                                        <div className="tooltip-wrapper top">
                                                            <i className="action-copy adminfont-vendor-form-copy"></i>
                                                            <span className="tooltip-name">Copy</span>
                                                        </div>
                                                        <div className="tooltip-wrapper top">
                                                            <i className="action-push adminfont-pushpin"></i>
                                                            <span className="tooltip-name">Pin</span>
                                                        </div>
                                                        <div className="tooltip-wrapper top">
                                                            <i className="star-icon adminfont-star-o"></i>
                                                            <span className="tooltip-name">Star</span>
                                                        </div>
                                                        <div className="tooltip-wrapper top">
                                                            <i className="action-react adminfont-smile-o"></i>
                                                            <span className="tooltip-name">React</span>
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
                                                    <span className="tooltip-name">Add File</span>
                                                </div>
                                                <div className="tooltip-wrapper top">
                                                    <i className="adminfont-form-email"></i>
                                                    <span className="tooltip-name">Tag</span>
                                                </div>
                                                <div className="tooltip-wrapper top">
                                                    <i className="admin-font adminfont-quote"></i>
                                                    <span className="tooltip-name">Quotation</span>
                                                </div>
                                                <div className="tooltip-wrapper top">
                                                    <i className="adminfont-smile-o"></i>
                                                    <span className="tooltip-name">Emoji</span>
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
};

export default EnquiryMessages;