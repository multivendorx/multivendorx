import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/** The setup checklist's steps. A tab's form reports the ones it saves (see `onProgress`), so ticks follow edits. */
export type SetupStepKey =
	| 'image'
	| 'banner'
	| 'description'
	| 'email'
	| 'phone'
	| 'address'
	| 'payout';

export type SetupProgress = Partial<Record<SetupStepKey, boolean>>;

interface SetupStep {
	key: SetupStepKey;
	label: string;
	/** The tab the field is on. */
	tab: string;
	/** The field's label (or its card's title) as the form shows it: how the step finds the field to scroll to. */
	field: string;
}

/** The store data the checklist reads. */
export interface StoreSetupData {
	image?: string;
	banner?: string;
	description?: string;
	store_email?: { list?: string[] };
	phone?: { phone?: string };
	address?: string;
	city?: string;
	payment_methods?: Record<string, unknown>;
}

interface StoreTabLayoutProps {
	tabId: string;
	data: StoreSetupData;
	/** What a form saved since the data loaded; wins over `data`. */
	progress: SetupProgress;
	openTab: (tabId: string) => void;
	children: ReactNode;
}

interface Section {
	title: string;
	element: HTMLElement;
}

/** A step clicked on another tab: opened there once that tab's form has drawn the field. */
let pendingField: string | null = null;

const prefersReducedMotion = () =>
	window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** WordPress's admin bar plus a little air: where a section's top lands when jumped to. */
const SCROLL_OFFSET = 56;

/**
 * Store page, every tab but the Overview: the tab's cards on the left, and at the right a column that stays in view:
 * the tab's sections (jump to one; the one being read is marked) and the store's setup checklist (each step takes you
 * to its field, on whichever tab it is).
 */
