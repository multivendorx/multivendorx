/**
 * External dependencies
 */
import React from 'react';
import { DialogContent, DialogContentText } from '@mui/material';

/**
 * Internal dependencies
 */
import '../styles/web/Popup.scss';

export interface PopupMessage {
    icon: string;
    text: string;
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
}

const ProPopup: React.FC< PopupProps > = ( props ) => {
    return (
        <DialogContent>
            <DialogContentText>
                <div className="popup-wrapper">
                    <div className="left-section"></div>
                    <div className="right-section">
                        { /* <div
                            className="admin-font adminlib-cross"
                            onClick={ () => setOpenDialog( false ) }
                        ></div> */ }
                        { props.messages && (
                            <h4>
                                Unlock <span className="pro-tag">Pro</span>
                                <i className="popup-icon-star-notifima"></i>
                            </h4>
                        ) }
                        { props.messages && (
                            <>
                                <ul className="features-list">
                                    { props.messages?.map(
                                        ( message, index ) => (
                                            <li
                                                className="feature-item"
                                                key={ index }
                                            >
                                                <i
                                                    className={ message.icon }
                                                ></i>
                                                <p>{ message.text }</p>
                                            </li>
                                        )
                                    ) }
                                </ul>
                                <span className="more-text">
                                    { props.moreText }
                                </span>
                                <div className="footer-button">
                                    <a
                                        className="admin-btn btn-purple"
                                        target="_blank"
                                        rel="noreferrer"
                                        href={ props.proUrl }
                                    >
                                        Upgrade to pro
                                    </a>
                                </div>
                            </>
                        ) }
                        { props.moduleName && (
                            <>
                                <h2>{ props.message }</h2>
                                <a
                                    className="admin-btn btn-red"
                                    href={ props.modulePageUrl }
                                >
                                    { props.moduleButton }
                                </a>
                            </>
                        ) }
                        { props.settings && (
                            <>
                                <h2>{ props.message }</h2>
                                <p>{ props.SettingDescription }</p>
                            </>
                        ) }
                    </div>
                </div>

                { /* <div className="popup-wrapper">
                    <div className="popup-content">
                        {props.messages && (
                            <div className="heading">
                                Unlock <span className="pro-text">Pro</span>
                            </div>
                        )}
                        <div className="popup-body">
                            {props.messages && (
                                <>
                                    <strong>{props.title}</strong>
                                    <p>&nbsp;</p>
                                    {props.messages?.map((message, index) => (
                                        <p key={index}>{`${index + 1
                                            }. ${message}`}</p>
                                    ))}
                                    <a
                                        className="admin-btn btn-red"
                                        target="_blank"
                                        rel="noreferrer"
                                        href={props.proUrl}
                                    >
                                        Upgrade to Pro
                                    </a>
                                </>
                            )}
                            {props.moduleName && (
                                <>
                                    <h2>{props.message}</h2>
                                    <a
                                        className="admin-btn btn-red"
                                        href={props.modulePageUrl}
                                    >
                                        {props.moduleButton}
                                    </a>
                                </>
                            )}
                            {props.settings && (
                                <>
                                    <h2>{props.message}</h2>
                                    <p>{props.SettingDescription}</p>
                                </>
                            )}
                        </div>
                        {props.plugin && (
                            <div>
                                <h2>{props.message}</h2>
                                <p id="description">
                                    {props.pluginDescription}
                                </p>
                                <a
                                    className="admin-btn btn-red"
                                    target="_blank"
                                    rel="noreferrer"
                                    href={props.pluginUrl}
                                >
                                    {props.pluginButton}
                                </a>
                            </div>
                        )}
                    </div>
                </div> */ }
            </DialogContentText>
        </DialogContent>
    );
};

export default ProPopup;
