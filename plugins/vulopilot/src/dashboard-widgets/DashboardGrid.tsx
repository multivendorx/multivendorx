/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { __ } from '@wordpress/i18n';
import { getApiLink, getApiResponse, sendApiResponse } from '@zyra/core';
import { DEFAULT_DASHBOARD_WIDGETS } from './registry';
import { DashboardSummary, WidgetLayoutEntry } from './types';
import './DashboardGrid.scss';

interface DashboardGridProps {
	summary: DashboardSummary;
	isLoading: boolean;
}

/** What ReactSortable actually needs on every list item — see react-sortablejs's own usage in PanelEditor.tsx (Zyra's builders package) for this exact `list`/`setList` shape. */
interface SortableEntry extends WidgetLayoutEntry {
	key: string;
}

const WIDGETS_BY_ID = new Map(
	DEFAULT_DASHBOARD_WIDGETS.map((widget) => [widget.id, widget])
);

/**
 * The drag-and-drop widget grid — fetches the current user's saved
 * layout (`/dashboard-layout`, per-user meta, see
 * Controllers/DashboardLayout.php's docblock for why it's user meta and
 * not a site-wide setting), renders each enabled widget in saved order,
 * and persists a new order back whenever the user drags a widget.
 *
 * Uses `react-sortablejs`'s `ReactSortable` — not a new drag-and-drop
 * dependency: it's already a peer dependency of `@multivendorx/zyra` and
 * is the exact primitive Zyra's own builders package
 * (`PanelEditor.tsx`) uses for its drag-and-drop block canvas, so this
 * follows the dominant drag-and-drop pattern already established in this
 * monorepo rather than introducing a different library.
 */
const DashboardGrid: React.FC<DashboardGridProps> = ({
	summary,
	isLoading,
}) => {
	const [layout, setLayout] = useState<WidgetLayoutEntry[]>([]);
	const [isLayoutLoading, setIsLayoutLoading] = useState(true);

	useEffect(() => {
		getApiResponse<WidgetLayoutEntry[]>(
			getApiLink(appLocalizer, 'dashboard-layout'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		)
			.then((response) => {
				if (response) {
					setLayout(response);
				}
			})
			.finally(() => setIsLayoutLoading(false));
	}, []);

	const persistLayout = (nextLayout: WidgetLayoutEntry[]) => {
		setLayout(nextLayout);
		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, 'dashboard-layout'),
			{ widgets: nextLayout }
		);
	};

	const handleHide = (id: string) => {
		persistLayout(
			layout.map((entry) =>
				entry.id === id ? { ...entry, enabled: false } : entry
			)
		);
	};

	const handleRestore = (id: string) => {
		persistLayout(
			layout.map((entry) =>
				entry.id === id ? { ...entry, enabled: true } : entry
			)
		);
	};

	const handleReorder = (newVisibleOrder: SortableEntry[]) => {
		const hidden = layout.filter((entry) => !entry.enabled);
		persistLayout([
			...newVisibleOrder.map(({ id, enabled }) => ({ id, enabled })),
			...hidden,
		]);
	};

	if (isLoading || isLayoutLoading) {
		return (
			<div className="dashboard-widget-grid">
				{DEFAULT_DASHBOARD_WIDGETS.slice(0, 4).map((widget) => {
					const Widget = widget.component;
					return (
						<div
							key={widget.id}
							className={`dashboard-widget-cell size-${widget.size}`}
						>
							<Widget
								summary={summary}
								isLoading
								onHide={() => {}}
							/>
						</div>
					);
				})}
			</div>
		);
	}

	const visible: SortableEntry[] = layout
		.filter((entry) => entry.enabled && WIDGETS_BY_ID.has(entry.id))
		.map((entry) => ({ ...entry, key: entry.id }));

	const hidden = layout.filter(
		(entry) => !entry.enabled && WIDGETS_BY_ID.has(entry.id)
	);

	return (
		<>
			<ReactSortable
				list={visible}
				setList={handleReorder}
				handle=".widget-drag-handle"
				animation={150}
				className="dashboard-widget-grid"
			>
				{visible.map((entry) => {
					const widget = WIDGETS_BY_ID.get(entry.id);
					if (!widget) {
						return null;
					}
					const Widget = widget.component;
					return (
						<div
							key={widget.id}
							className={`dashboard-widget-cell size-${widget.size}`}
						>
							<Widget
								summary={summary}
								isLoading={isLoading}
								onHide={() => handleHide(widget.id)}
							/>
						</div>
					);
				})}
			</ReactSortable>

			{hidden.length > 0 && (
				<div className="dashboard-hidden-widgets">
					<span className="dashboard-hidden-widgets-label">
						{__('Hidden widgets:', 'vulopilot')}
					</span>
					{hidden.map((entry) => {
						const widget = WIDGETS_BY_ID.get(entry.id);
						if (!widget) {
							return null;
						}
						return (
							<button
								key={widget.id}
								type="button"
								className="admin-badge dashboard-hidden-widget-chip"
								onClick={() => handleRestore(widget.id)}
							>
								<i className="adminfont-plus" />
								{widget.title}
							</button>
						);
					})}
				</div>
			)}
		</>
	);
};

export default DashboardGrid;
