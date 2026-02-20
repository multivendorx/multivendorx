import { useState, useEffect } from 'react';
import { TextArea, FileInput, SelectInput, getApiLink } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

const Verification = () => {
	const appLocalizer = (window as any).appLocalizer;
	const allVerificationMethods = appLocalizer.all_verification_methods;
	const [connectedProfiles, setConnectedProfiles] = useState<any>({});
	const [loading, setLoading] = useState<string>('');
	const [profileLoading, setProfileLoading] = useState<boolean>(true);
	const [statusMessage, setStatusMessage] = useState<{
		type: string;
		text: string;
	} | null>(null);

	useEffect(() => {
		fetchConnectedProfiles();
		checkUrlStatus();
	}, []);

	const checkUrlStatus = () => {
		const urlParams = new URLSearchParams(window.location.search);
		const verificationStatus = urlParams.get('social_verification');
		const provider = urlParams.get('provider');
		const message = urlParams.get('message');

		if (verificationStatus && message) {
			setStatusMessage({
				type: verificationStatus,
				text: decodeURIComponent(message),
			});

			// Clean URL
			const cleanUrl = window.location.pathname + '?tab=verification';
			window.history.replaceState({}, document.title, cleanUrl);

			// Auto-hide success messages after 5 seconds
			if (verificationStatus === 'success') {
				setTimeout(() => {
					setStatusMessage(null);
				}, 5000);
			}
		}
	};

	const fetchConnectedProfiles = async () => {
		try {
			setProfileLoading(true);
			const response = await axios({
				method: 'GET',
				url: getApiLink(appLocalizer, 'store/social-profiles'),
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
					'Content-Type': 'application/json',
				},
			});

			const data = response.data;
			if (data.success) {
				setConnectedProfiles(data.data || {});
			}
		} catch (error) {
			console.error('Error fetching connected profiles:', error);
		} finally {
			setProfileLoading(false);
		}
	};

	const connectSocialProfile = async (provider: string) => {
		setLoading(provider);
		try {
			const response = await axios({
				method: 'POST',
				url: getApiLink(appLocalizer, 'store/connect-social'),
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
					'Content-Type': 'application/json',
				},
				data: { provider },
			});

			const data = response.data;
			if (data.success && data.data.redirect_url) {
				window.location.href = data.data.redirect_url;
			} else {
				alert(
					'Failed to connect: ' + (data.message || 'Unknown error')
				);
			}
		} catch (error: any) {
			console.error('Error connecting social profile:', error);
			const errorMessage =
				error.response?.data?.message ||
				'Failed to connect social profile';
			alert(errorMessage);
		} finally {
			setLoading('');
		}
	};

	const disconnectSocialProfile = async (provider: string) => {
		if (
			!confirm('Are you sure you want to disconnect this social profile?')
		) {
			return;
		}

		try {
			const response = await axios({
				method: 'POST',
				url: getApiLink(appLocalizer, 'store/disconnect-social'),
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
					'Content-Type': 'application/json',
				},
				data: { provider },
			});

			const data = response.data;
			if (data.success) {
				setConnectedProfiles((prev: any) => {
					const updated = { ...prev };
					delete updated[provider];
					return updated;
				});
				alert('Social profile disconnected successfully');
			} else {
				alert(
					'Failed to disconnect: ' + (data.message || 'Unknown error')
				);
			}
		} catch (error: any) {
			console.error('Error disconnecting social profile:', error);
			const errorMessage =
				error.response?.data?.message ||
				'Failed to disconnect social profile';
			alert(errorMessage);
		}
	};

	const getSocialStatus = (provider: string) => {
		return connectedProfiles[provider] ? 'connected' : 'not_connected';
	};

	const getButtonConfig = (provider: string) => {
		const status = getSocialStatus(provider);

		switch (status) {
			case 'connected':
				return {
					text: 'Connected',
					class: 'admin-btn btn-green',
					action: () => disconnectSocialProfile(provider),
					disabled: false,
				};
			case 'not_connected':
				return {
					text: loading === provider ? 'Connecting...' : 'Connect',
					class: 'admin-btn btn-purple',
					action: () => connectSocialProfile(provider),
					disabled: loading !== '',
				};
			default:
				return {
					text: 'Connect',
					class: 'admin-btn btn-purple',
					action: () => connectSocialProfile(provider),
					disabled: false,
				};
		}
	};

	const renderSocialVerification = () => {
		const socialConfigs = [
			{
				provider: 'linkedin',
				icon: 'adminfont-linkedin yellow',
				name: 'Verify via LinkedIn',
				enabled:
					allVerificationMethods?.['social-verification']
						?.social_verification_methods?.['linkedin-connect']
						?.enable,
			},
			{
				provider: 'google',
				icon: 'adminfont-google yellow',
				name: 'Verify via Google',
				enabled:
					allVerificationMethods?.['social-verification']
						?.social_verification_methods?.['google-connect']
						?.enable,
			},
			{
				provider: 'facebook',
				icon: 'adminfont-facebook yellow',
				name: 'Verify via Facebook',
				enabled:
					allVerificationMethods?.['social-verification']
						?.social_verification_methods?.['facebook-connect']
						?.enable,
			},
			{
				provider: 'twitter',
				icon: 'adminfont-twitter yellow',
				name: 'Verify via Twitter',
				enabled:
					allVerificationMethods?.['social-verification']
						?.social_verification_methods?.['twitter-connect']
						?.enable,
			},
		];

		return socialConfigs
			.map((social) => {
				if (!social.enabled) {
					return null;
				}

				const buttonConfig = getButtonConfig(social.provider);

				return (
					<div key={social.provider} className="varification-wrapper">
						<div className="left">
							<i className={social.icon}></i>
							<div className="name">{social.name}</div>
						</div>
						<div className="right">
							<button
								className={buttonConfig.class}
								onClick={buttonConfig.action}
								disabled={buttonConfig.disabled}
							>
								{buttonConfig.text}
							</button>
						</div>
					</div>
				);
			})
			.filter(Boolean);
	};

	return (
		<>
			{/* Status Messages */}
			{statusMessage && (
				<div
					className={`alert alert-${
						statusMessage.type === 'success' ? 'success' : 'error'
					}`}
				>
					{statusMessage.text}
					<button
						className="alert-close"
						onClick={() => setStatusMessage(null)}
					>
						×
					</button>
				</div>
			)}

			<div className="card-wrapper">
				<div className="card-content">
					<div className="card-title">
						{__('Identity Documents', 'multivendorx')}
					</div>

					{/* Identity Verification Methods */}
					{allVerificationMethods?.[
						'id-verification'
					]?.verification_methods?.map(
						(method: any, index: number) =>
							method.active && (
								<div
									key={index}
									className="varification-wrapper"
								>
									<div className="left">
										<i className="adminfont-verification3 yellow"></i>
										<div className="name">
											{method.label}
										</div>
										{method.required && (
											<span className="required-badge">
												{__('Required', 'multivendorx')}
											</span>
										)}
									</div>
									<div className="right">
										<div className="admin-btn btn-purple">
											{__('Verify Now', 'multivendorx')}
										</div>
									</div>
								</div>
							)
					)}

					<div className="card-title">
						{__('Required Information', 'multivendorx')}
					</div>

					{/* Add your required information fields here */}

					<div className="card-title">
						{__('Social Profiles', 'multivendorx')}
					</div>

					{renderSocialVerification()}
				</div>
			</div>
		</>
	);
};

export default Verification;
