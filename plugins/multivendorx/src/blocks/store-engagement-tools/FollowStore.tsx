import { __ } from '@wordpress/i18n';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getApiLink } from 'zyra';

interface FollowStoreProps {
    followersCount?: number;
    showFollowerCount?: boolean;
}

const ButtonStyle = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
};

const FollowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
);

const FollowStore: React.FC<FollowStoreProps> = ({ showFollowerCount = true }) => {
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    const storeId = StoreInfo.storeDetails.storeId;
    const userId = StoreInfo.currentUserId;

    useEffect(() => {
        axios.get(
            getApiLink(StoreInfo, `follow-store/${storeId}`),
            {
                headers: { 'X-WP-Nonce': StoreInfo.nonce },
                params: {
                    userId,
                    storeId
                }
            }
        ).then((response) => {
            if (response?.data) {
                setIsFollowing(response.data.follow);
                setFollowersCount(response.data.follower_count);
            }
        });
    }, []);

    const handleFollowToggle = () => {
        axios.post(
            getApiLink(StoreInfo, `follow-store/${storeId}`),
            {
                userId,
                storeId
            },
            {
                headers: { 'X-WP-Nonce': StoreInfo.nonce }
            }
        ).then((response) => {
            if (response?.data) {
                setIsFollowing(response.data.follow);
                setFollowersCount(response.data.follower_count);
            }
        });
    };
    
    return (
        <div className="multivendorx-follow-store-inner">
            <button
                style={ButtonStyle}
                className={`wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-store-follow-btn`}
                onClick={handleFollowToggle}
            >
                <FollowIcon />
                {isFollowing
                    ? __('Unfollow Store', 'multivendorx')
                    : __('Follow Store', 'multivendorx')}
            </button>

            {showFollowerCount && (
                <div className="multivendorx-followers-count">
                    {followersCount.toLocaleString()} {followersCount === 1 ? __('follower', 'multivendorx') : __('followers', 'multivendorx')}
                </div>
            )}
        </div>
    );
};

export default FollowStore;