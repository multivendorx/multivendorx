import React from 'react';
import { __ } from '@wordpress/i18n';
import { Card, Column, Container, NavigatorHeader } from 'zyra';

const HelpSupport: React.FC = () => {
	const videos = [
		{
			link: 'https://youtu.be/fL7wPVYopTU?si=zbX9j87shmQ3i-wl',
			title: __('How to Set Up moowoodle Marketplace', 'moowoodle'),
			des: __(
				'A step-by-step guide to setting up your multivendor marketplace.',
				'moowoodle'
			),
		},
		{
			link: 'https://youtu.be/fL7wPVYopTU?si=zbX9j87shmQ3i-wl',
			title: __('How to Set Up moowoodle Marketplace', 'moowoodle'),
			des: __(
				'A step-by-step guide to setting up your multivendor marketplace.',
				'moowoodle'
			),
		},
		{
			link: 'https://youtu.be/fL7wPVYopTU?si=zbX9j87shmQ3i-wl',
			title: __('How to Set Up moowoodle Marketplace', 'moowoodle'),
			des: __(
				'A step-by-step guide to setting up your multivendor marketplace.',
				'moowoodle'
			),
		},
	];
	const supportItems = [
		{
			icon: 'facebook-fill',
			name: __('Facebook community', 'moowoodle'),
			description: __(
				'Connect with other store owners, share tips, and get quick solutions.',
				'moowoodle'
			),
			link: 'https://www.facebook.com/groups/226246620006065/',
		},
		{
			icon: 'wordpress',
			name: __('WordPress support forum', 'moowoodle'),
			description: __(
				'Ask questions and get expert guidance from the WordPress community.',
				'moowoodle'
			),
			link: 'https://wordpress.org/support/plugin/dc-woocommerce-multi-vendor/',
		},
		{
			icon: 'forum',
			name: __('Our forum', 'moowoodle'),
			description: __(
				'Discuss moowoodle features, report issues, and collaborate with other users.',
				'moowoodle'
			),
			link: 'https://moowoodle.com/support-forum/',
		},
		{
			icon: 'live-chat',
			name: __('Live chat', 'moowoodle'),
			description: __(
				'Get real-time support from our team for setup, troubleshooting, and guidance.',
				'moowoodle'
			),
			link: 'https://tawk.to/chat/5d2eebf19b94cd38bbe7c9ad/1fsg8cq8n',
		},
	];
	const DocumentationItems = [
		{
			icon: 'document',
			name: __('Official documentation', 'moowoodle'),
			description: __(
				'Step-by-step guides for every moowoodle feature.',
				'moowoodle'
			),
			link: 'https://moowoodle.com/docs/knowledgebase/',
		},
		{
			icon: 'youtube',
			name: __('YouTube tutorials', 'moowoodle'),
			description: __(
				'Watch videos on marketplace setup, store management, payments, and more.',
				'moowoodle'
			),
			link: 'https://www.youtube.com/@moowoodle/videos',
		},
		{
			icon: 'faq',
			name: __('FAQs', 'moowoodle'),
			description: __(
				'Quick answers to the most common questions about features and troubleshooting.',
				'moowoodle'
			),
			link: 'https://moowoodle.com/docs/faqs/',
		},
		{
			icon: 'coding',
			name: __('Coding support', 'moowoodle'),
			description: __(
				'Professional help for customizations, integrations, and technical issues.',
				'moowoodle'
			),
			link: 'https://discord.com/channels/1376811097134469191/1376811102020829258',
		},
	];
	return (
		<>
			<NavigatorHeader
				headerIcon="customer-support"
				headerTitle={__('Help & Support', 'moowoodle')}
				headerDescription={__(
					'Get fast help, expert guidance, and easy-to-follow resources - all in one place.',
					'moowoodle'
				)}
			/>

			<Container general>
				<Column row>
					<Card title={__('Community & forums', 'moowoodle')}>
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
					<Card title={__('Documentation & Learning', 'moowoodle')}>
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
										'Master moowoodle in minutes!',
										'moowoodle'
									)}
								</div>
								<div className="des">
									{__(
										'Watch our top tutorial videos and learn how to set up your marketplace, manage stores, and enable subscriptions - all in just a few easy steps.',
										'moowoodle'
									)}
								</div>
								<a
									href="https://www.youtube.com/@moowoodle/videos"
									target="_blank"
									rel="noopener noreferrer"
									className="admin-btn btn-purple"
								>
									<i className="adminfont-eye" />{' '}
									{__('Watch All Tutorials', 'moowoodle')}
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
												{__(video.title, 'moowoodle')}
											</div>
											<div className="des">
												{__(video.des, 'moowoodle')}
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
