import React from 'react';
import { __ } from '@wordpress/i18n';
import { CardComponent } from '@zyra/components';

interface DashboardWidgetProps {
	title: string;
	icon: string;
	isLoading?: boolean;
	onHide: () => void;
	children: React.ReactNode;
}

/**
 * The one reusable shell every dashboard widget renders inside — wraps
 * Zyra's CardComponent (react-frontend.md: build UI from the shared zyra
 * package, not raw elements) and adds the two things every widget needs
 * beyond a plain card: a `.widget-drag-handle` element for
 * DashboardGrid.tsx's ReactSortable `handle` option (so dragging only
 * starts from this handle, not from a click anywhere on the widget), and
 * a "hide" control that writes back into the saved layout instead of
 * unmounting silently.
 *
 * The widget's icon is composed into `title` (rather than passed as
 * CardComponent's own `iconName` prop) because CardComponent only renders
 * `iconName` when no `action` is supplied — every widget here has an
 * `action` (the drag/hide controls), so `iconName` would silently never
 * render.
 *
 * Every widget's own component (StatWidget, HealthTimelineWidget, etc.)
 * only implements what's inside `children` — the header, loading
 * skeleton, and drag/hide affordances are never re-implemented per
 * widget.
 */
const DashboardWidget: React.FC<DashboardWidgetProps> = ({
	title,
	icon,
	isLoading,
	onHide,
	children,
}) => {
	return (
		<CardComponent
			className="dashboard-widget"
			title={
				<span className="dashboard-widget-title">
					<i className={`adminfont-${icon}`} />
					{title}
				</span>
			}
			isLoading={isLoading}
			action={
				<div className="dashboard-widget-controls">
					<i
						className="adminfont-move widget-drag-handle"
						title={__('Drag to reorder', 'vulopilot')}
					/>
					<i
						className="adminfont-close"
						title={__('Hide widget', 'vulopilot')}
						role="button"
						tabIndex={0}
						onClick={onHide}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								onHide();
							}
						}}
					/>
				</div>
			}
		>
			{children}
		</CardComponent>
	);
};

export default DashboardWidget;
