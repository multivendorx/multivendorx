import React, { useState } from 'react';

type SupportChatProps = {
    chatUrl: string;
};

const SupportChat: React.FC<SupportChatProps> = ({ chatUrl }) => {
    const [contactSupportPopup, setContactSupportPopup] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    return (
        <>
            <div
                className={`live-chat-wrapper
                    ${contactSupportPopup ? 'open' : ''}
                    ${isMinimized ? 'minimized' : ''}`}
            >
                <i
                    className="adminfont-close "
                    onClick={() => {
                        setContactSupportPopup(false);
                    }}
                ></i>

                <i
                    className="adminfont-minus icon"
                    onClick={() => {
                        setIsMinimized(!isMinimized);
                        setContactSupportPopup(true);
                    }}
                ></i>

                <iframe
                    src={chatUrl}
                    title="Support Chat"
                    allow="microphone; camera"
                />
            </div>

            {isMinimized && (
                <div
                    onClick={() => {
                        setContactSupportPopup(true);
                        setIsMinimized(false);
                    }}
                    className="minimized-icon"
                >
                    <i
                        className="admin-icon adminfont-enquiry"
                        title="Messages"
                    ></i>
                </div>
            )}
        </>
    );
};

export default SupportChat;
