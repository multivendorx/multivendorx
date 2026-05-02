import React from 'react';
import { __ } from '@wordpress/i18n';
import { Card, Column, Container, NavigatorHeader } from 'zyra';

const HelpSupport: React.FC = () => {
	const videos = [
		{
			link: 'https://youtu.be/fL7wPVYopTU?si=zbX9j87shmQ3i-wl',
			title: __('How to Set Up catalogx Marketplace', 'catalogx'),
			des: __(
				'A step-by-step guide to setting up your multivendor marketplace.',
				'catalogx'
			),
		},
        {
			link: 'https://youtu.be/fL7wPVYopTU?si=zbX9j87shmQ3i-wl',
			title: __('How to Set Up catalogx Marketplace', 'catalogx'),
			des: __(
				'A step-by-step guide to setting up your multivendor marketplace.',
				'catalogx'
			),
		},
        {
			link: 'https://youtu.be/fL7wPVYopTU?si=zbX9j87shmQ3i-wl',
			title: __('How to Set Up catalogx Marketplace', 'catalogx'),
			des: __(
				'A step-by-step guide to setting up your multivendor marketplace.',
				'catalogx'
			),
		},
	];
	const supportItems = [
		{
			icon: 'mail',
			name: __('Get in touch with Support', 'catalogx'),
			description: __(
				'Reach out to the support team for assistance or guidance.',
				'catalogx'
			),
			link: 'https://catalogx.com/support/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
		},
		{
			icon: 'submission-message',
			name: __('Explore Documentation', 'catalogx'),
			description: __(
				'Understand the plugin and its settings.',
				'catalogx'
			),
			link: 'https://catalogx.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
		},
		{
			icon: 'support',
			name: __('Contribute Here', 'catalogx'),
			description: __(
				'To participate in product enhancement.',
				'catalogx'
			),
			link: 'https://github.com/multivendorx/catalogx/issues',
		},
	];
	const DocumentationItems = [
		{
			icon: 'mail',
			name: __('Get in touch with Support', 'catalogx'),
			description: __(
				'Reach out to the support team for assistance or guidance.',
				'catalogx'
			),
			link: 'https://catalogx.com/support/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
		},
		{
			icon: 'submission-message',
			name: __('Explore Documentation', 'catalogx'),
			description: __(
				'Understand the plugin and its settings.',
				'catalogx'
			),
			link: 'https://catalogx.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
		},
		{
			icon: 'support',
			name: __('Contribute Here', 'catalogx'),
			description: __(
				'To participate in product enhancement.',
				'catalogx'
			),
			link: 'https://github.com/multivendorx/catalogx/issues',
		},
	];
	return (
		<>
			<NavigatorHeader
				headerIcon="customer-support"
				headerTitle={__('Help & Support', 'catalogx')}
				headerDescription={__(
					'Get fast help, expert guidance, and easy-to-follow resources - all in one place.',
					'catalogx'
				)}
			/>

			<Container general>
				<Column row>
					<Card title={__('Community & forums', 'catalogx')}>
						<div className="support-wrapper">
							{supportItems.map((item, index) => (
								<div className="support-item" key={index}>
									<div className="image">
										<i
											className={`adminfont-${item.icon}`}
										/>
									</div>
									<div className="details">
										<div className="name">
											<a
												href={item.link}
												target="_blank"
												rel="noopener noreferrer"
											>
												{item.name}
											</a>
										</div>
										<div className="des">
											{' '}
											{item.description}{' '}
										</div>
									</div>
								</div>
							))}
						</div>
					</Card>
					<Card
						title={__('Documentation & Learning', 'catalogx')}
					>
						<div className="support-wrapper">
							{DocumentationItems.map((item, index) => (
								<div className="support-item" key={index}>
									<div className="image">
										<i
											className={`adminfont-${item.icon}`}
										/>
									</div>
									<div className="details">
										<div className="name">
											<a
												href={item.link}
												target="_blank"
												rel="noopener noreferrer"
											>
												{item.name}
											</a>
										</div>
										<div className="des">
											{item.description}
										</div>
									</div>
								</div>
							))}
						</div>
					</Card>
				</Column>

				<Column>
					<Card>
						<div className="video-section">
							<div className="details-wrapper">
								<div className="title">
									{__(
										'Master catalogx in minutes!',
										'catalogx'
									)}
								</div>
								<div className="des">
									{__(
										'Watch our top tutorial videos and learn how to set up your marketplace, manage stores, and enable subscriptions - all in just a few easy steps.',
										'catalogx'
									)}
								</div>
								<a
									href="https://www.youtube.com/@catalogx/videos"
									target="_blank"
									rel="noopener noreferrer"
									className="admin-btn btn-purple"
								>
									<i className="adminfont-eye" />{' '}
									{__('Watch All Tutorials', 'catalogx')}
								</a>
							</div>

							<div className="video-section">
								{videos.map((video, index) => {
									const videoId = new URL(
										video.link
									).searchParams.get('v');
									return (
										<div
											key={index}
											className="video-wrapper"
										>
											<iframe
												src={`https://www.youtube.com/embed/${videoId}`}
												title={video.title}
												frameBorder="0"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowFullScreen
											></iframe>

											<div className="title">
												{__(
													video.title,
													'catalogx'
												)}
											</div>
											<div className="des">
												{__(video.des, 'catalogx')}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default HelpSupport;
