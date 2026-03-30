const BannerTemplate2 = () => {
	return (
		<div className="multivendorx-banner template2">
			<div className="banner-slider"></div>
			<div className="banner-right">
				<div className="social-profile">
					<a>
						{' '}
						<i className="dashicons dashicons-facebook"></i>
					</a>

					<a>
						<i className="dashicons dashicons-twitter"></i>
					</a>

					<a>
						<i className="dashicons dashicons-instagram"></i>
					</a>

					<a>
						<i className="dashicons dashicons-youtube"></i>
					</a>

					<a>
						<i className="dashicons dashicons-linkedin"></i>
					</a>
				</div>
				<div className="multivendorx-btn-area"></div>
			</div>
			<div className="store-details">
				<div className="profile">
					<div className="placeholder">ST</div>
				</div>

				<div className="details">
					<div className="container">
						<div className="contact-details">
							<div className="store-name">store155</div>
							<div className="row">
								<div className="store-email">
									<i className="dashicons dashicons-email"></i>{' '}
									demo@gmail.com
								</div>
								<div className="store-phone">
									{' '}
									<i className="dashicons dashicons-phone"></i>{' '}
									9874563120
								</div>{' '}
							</div>
							<div className="store-address">
								{' '}
								<i className="dashicons dashicons-location"></i>
								72 East 72nd Street
							</div>{' '}
						</div>
						<div className="right-section">
							<button className="admin-btn btn-purple">
								Support
							</button>
							<button className="admin-btn btn-purple">
								Chat
							</button>
							<div className="follow-wrapper">
								{' '}
								<button className="follow-btn admin-btn btn-purple">
									Unfollow
								</button>{' '}
								<div
									className="follower-count"
									id="followers-count-1"
								>
									1 Follower
								</div>{' '}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BannerTemplate2;
