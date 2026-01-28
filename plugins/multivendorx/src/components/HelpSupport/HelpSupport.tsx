import { __ } from '@wordpress/i18n';
import { AdminBreadcrumbs, Card, Column, Container } from 'zyra';

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
	return (
		<>
			<AdminBreadcrumbs
				activeTabIcon="adminfont-customer-support"
				tabTitle="Help & Support"
				description={
					'Get fast help, expert guidance, and easy-to-follow resources - all in one place.'
				}
			/>

			<Container general>
				<Column row>
					<Card title="Community & forums">
						<div className="support-wrapper">
							<div className="support-item">
								<div className="image">
									<i className="adminfont-facebook-fill"></i>
								</div>
								<div className="details">
									<div className="name">
										<a
											href="https://www.facebook.com/groups/226246620006065/"
											target="_blank"
											rel="noopener noreferrer"
										>
											{__(
												'Facebook community',
												'multivendorx'
											)}
										</a>
									</div>
									<div className="des">
										{__(
											'Connect with other store owners, share tips, and get quick solutions.',
											'multivendorx'
										)}
									</div>
								</div>
							</div>

							<div className="support-item">
								<div className="image">
									<i className="adminfont-wordpress"></i>
								</div>
								<div className="details">
									<div className="name">
										<a
											href="https://wordpress.org/support/plugin/dc-woocommerce-multi-vendor/"
											target="_blank"
											rel="noopener noreferrer"
										>
											{__(
												'WordPress support forum',
												'multivendorx'
											)}
										</a>
									</div>
									<div className="des">
										{__(
											'Ask questions and get expert guidance from the WordPress community.',
											'multivendorx'
										)}
									</div>
								</div>
							</div>

							<div className="support-item">
								<div className="image">
									<i className="adminfont-forum"></i>
								</div>
								<div className="details">
									<div className="name">
										<a
											href="https://multivendorx.com/support-forum/"
											target="_blank"
											rel="noopener noreferrer"
										>
											{__(
												'Our forum',
												'multivendorx'
											)}
										</a>
									</div>
									<div className="des">
										{__(
											'Discuss MultiVendorX features, report issues, and collaborate with other users.',
											'multivendorx'
										)}
									</div>
								</div>
							</div>

							<div className="support-item">
								<div className="image">
									<i className="adminfont-live-chat"></i>
								</div>
								<div className="details">
									<div className="name">
										<a
											href="https://tawk.to/chat/5d2eebf19b94cd38bbe7c9ad/1fsg8cq8n"
											target="_blank"
											rel="noopener noreferrer"
										>
											{__(
												'Live chat',
												'multivendorx'
											)}
										</a>
									</div>
									<div className="des">
										{__(
											'Get real-time support from our team for setup, troubleshooting, and guidance.',
											'multivendorx'
										)}
									</div>
								</div>
							</div>
						</div>
					</Card>
					<Card title="Documentation & Learning">
						<div className="support-wrapper">
							<div className="support-item">
								<div className="image">
									<i className="adminfont-document"></i>
								</div>
								<div className="details">
									<div className="name">
										<a
											href="https://multivendorx.com/docs/knowledgebase/"
											target="_blank"
											rel="noopener noreferrer"
										>
											{__(
												'Official documentation',
												'multivendorx'
											)}
										</a>
									</div>
									<div className="des">
										{__(
											'Step-by-step guides for every MultiVendorX feature.',
											'multivendorx'
										)}
									</div>
								</div>
							</div>

							<div className="support-item">
								<div className="image">
									<i className="adminfont-youtube"></i>
								</div>
								<div className="details">
									<div className="name">
										<a
											href="https://www.youtube.com/@MultiVendorX/videos"
											target="_blank"
											rel="noopener noreferrer"
										>
											{__(
												'YouTube tutorials',
												'multivendorx'
											)}
										</a>
									</div>
									<div className="des">
										{__(
											'Watch videos on marketplace setup, store management, payments, and more.',
											'multivendorx'
										)}
									</div>
								</div>
							</div>

							<div className="support-item">
								<div className="image">
									<i className="adminfont-faq"></i>
								</div>
								<div className="details">
									<div className="name">
										<a
											href="https://multivendorx.com/docs/faqs/"
											target="_blank"
											rel="noopener noreferrer"
										>
											{__('FAQs', 'multivendorx')}
										</a>
									</div>
									<div className="des">
										{__(
											'Quick answers to the most common questions about features and troubleshooting.',
											'multivendorx'
										)}
									</div>
								</div>
							</div>

							<div className="support-item">
								<div className="image">
									<i className="adminfont-coding"></i>
								</div>
								<div className="details">
									<div className="name">
										<a
											href="https://discord.com/channels/1376811097134469191/1376811102020829258"
											target="_blank"
											rel="noopener noreferrer"
										>
											{__(
												'Coding support',
												'multivendorx'
											)}
										</a>
									</div>
									<div className="des">
										{__(
											'Professional help for customizations, integrations, and technical issues.',
											'multivendorx'
										)}
									</div>
								</div>
							</div>
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
									{__(
										'Watch All Tutorials',
										'multivendorx'
									)}
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
