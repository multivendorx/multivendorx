/* global appLocalizer */
import { useEffect, useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { TourComponent } from '@zyra/components';

interface TourStep {
	selector: string;
	/** reactour's side of the target for the popover. */
	position: 'top' | 'right' | 'bottom' | 'left';
	title: string;
	description: string;
	/** Where "Next" goes. A link to the screen already open moves to `step` in place. */
	next?: {
		link: string;
		step: number;
	};
}

/**
 * zyra's tour keeps the step to resume on in this sessionStorage key while "Next" navigates (TourComponent's
 * GuidedTourController); it clears it when the tour ends.
 */
const RESUME_STEP_KEY = 'guided_tour_step';

/** How long to wait for the next step's element after the screen changes, in milliseconds. */
const TARGET_WAIT_MS = 5000;

/**
 * zyra's popover styles, without reactour's slide: a restarted tour measures its target a moment after it mounts, so
 * the slide carried the popover across the screen from the top-left corner. It now appears at its target, and
 * `.tour-content` in admin.scss fades it in to cover that first unmeasured frame.
 */
const POPOVER_STYLES = {
	popover: (base: Record<string, unknown>) => ({
		...base,
		padding: '1.125rem',
		borderRadius: '0.313rem',
		transition: 'none',
	}),
};

/** A screen of the CatalogX admin page (every screen is a `#&tab=…` hash of admin.php?page=catalogx). */
const screen = (hash: string) => `${appLocalizer.admin_url}#&${hash}`;

/**
 * The guided tour, in screen order so it changes screen only twice: the dashboard, then the Enquiry and Quote module
 * switches (Settings → Modules), then who may send enquiries and request quotes (Settings → Customer Engagement).
 */
const buildSteps = (): TourStep[] => {
	const modules = screen('tab=settings&subtab=modules');
	const engagement = screen('tab=settings&subtab=customer-engagement');

	return [
		{
			selector: '.admin-main-wrapper > .title-section',
			position: 'bottom',
			title: __('Your CatalogX dashboard', 'catalogx'),
			description: __(
				'New enquiries, open quote requests and quote value at a glance, plus anything waiting on your reply. Next, pick the features your store uses.',
				'catalogx'
			),
			next: { link: modules, step: 1 },
		},
		{
			selector: '[data-tour="enquiry-showcase-tour"]',
			position: 'bottom',
			title: __('Enquiry & Communication', 'catalogx'),
			description: __(
				'Adds an enquiry button to product pages, so shoppers can ask about a product before they buy. Switch it on or off here; the gear opens its settings.',
				'catalogx'
			),
			next: { link: modules, step: 2 },
		},
		{
			selector: '[data-tour="quote-showcase-tour"]',
			position: 'bottom',
			title: __('Quotation', 'catalogx'),
			description: __(
				'Lets shoppers ask for a price on one or more products. Each request lands in Quotation Requests, where you reply with a quote.',
				'catalogx'
			),
			next: { link: engagement, step: 3 },
		},
		{
			selector: '.form-group:has(.settings-form-label[for="enquiry_user_permission"])',
			position: 'bottom',
			title: __('Who can submit enquiries', 'catalogx'),
			description: __(
				'Let every visitor send an enquiry, or only logged-in customers. Logged in only cuts spam and ties each enquiry to a customer account.',
				'catalogx'
			),
			next: { link: engagement, step: 4 },
		},
		{
			selector: '.form-group:has(.settings-form-label[for="quote_user_permission"])',
			position: 'bottom',
			title: __('Who can request quotations', 'catalogx'),
			description: __(
				'The same choice for quote requests: everyone, or logged-in users only. Changes save automatically, so you’re set up. Finish the tour to start taking enquiries and quotes.',
				'catalogx'
			),
		},
	];
};

/**
 * Resolves once `selector` is on the page, or after `TARGET_WAIT_MS` (false) if the screen never shows it.
 */
const waitForElement = (selector: string): Promise<boolean> =>
	new Promise((resolve) => {
		const startedAt = Date.now();
		const check = () => {
			if (document.querySelector(selector)) {
				resolve(true);
			} else if (Date.now() - startedAt > TARGET_WAIT_MS) {
				resolve(false);
			} else {
				window.setTimeout(check, 100);
			}
		};
		check();
	});

/**
 * zyra's TourComponent, made to follow CatalogX's hash screens.
 *
 * "Next" to another screen stores the next step and sets `window.location.href`. On this page the screens differ only
 * in the hash, so that changes the screen without reloading, and the tour, which only reads the stored step when it
 * starts, stayed on the old step pointing at nothing until "Next" was pressed again. Here the tour is taken down when
 * the hash changes and restarted (a new `key`) once the stored step's element is on screen, so it resumes on that
 * step. Steps are built once: a new array each render would make zyra restart the tour.
 */
const GuidedTour = () => {
	const steps = useMemo(buildSteps, []);
	const [restartCount, setRestartCount] = useState(0);
	const [switchingScreen, setSwitchingScreen] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const resumeAfterNavigation = async () => {
			const storedStep = Number(sessionStorage.getItem(RESUME_STEP_KEY));
			const step = steps[storedStep];

			// Not mid-tour (no stored step), or a hash change the tour didn't make: leave the tour as it is.
			if (!storedStep || !step) {
				return;
			}

			// Take the previous step's popover down at once, so it doesn't sit over the new screen pointing at nothing.
			setSwitchingScreen(true);
			await waitForElement(step.selector);

			if (!cancelled) {
				setRestartCount((count) => count + 1);
				setSwitchingScreen(false);
			}
		};

		window.addEventListener('hashchange', resumeAfterNavigation);

		return () => {
			cancelled = true;
			window.removeEventListener('hashchange', resumeAfterNavigation);
		};
	}, [steps]);

	if (switchingScreen) {
		return null;
	}

	return (
		<TourComponent
			key={restartCount}
			appLocalizer={appLocalizer}
			steps={steps}
			styles={POPOVER_STYLES}
			labels={{
				endTour: __('End tour', 'catalogx'),
				next: __('Next', 'catalogx'),
				finishTour: __('Finish tour', 'catalogx'),
			}}
		/>
	);
};

export default GuidedTour;
