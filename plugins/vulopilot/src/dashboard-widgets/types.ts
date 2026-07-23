/**
 * Shared shapes for the Dashboard's widget system. Kept in one file
 * because every widget component and the registry/grid all need the
 * same two contracts — DashboardSummary (the /dashboard aggregate
 * payload) and WidgetDefinition (what makes a widget registrable).
 */
import React from 'react';

export interface DashboardSummary {
	overall_score: number;
	open_findings: number;
	critical_findings: number;
	active_automations: number;
	ai_jobs_used: number;
	ai_jobs_quota: number;
	category_scores: {
		seo: number;
		performance: number;
		security: number;
		accessibility: number;
		woocommerce: number | null;
	};
	quick_fixes: number;
	pending_approvals: number;
	automation_status: {
		enabled: number;
		disabled: number;
	};
}

export interface WidgetProps {
	summary: DashboardSummary;
	isLoading: boolean;
	/** Removes this widget from the visible grid — DashboardGrid.tsx supplies the real handler, which toggles `enabled: false` in the saved layout. */
	onHide: () => void;
}

/**
 * What a widget registers with the grid. `size` maps to a CSS grid
 * column span (DashboardGrid.tsx) rather than a pixel size, so widgets
 * keep behaving responsively at narrow admin-column widths the same way
 * the rest of the dashboard already does (react-frontend.md/Dashboard.scss's
 * existing `@media (max-width: 782px)` collapse).
 */
export interface WidgetDefinition {
	id: string;
	title: string;
	icon: string;
	size: 'small' | 'medium' | 'large';
	component: React.ComponentType<WidgetProps>;
}

/** One entry in the persisted layout — GET/POST `/dashboard-layout`. */
export interface WidgetLayoutEntry {
	id: string;
	enabled: boolean;
}
