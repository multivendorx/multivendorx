import { __ } from '@wordpress/i18n';
import React from 'react';

interface FollowStoreProps {
    followersCount: number;
}
const ButtonStyle = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
}
// Followers count style
const followersCountStyle = {
    fontSize: '16px',
    color: '#fff',
    fontWeight: 'normal',
    marginTop: '2px'
};

const FollowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
);

const FollowStore: React.FC<FollowStoreProps> = () => {
    return (
        <div className="multivendorx-follow-store-inner">
            <button style={ButtonStyle}
                className={`wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-store-follow-btn`}
            >
                <FollowIcon />
                {__('Follow Store', 'multivendorx')}
            </button>

            <div style={followersCountStyle}>
                {'1001'} {__('followers', 'multivendorx')}
            </div>

        </div>
    );
};

export default FollowStore;
