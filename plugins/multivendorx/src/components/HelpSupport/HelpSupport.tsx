import { __ } from '@wordpress/i18n';
import { Card, Column, Container, NavigatorHeader } from 'zyra';

const HelpSupport: React.FC = () => {
	const videos = [
		{
			link: 'https://www.youtube.com/watch?v=TL1HegIe0jE',
			title: 'How to Set Up MultiVendorX Marketplace',
			des: 'A step-by-step guide to setting up your multivendor marketplace.',
		},
		{
			link: 'https://www.youtube.com/watch?v=TL1HegIe0jE',
			title: 'Vendor Dashboard Overview',
			des: 'Learn everything about the vendor dashboard and features.',
		},
		{
			link: 'https://www.youtube.com/watch?v=TL1HegIe0jE',
			title: 'Enable Vendor Subscriptions',
			des: 'Understand how to set up subscription-based vendor plans.',
		},
	];
	const supportItems = [
		{
			icon: 'facebook-fill',
			name: __('Facebook community', 'multivendorx'),
			description: __('Connect with other store owners, share tips, and get quick solutions.', 'multivendorx'),
			link: 'https://www.facebook.com/groups/226246620006065/'
		},
		{
			icon: 'wordpress',
			name: __('WordPress support forum', 'multivendorx'),
			description: __('Ask questions and get expert guidance from the WordPress community.', 'multivendorx'),
			link: 'https://wordpress.org/support/plugin/dc-woocommerce-multi-vendor/'
		},
		{
			icon: 'forum',
			name: __('Our forum', 'multivendorx'),
			description: __('Discuss MultiVendorX features, report issues, and collaborate with other users.', 'multivendorx'),
			link: 'https://multivendorx.com/support-forum/'
		},
		{
			icon: 'live-chat',
			name: __('Live chat', 'multivendorx'),
			description: __('Get real-time support from our team for setup, troubleshooting, and guidance.', 'multivendorx'),
			link: 'https://tawk.to/chat/5d2eebf19b94cd38bbe7c9ad/1fsg8cq8n'
		}
	];
	const DocumentationItems = [
		{
			icon: 'document',
			name: __('Official documentation', 'multivendorx'),
			description: __('Step-by-step guides for every MultiVendorX feature.', 'multivendorx'),
			link: 'https://multivendorx.com/docs/knowledgebase/'
		},
		{
			icon: 'youtube',
			name: __('YouTube tutorials', 'multivendorx'),
			description: __('Watch videos on marketplace setup, store management, payments, and more.', 'multivendorx'),
			link: 'https://www.youtube.com/@MultiVendorX/videos'
		},
		{
			icon: 'faq',
			name: __('FAQs', 'multivendorx'),
			description: __('Quick answers to the most common questions about features and troubleshooting.', 'multivendorx'),
			link: 'https://multivendorx.com/docs/faqs/'
		},
		{
			icon: 'coding',
			name: __('Coding support', 'multivendorx'),
			description: __('Professional help for customizations, integrations, and technical issues.', 'multivendorx'),
			link: 'https://discord.com/channels/1376811097134469191/1376811102020829258'
		}
	];
	return (
		<>
			<NavigatorHeader
				headerIcon="customer-support"
				headerTitle={__('Help & Support', 'multivendorx')}
				headerDescription={__('Get fast help, expert guidance, and easy-to-follow resources - all in one place.', 'multivendorx')}
			/>

			<Container general>
				<Column row>
					<Card title={__('Community & forums', 'multivendorx')}>
						<div className="support-wrapper">
							{supportItems.map((item, index) => (
								<div className="support-item" key={index}>
									<div className="image">
										<i className={`adminfont-${item.icon}`} />
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
										<div className="des"> {item.description} </div>
									</div>
								</div>
							))}
						</div>
					</Card>
					<Card title={__( 'Documentation & Learning', 'multivendorx' )}>
						<div className="support-wrapper">
							{DocumentationItems.map((item, index) => (
								<div className="support-item" key={index}>
									<div className="image">
										<i className={`adminfont-${item.icon}`} />
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
										'Master MultiVendorX in minutes!',
										'multivendorx'
									)}
								</div>
								<div className="des">
									{__(
										'Watch our top tutorial videos and learn how to set up your marketplace, manage stores, and enable subscriptions - all in just a few easy steps.',
										'multivendorx'
									)}
								</div>
								<a
									href="https://www.youtube.com/@MultiVendorX/videos"
									target="_blank"
									rel="noopener noreferrer"
									className="admin-btn btn-purple"
								>
									{__( 'Watch All Tutorials', 'multivendorx' )}
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
													'multivendorx'
												)}
											</div>
											<div className="des">
												{__(
													video.des,
													'multivendorx'
												)}
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
