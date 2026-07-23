import React from 'react';
import { AnalyticsComponent, ModuleGuardComponent } from '@zyra/components';
import DashboardWidget from './DashboardWidget';
import { DashboardSummary, WidgetProps } from './types';

export interface StatWidgetConfig {
	id: string;
	title: string;
	icon: string;
	/* eslint-disable no-unused-vars -- named params on a type-only interface signature; base no-unused-vars doesn't recognize TS call-signature parameters, only @typescript-eslint/no-unused-vars (which does, via argsIgnorePattern) is meant to check these */
	/** Reads this widget's headline number out of the shared /dashboard summary payload. */
	getNumber: (summary: DashboardSummary) => React.ReactNode;
	/** Optional secondary line under the number (e.g. "3 critical", "2 open issues"). */
	getExtra?: (summary: DashboardSummary) => React.ReactNode;
	/**
	 * When present and returns a value, the widget shows this empty state
	 * instead of a number — used by the WooCommerce widget when
	 * WooCommerce isn't active (category_scores.woocommerce is null),
	 * rather than showing a misleading "0" score for a category that
	 * doesn't apply to this site.
	 */
	getUnavailableState?: (
		summary: DashboardSummary
	) => { title: string; desc: string } | null;
	/* eslint-enable no-unused-vars */
}

interface StatWidgetProps {
	config: StatWidgetConfig;
	summary: DashboardSummary;
	isLoading: boolean;
	onHide: () => void;
}

/**
 * Binds a StatWidgetConfig into a component matching WidgetDefinition's
 * `React.ComponentType<WidgetProps>` shape — what registry.ts registers
 * each of the seven stat widgets as, so DashboardGrid never needs to know
 * a widget is config-driven versus its own standalone component (a
 * HealthTimelineWidget or PendingApprovalWidget looks identical to the
 * grid).
 */
export const createStatWidgetComponent = (
	config: StatWidgetConfig
): React.FC<WidgetProps> => {
	const Component: React.FC<WidgetProps> = ({
		summary,
		isLoading,
		onHide,
	}) => (
		<StatWidget
			config={config}
			summary={summary}
			isLoading={isLoading}
			onHide={onHide}
		/>
	);
	Component.displayName = `StatWidget(${config.id})`;
	return Component;
};

/**
 * Config-driven stat tile — the same declarative-config-over-hand-built-JSX
 * approach react-frontend.md documents for Settings screens, applied here
 * to the seven dashboard widgets that are all "one number + one label"
 * (Overall Health, SEO, Performance, Security, Accessibility, WooCommerce,
 * AI Usage): one component reads a StatWidgetConfig instead of seven
 * near-identical component files.
 */
const StatWidget: React.FC<StatWidgetProps> = ({
	config,
	summary,
	isLoading,
	onHide,
}) => {
	const unavailable = config.getUnavailableState?.(summary);

	return (
		<DashboardWidget
			title={config.title}
			icon={config.icon}
			isLoading={isLoading}
			onHide={onHide}
		>
			{unavailable ? (
				<ModuleGuardComponent
					icon={config.icon}
					title={unavailable.title}
					desc={unavailable.desc}
				/>
			) : (
				<AnalyticsComponent
					variant="dashboard"
					cols={1}
					isLoading={isLoading}
					data={[
						{
							icon: config.icon,
							number: config.getNumber(summary),
							text: config.title,
							extra: config.getExtra?.(summary),
						},
					]}
				/>
			)}
		</DashboardWidget>
	);
};

export default StatWidget;
