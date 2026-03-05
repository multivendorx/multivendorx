import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ColorPalette,
	ToggleControl,
	BaseControl,
} from '@wordpress/components';

const FacebookIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="100%"
		height="100%"
	>
		<path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
	</svg>
);

const TwitterIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="100%"
		height="100%"
	>
		<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
	</svg>
);

const InstagramIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="100%"
		height="100%"
	>
		<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
	</svg>
);

const YouTubeIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="100%"
		height="100%"
	>
		<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
	</svg>
);

const LinkedInIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="100%"
		height="100%"
	>
		<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
	</svg>
);
const PinterestIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="100%"
		height="100%"
	>
		<path d="M12 0c-6.627 0-12 5.373-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.27 1.041-1.009 2.348-1.503 3.146.9.279 1.855.432 2.851.432 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
	</svg>
);

const iconColors = {
	facebook: '#1877f2',
	twitter: '#1da1f2',
	instagram: '#e4405f',
	youtube: '#ff0000',
	linkedin: '#0077b5',
};

registerBlockType('multivendorx/store-social-icons', {
	edit: ({ attributes, setAttributes }) => {
		const {
			iconSize,
			iconColor,
			iconGap,
			align,
			useThemeColors = true,
		} = attributes;

		// Set block props with alignment
		const blockProps = useBlockProps({
			style: {
				display: 'flex',
				gap: `${iconGap}px`,
				alignItems: 'center',
				justifyContent:
					align === 'left'
						? 'flex-start'
						: align === 'right'
							? 'flex-end'
							: 'center',
			},
		});

		// Get background color based on settings
		const getBackgroundColor = (platform) => {
			if (useThemeColors && iconColors[platform]) {
				return iconColors[platform];
			}
			return iconColor || '#666666';
		};

		const iconContainerStyle = (platform) => ({
			width: `${iconSize}px`,
			height: `${iconSize}px`,
			borderRadius: '50%',
			backgroundColor: getBackgroundColor(platform),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			color: '#ffffff',
			padding: '0.4%',
		});

		return (
			<>
				<BlockControls>
					<AlignmentToolbar
						value={align}
						onChange={(newAlign) =>
							setAttributes({ align: newAlign })
						}
					/>
				</BlockControls>

				<InspectorControls>
					<PanelBody
						title={__('Icon Settings', 'multivendorx')}
						initialOpen={true}
					>
						<RangeControl
							label={__('Icon Size', 'multivendorx')}
							value={iconSize}
							onChange={(value) =>
								setAttributes({ iconSize: value })
							}
							min={20}
							max={100}
							step={5}
						/>

						<RangeControl
							label={__('Icon Gap', 'multivendorx')}
							value={iconGap}
							onChange={(value) =>
								setAttributes({ iconGap: value })
							}
							min={5}
							max={50}
							step={5}
						/>

						<ToggleControl
							label={__('Use Theme Colors', 'multivendorx')}
							checked={useThemeColors}
							onChange={() =>
								setAttributes({
									useThemeColors: !useThemeColors,
								})
							}
							help={
								useThemeColors
									? __(
										'Using platform-specific colors',
										'multivendorx'
									)
									: __('Using custom color', 'multivendorx')
							}
						/>

						{!useThemeColors && (
							<BaseControl>
								<BaseControl.VisualLabel>
									{__('Custom Color', 'multivendorx')}
								</BaseControl.VisualLabel>
								<ColorPalette
									value={iconColor}
									onChange={(color) =>
										setAttributes({ iconColor: color })
									}
									clearable={false}
								/>
							</BaseControl>
						)}
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					{/* Facebook Icon */}
					<div style={iconContainerStyle('facebook')}>
						<FacebookIcon />
					</div>

					{/* Twitter Icon */}
					<div style={iconContainerStyle('twitter')}>
						<TwitterIcon />
					</div>

					{/* Instagram Icon */}
					<div style={iconContainerStyle('instagram')}>
						<InstagramIcon />
					</div>

					{/* YouTube Icon */}
					<div style={iconContainerStyle('youtube')}>
						<YouTubeIcon />
					</div>

					{/* LinkedIn Icon */}
					<div style={iconContainerStyle('linkedin')}>
						<LinkedInIcon />
					</div>

					{/* PinterestIcon Icon */}
					<div style={iconContainerStyle('linkedin')}>
						<PinterestIcon />
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const {
			iconSize,
			iconColor,
			iconGap,
			align,
			useThemeColors = true,
		} = attributes;

		// Set block props with alignment
		const blockProps = useBlockProps.save({
			style: {
				display: 'flex',
				gap: `${iconGap}px`,
				alignItems: 'center',
				justifyContent:
					align === 'left'
						? 'flex-start'
						: align === 'right'
							? 'flex-end'
							: 'center',
			},
		});

		// Get background color based on settings
		const getBackgroundColor = (platform) => {
			if (useThemeColors && iconColors[platform]) {
				return iconColors[platform];
			}
			return iconColor || '#666666';
		};

		const iconLinkStyle = (platform) => ({
			width: `${iconSize}px`,
			height: `${iconSize}px`,
			borderRadius: '50%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			textDecoration: 'none',
			transition: 'all 0.3s ease',
			padding: '0.4%',
		});

		return (
			<div {...blockProps}>
				<ul className="wp-block-social-links is-layout-flex wp-block-social-links-is-layout-flex">
					{/* Facebook Icon */}
					<li className="wp-social-link wp-social-link-facebook  wp-block-social-link">
						<a
							href="#"
							className="wp-block-social-link-anchor"
							style={iconLinkStyle('facebook')}
						>
							<FacebookIcon />
						</a>
					</li>

					{/* Twitter Icon */}
					<li className="wp-social-link wp-social-link-x  wp-block-social-linkk">
						<a
							href="#"
							className="wp-block-social-link-anchor"
							style={iconLinkStyle('twitter')}
						>
							<TwitterIcon />
						</a>
					</li>

					{/* Instagram Icon */}
					<li className="wp-social-link wp-social-link-instagram  wp-block-social-linkwp-social-link wp-social-link-x  wp-block-social-link">
						<a
							href="#"
							className="wp-block-social-link-anchor"
							style={iconLinkStyle('instagram')}
						>
							<InstagramIcon />
						</a>
					</li>

					{/* YouTube Icon */}
					<li className="wp-social-link wp-social-link-youtube  wp-block-social-link">
						<a
							href="#"
							className="wp-block-social-link-anchor"
							style={iconLinkStyle('youtube')}
						>
							<YouTubeIcon />
						</a>
					</li>
					{/* LinkedIn Icon */}
					<li className="wp-social-link wp-social-link-linkedin  wp-block-social-link">
						<a
							href="#"
							className="wp-block-social-link-anchor"
							style={iconLinkStyle('linkedin')}
						>
							<LinkedInIcon />
						</a>
					</li>
					{/* PinterestIcon Icon */}
					<li className="wp-social-link wp-social-link-linkedin  wp-block-social-link">
						<a
							href="#"
							className="wp-block-social-link-anchor"
							style={iconLinkStyle('linkedin')}
						>
							<PinterestIcon />
						</a>
					</li>
				</ul>
			</div>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
	if (!window.StoreInfo?.storeDetails) {
		return;
	}

	const { facebook, twitter, instagram, youtube, linkedin, pinterest } =
		StoreInfo.storeDetails;

	const map = {
		facebook,
		twitter,
		instagram,
		youtube,
		linkedin,
		pinterest,
	};

	Object.entries(map).forEach(([key, url]) => {
		document
			.querySelectorAll(`.multivendorx-social-${key}`)
			.forEach((el) => {
				if (url) {
					el.href = url;
					el.target = '_blank';
					el.rel = 'noopener noreferrer';
					el.style.display = '';
				} else {
					el.style.display = 'none';
				}
			});
	});
});