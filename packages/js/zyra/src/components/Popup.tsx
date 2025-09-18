/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { DialogContent, DialogContentText } from '@mui/material';

/**
 * Internal dependencies
 */
import '../styles/web/Popup.scss';

export interface PopupMessage {
    icon: string;
    text: string;
}
export interface BtnLink {
    value: string;
    link: string;
}
// Types
export interface PopupProps {
    proUrl?: string;
    title?: string;
    messages?: PopupMessage[];
    moreText?: string;
    moduleName?: string;
    settings?: string;
    plugin?: string;
    message?: string;
    moduleButton?: string;
    pluginDescription?: string;
    pluginButton?: string;
    SettingDescription?: string;
    pluginUrl?: string;
    modulePageUrl?: string;
    btnLink?: BtnLink[];
}

const ProPopup: React.FC<PopupProps> = (props) => {
    const { btnLink = [], proUrl = '#' } = props;
    // default to first btnLink's link if present, otherwise fallback to proUrl
    const [selectedLink, setSelectedLink] = useState<string>(
        btnLink.length ? btnLink[0].link : proUrl

    );
    // update selectedLink if props change
    useEffect(() => {
        setSelectedLink(btnLink.length ? btnLink[0].link : proUrl);
    }, [btnLink, proUrl]);
    return (
        <DialogContent className={`${props.messages ? "pro-popup-content" : "module-popup-content"}`}>
            <DialogContentText sx={{ fontFamily: "Figtree, sans-serif" }}>
                <div className="popup-wrapper">
                    {props.messages && (
                        <>
                            <div className="top-section">
                                <div className="heading">Upgrade Your Plan</div>
                                <div className="description">Lorem ipsum dolor sit amet.</div>

                                <select
                                    value={selectedLink}
                                    onChange={(e) => setSelectedLink(e.target.value)}
                                >
                                    {btnLink.map((b, idx) => (
                                        <option key={idx} value={b.link}>
                                            {b.value}
                                        </option>
                                    ))}
                                </select>
                                <a
                                    className="admin-btn btn-red"
                                    href={selectedLink}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Upgrade my plan <i className="adminlib-arrow-right arrow-icon"></i>
                                </a>
                            </div>
                            <div className="content">
                                <div className="heading-text">
                                    Why should you upgrade?
                                </div>

                                <ul>
                                    {props.messages?.map(
                                        (message, index) => (
                                            <li>
                                                <div className="title">
                                                    {message.text}
                                                </div>
                                                <div className="sub-text">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti eum quo, sapiente libero quam et.</div>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                            {/* <div className="right-section">
                                <h4>
                                    Unlock <span className="pro-tag">Pro</span>
                                    <i className="popup-icon-popup-star"></i>
                                </h4>
                                <ul className="features-list">
                                    {props.messages?.map(
                                        (message, index) => (
                                            <li
                                                className="feature-item"
                                                key={index}
                                            >
                                                <i
                                                    className={message.icon}
                                                ></i>
                                                <p>{message.text}</p>
                                            </li>
                                        )
                                    )}
                                </ul>
                                <span className="more-text">
                                    {props.moreText}
                                </span>
                                <div className="footer-button">
                                    <a
                                        className="admin-btn btn-purple"
                                        target="_blank"
                                        rel="noreferrer"
                                        href={props.proUrl}
                                    >
                                        Get Pro. Sell More.
                                    </a>
                                </div>
                            </div> */}
                        </>
                    )}
                    {props.moduleName && (
                        <>
                            <div className="module-left-section">
                                <div className="module-icon">
                                    <i className={`adminlib-${props.moduleName}`}></i>
                                </div>
                            </div>
                            <div className="module-right-section">
                                <h2>Activate {props.moduleName}</h2>
                                <p>{props.message}</p>

                                <div className="footer-button">
                                    <a
                                        className="admin-btn btn-purple"
                                        href={props.modulePageUrl}
                                    >
                                        {props.moduleButton}
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                    {props.settings && (
                        <>
                            <h2>{props.message}</h2>
                            <p>{props.SettingDescription}</p>
                        </>
                    )}
                </div>
            </DialogContentText>
        </DialogContent >
    );
};

export default ProPopup;