const StoreTabLayout = ({
	tabId,
	data,
	progress,
	openTab,
	children,
}: StoreTabLayoutProps) => {
	const mainRef = useRef<HTMLDivElement>(null);
	const [sections, setSections] = useState<Section[]>([]);
	const [activeSection, setActiveSection] = useState(0);

	const steps: SetupStep[] = [
		{
			key: 'image',
			label: __('Add a logo', 'multivendorx'),
			tab: 'store',
			field: __('Logo', 'multivendorx'),
		},
		{
			key: 'banner',
			label: __('Add a banner', 'multivendorx'),
			tab: 'store',
			field: __('Banner', 'multivendorx'),
		},
		{
			key: 'description',
			label: __('Describe the store', 'multivendorx'),
			tab: 'store',
			field: __('Description', 'multivendorx'),
		},
		{
			key: 'email',
			label: __('Add a contact email', 'multivendorx'),
			tab: 'store',
			field: __('Store email(s)', 'multivendorx'),
		},
		{
			key: 'phone',
			label: __('Add a phone number', 'multivendorx'),
			tab: 'store',
			field: __('Phone', 'multivendorx'),
		},
		{
			key: 'address',
			label: __('Add the business address', 'multivendorx'),
			tab: 'store',
			field: __('Street address', 'multivendorx'),
		},
		{
			key: 'payout',
			label: __('Set up a withdrawal method', 'multivendorx'),
			tab: 'payment',
			field: __('Withdrawal methods', 'multivendorx'),
		},
	];

	const savedState: Record<SetupStepKey, boolean> = {
		image: !!data?.image,
		banner: !!data?.banner,
		description: !!data?.description?.trim(),
		email: !!data?.store_email?.list?.length,
		phone: !!data?.phone?.phone,
		address: !!(data?.address && data?.city),
		payout: Object.keys(data?.payment_methods || {}).length > 0,
	};
	const isDone = (key: SetupStepKey) => progress[key] ?? savedState[key];
	const doneCount = steps.filter((step) => isDone(step.key)).length;

	/** The row (or card) whose label or title reads `label`, in this tab's form. */
	const findField = useCallback((label: string): HTMLElement | null => {
		const titles =
			mainRef.current?.querySelectorAll<HTMLElement>(
				'.settings-form-label .typography-title, .card-header .typography-title'
			) ?? [];
		const title = Array.from(titles).find(
			(node) => node.textContent?.trim() === label
		);

		return (title?.closest('.form-group, .card-content') ??
			null) as HTMLElement | null;
	}, []);

	/** Brings a field into view, marks it for a moment and puts the cursor in it. */
	const revealField = useCallback((field: HTMLElement) => {
		field.scrollIntoView({
			behavior: prefersReducedMotion() ? 'auto' : 'smooth',
			block: 'center',
		});
		field.classList.remove('mvx-field-flash');
		// Restart the animation when the same field is picked twice in a row.
		void field.offsetWidth;
		field.classList.add('mvx-field-flash');
		window.setTimeout(
			() => field.classList.remove('mvx-field-flash'),
			1800
		);
		field
			.querySelector<HTMLElement>(
				'input:not([type="hidden"]), textarea, select, button'
			)
			?.focus({ preventScroll: true });
	}, []);

	const goToStep = (step: SetupStep) => {
		if (step.tab === tabId) {
			const field = findField(step.field);
			if (field) {
				revealField(field);
			}
			return;
		}
		pendingField = step.field;
		openTab(step.tab);
	};

	// The tab's sections, read from its cards. Tabs load their cards after fetching, so this follows the form as it
	// draws; a step picked on another tab is opened here once its field exists.
	useEffect(() => {
		const main = mainRef.current;
		if (!main) {
			return;
		}

		let frame = 0;
		const collect = () => {
			frame = 0;
			const found: Section[] = [];
			main.querySelectorAll<HTMLElement>('.card-content').forEach(
				(card) => {
					const title = card
						.querySelector('.card-header .typography-title')
						?.textContent?.trim();
					if (title) {
						found.push({ title, element: card });
					}
				}
			);
			setSections((previous) =>
				previous.length === found.length &&
				previous.every(
					(section, index) => section.element === found[index].element
				)
					? previous
					: found
			);

			if (pendingField) {
				const field = findField(pendingField);
				if (field) {
					pendingField = null;
					revealField(field);
				}
			}
		};
		const observer = new MutationObserver(() => {
			if (!frame) {
				frame = window.requestAnimationFrame(collect);
			}
		});

		collect();
		observer.observe(main, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
			if (frame) {
				window.cancelAnimationFrame(frame);
			}
		};
	}, [tabId, findField, revealField]);

	// The section being read: the last one whose top has passed under the admin bar, or the last one at the page end.
	useEffect(() => {
		if (sections.length < 2) {
			return;
		}

		let frame = 0;
		const update = () => {
			frame = 0;
			const atEnd =
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 4;
			// A reading line a third of the way down: the section crossing it is the one on screen, even when a
			// field was brought to the middle of the window.
			const readingLine = Math.max(
				SCROLL_OFFSET + 24,
				window.innerHeight / 3
			);
			let current = 0;
			sections.forEach((section, index) => {
				if (
					section.element.getBoundingClientRect().top <= readingLine
				) {
					current = index;
				}
			});
			setActiveSection(atEnd ? sections.length - 1 : current);
		};
		const onScroll = () => {
			if (!frame) {
				frame = window.requestAnimationFrame(update);
			}
		};

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (frame) {
				window.cancelAnimationFrame(frame);
			}
		};
	}, [sections]);

	const jumpTo = (index: number) => {
		const top =
			sections[index].element.getBoundingClientRect().top +
			window.scrollY -
			SCROLL_OFFSET;
		window.scrollTo({
			top,
			behavior: prefersReducedMotion() ? 'auto' : 'smooth',
		});
		setActiveSection(index);
	};

	const percent = Math.round((doneCount / steps.length) * 100);

	return (
		<div className="mvx-store-layout">
			<div className="mvx-store-layout-main" ref={mainRef}>
				{children}
			</div>
			<aside className="mvx-store-aside">
				{sections.length > 1 && (
					<nav
						className="mvx-aside-card mvx-aside-sections"
						aria-label={__('Sections on this tab', 'multivendorx')}
					>
						<h2 className="mvx-aside-title">
							{__('On this tab', 'multivendorx')}
						</h2>
						<ul>
							{sections.map((section, index) => (
								<li key={section.title}>
									<button
										type="button"
										className={
											index === activeSection
												? 'is-active'
												: ''
										}
										aria-current={
											index === activeSection
												? 'location'
												: undefined
										}
										onClick={() => jumpTo(index)}
									>
										{section.title}
									</button>
								</li>
							))}
						</ul>
					</nav>
				)}
				<section className="mvx-aside-card mvx-aside-setup">
					<div className="mvx-aside-setup-head">
						<h2 className="mvx-aside-title">
							{__('Store setup', 'multivendorx')}
						</h2>
						<span className="mvx-aside-count">
							{sprintf(
								/* translators: 1: steps done, 2: all steps. */
								__('%1$s of %2$s', 'multivendorx'),
								doneCount,
								steps.length
							)}
						</span>
					</div>
					<div
						className="mvx-aside-progress"
						role="progressbar"
						aria-valuemin={0}
						aria-valuemax={steps.length}
						aria-valuenow={doneCount}
						aria-label={__('Store setup', 'multivendorx')}
					>
						<span style={{ width: `${percent}%` }} />
					</div>
					{doneCount === steps.length ? (
						<p className="mvx-aside-done">
							<i className="adminfont-check" aria-hidden="true" />
							{__(
								'All set: customers see a complete store.',
								'multivendorx'
							)}
						</p>
					) : (
						<p className="mvx-aside-note">
							{__(
								'A complete store earns more trust from customers.',
								'multivendorx'
							)}
						</p>
					)}
					<ul className="mvx-aside-steps">
						{steps.map((step) => {
							const done = isDone(step.key);
							return (
								<li key={step.key}>
									<button
										type="button"
										className={done ? 'is-done' : ''}
										onClick={() => goToStep(step)}
									>
										<span
											className="mvx-aside-check"
											aria-hidden="true"
										>
											{done && (
												<i className="adminfont-check" />
											)}
										</span>
										<span className="mvx-aside-step-label">
											{step.label}
										</span>
										<span className="screen-reader-text">
											{done
												? __('(done)', 'multivendorx')
												: __('(to do)', 'multivendorx')}
										</span>
										<i
											className="adminfont-arrow-right mvx-aside-go"
											aria-hidden="true"
										/>
									</button>
								</li>
							);
						})}
					</ul>
				</section>
			</aside>
		</div>
	);
};

export default StoreTabLayout;
