/* global StoreInfo */
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
	alignItems: 'center',
};

const FollowStore: React.FC<FollowStoreProps> = ({
	showFollowerCount = true,
}) => {
	const [followersCount, setFollowersCount] = useState<number>(0);
	const [isFollowing, setIsFollowing] = useState<boolean>(false);

	const storeId = StoreInfo.storeDetails.storeId;
	const userId = StoreInfo.currentUserId;
	useEffect(() => {
		axios
			.get(getApiLink(StoreInfo, `follow-stores/${storeId}`), {
				headers: { 'X-WP-Nonce': StoreInfo.nonce },
				params: {
					user_id: userId,
					store_id: storeId,
				},
			})
			.then((response) => {
				if (response?.data) {
					setIsFollowing(response.data.follow);
					setFollowersCount(response.data.follower_count);
				}
			});
	}, []);

	const handleFollowToggle = () => {
		if (!StoreInfo.currentUserId || StoreInfo.currentUserId === '0') {
			const currentUrl = window.location.href;
			window.location.href = `${StoreInfo.loginUrl}?redirect_to=${encodeURIComponent(currentUrl)}`;
			return;
		}

		axios
			.post(
				getApiLink(StoreInfo, `follow-stores/${storeId}`),
				{
					user_id: userId,
					store_id: storeId,
				},
				{
					headers: { 'X-WP-Nonce': StoreInfo.nonce },
				}
			)
			.then((response) => {
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
				{isFollowing
					? __('Unfollow Store', 'multivendorx')
					: __('Follow Store', 'multivendorx')}
			</button>

			{showFollowerCount && (
				<div className="multivendorx-followers-count">
					{followersCount.toLocaleString()}{' '}
					{followersCount === 1
						? __('follower', 'multivendorx')
						: __('followers', 'multivendorx')}
				</div>
			)}
		</div>
	);
};

export default FollowStore;
