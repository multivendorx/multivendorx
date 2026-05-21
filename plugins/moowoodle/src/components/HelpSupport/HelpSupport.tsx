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
	const DocumentationItems = [
		{
			icon: 'document',
			name: __('Official documentation', 'moowoodle'),
			description: __(
				'Step-by-step guides for every moowoodle feature.',
				'moowoodle'
			),
			link: 'https://moowoodle.com/docs/knowledgebase/?utm_source=settings&utm_medium=plugin&utm_campaign=track',
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
	];
	const supportItems = [
		{
			icon: 'wordpress',
			name: __('WordPress support forum', 'moowoodle'),
			description: __(
				'Ask questions and get expert guidance from the WordPress community.',
				'moowoodle'
			),
			link: 'https://wordpress.org/plugins/moowoodle/',
		},
		{
			icon: 'development',
			name: __('Custom development', 'moowoodle'),
			description: __(
				'Get personalized assistance and tailored solutions built for your eLearning platform.',
				'moowoodle'
			),
			link: 'https://dualcube.com/custom-development/?utm_source=settings&utm_medium=plugin&utm_campaign=track',
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
			</Container>
		</>
	);
};

export default HelpSupport;
