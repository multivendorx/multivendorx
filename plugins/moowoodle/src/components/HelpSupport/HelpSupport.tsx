/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';

import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import './help-support.scss';

interface HelpLink {
	icon: string;
	title: string;
	description: string;
	/** Absolute URL (opens in a new tab), or `#&tab=…` for a screen of this admin page. */
	link: string;
	/** The card's call to action ("Read the docs"). List rows don't show one. */
	cta?: string;
}

const UTM =
	'utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle';

/** The three self-serve resources, shown as cards across the top. */
const RESOURCES: HelpLink[] = [
	{
		icon: 'knowledgebase',
		title: __('Documentation', 'moowoodle'),
		description: __(
			'Step-by-step guides for connecting Moodle™, syncing courses and enrolling students.',
			'moowoodle'
		),
		link: 'https://dualcube.com/docs/knowledgebase/?utm_source=settings&utm_medium=plugin&utm_campaign=track',
		cta: __('Read the docs', 'moowoodle'),
	},
	{
		icon: 'youtube',
		title: __('Video tutorials', 'moowoodle'),
		description: __(
			'Watch MooWoodle being set up, from the Moodle™ token to the first enrollment.',
			'moowoodle'
		),
		link: 'https://www.youtube.com/@moowoodle/videos',
		cta: __('Watch on YouTube', 'moowoodle'),
	},
	{
		icon: 'forum',
		title: __('Community forum', 'moowoodle'),
		description: __(
			'Ask a question on WordPress.org and get answers from our team and other users.',
			'moowoodle'
		),
		link: 'https://wordpress.org/support/plugin/moowoodle/',
		cta: __('Visit the forum', 'moowoodle'),
	},
];

/** Most problems are a broken connection or a failed sync: the two screens that show which. */
const TROUBLESHOOTING: HelpLink[] = [
	{
		icon: 'centralized-connections',
		title: __('Test the Moodle™ connection', 'moowoodle'),
		description: __(
			'Checks the site URL, the access token and each web service function MooWoodle needs.',
			'moowoodle'
		),
		link: '#&tab=settings&subtab=connection-access',
	},
	{
		icon: 'report',
		title: __('Check the logs', 'moowoodle'),
		description: __(
			'Every request to Moodle™ and its error, if it failed. Attach them when you contact support.',
			'moowoodle'
		),
		link: '#&tab=settings&subtab=system-logs',
	},
];

/** Ways to reach the team. Manage plan only applies once there is a plan. */
const CONTACT: HelpLink[] = [
	{
		icon: 'customer-support',
		title: __('Contact support', 'moowoodle'),
		description: __(
			'Send our team a ticket and get a reply by email.',
			'moowoodle'
		),
		link: `https://dualcube.com/contact-us/?${UTM}`,
	},
	{
		icon: 'coding',
		title: __('Custom development', 'moowoodle'),
		description: __(
			'Need MooWoodle to do something it doesn’t? We build tailored features for eLearning sites.',
			'moowoodle'
		),
		link: `https://dualcube.com/custom-development/?${UTM}`,
	},
	...(appLocalizer.khali_dabba
		? [
				{
					icon: 'person',
					title: __('Manage plan', 'moowoodle'),
					description: __(
						'Download MooWoodle Pro, manage license keys and renew your plan.',
						'moowoodle'
					),
					link: `https://dualcube.com/my-account/?${UTM}`,
				},
			]
		: []),
];

/** Opens an external page in a new tab; a `#&tab=` link stays on this admin page. */
const linkProps = (link: string) =>
	link.startsWith('#')
		? {}
		: { target: '_blank', rel: 'noopener noreferrer' };

const NewTabNote = ({ link }: { link: string }) =>
	link.startsWith('#') ? null : (
		<span className="screen-reader-text">
			{__('(opens in a new tab)', 'moowoodle')}
		</span>
	);

/** One row of a list card: icon, title and description, the whole row a link. */
const HelpRow = ({ item }: { item: HelpLink }) => (
	<li>
		<a className="mw-help-row" href={item.link} {...linkProps(item.link)}>
			<span className="mw-help-icon" aria-hidden="true">
				<i className={`adminfont-${item.icon}`} />
			</span>
			<span className="mw-help-row-text">
				<strong>{item.title}</strong>
				<span>{item.description}</span>
			</span>
			<i
				className={`mw-help-arrow adminfont-${item.link.startsWith('#') ? 'arrow-right' : 'external'}`}
				aria-hidden="true"
			/>
			<NewTabNote link={item.link} />
		</a>
	</li>
);

interface HelpSupportProps {
	/**
	 * Drawn inside Settings → Help & Support, whose navigator already prints the page title: skip this screen's own
	 * header.
	 */
	embedded?: boolean;
}

/**
 * Help & Support: the three self-serve resources as cards, then the two troubleshooting screens and the ways to reach
 * the team. Every card and row is one link, so the whole area is clickable, not just the title.
 */
const HelpSupport: React.FC<HelpSupportProps> = ({ embedded = false }) => (
	<>
		{!embedded && (
			<NavigatorHeaderComponent
				headerIcon="customer-support"
				headerTitle={__('Help & Support', 'moowoodle')}
				headerDescription={__(
					'Guides, videos and the people behind MooWoodle, all in one place.',
					'moowoodle'
				)}
			/>
		)}

		<ContainerComponent general>
			<ColumnComponent>
				<div className="mw-help">
					<ul className="mw-help-resources">
						{RESOURCES.map((item) => (
							<li key={item.title}>
								<a
									className="mw-help-card"
									href={item.link}
									{...linkProps(item.link)}
								>
									<span
										className="mw-help-icon is-large"
										aria-hidden="true"
									>
										<i
											className={`adminfont-${item.icon}`}
										/>
									</span>
									<strong>{item.title}</strong>
									<span className="mw-help-card-desc">
										{item.description}
									</span>
									<span className="mw-help-card-cta">
										{item.cta}
										<i
											className="adminfont-external"
											aria-hidden="true"
										/>
									</span>
									<NewTabNote link={item.link} />
								</a>
							</li>
						))}
					</ul>

					<div className="mw-help-columns">
						<section className="mw-help-panel">
							<h2>{__('Troubleshoot first', 'moowoodle')}</h2>
							<p>
								{__(
									'Most problems are a broken connection or a failed sync. These two screens show which.',
									'moowoodle'
								)}
							</p>
							<ul className="mw-help-list">
								{TROUBLESHOOTING.map((item) => (
									<HelpRow key={item.title} item={item} />
								))}
							</ul>
						</section>

						<section className="mw-help-panel">
							<h2>{__('Talk to our team', 'moowoodle')}</h2>
							<p>
								{__(
									'Still stuck, or need something built? We are a message away.',
									'moowoodle'
								)}
							</p>
							<ul className="mw-help-list">
								{CONTACT.map((item) => (
									<HelpRow key={item.title} item={item} />
								))}
							</ul>
						</section>
					</div>
				</div>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default HelpSupport;
