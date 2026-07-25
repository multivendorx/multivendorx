import Overview from './Overview';

/**
 * Renders the redesigned "Website Health" layout (Overview.tsx) — a
 * fixed-section page (hero + pillar chips, tabbed "needs attention",
 * GEO/Brand Visibility spotlight, system status strip, timeline,
 * activity/reports/Pro) with its own collapsed-by-default "Customize
 * dashboard" section-visibility panel, rather than the previous
 * drag-and-drop widget grid (DashboardGrid.tsx/registry.ts) — the new
 * design has no grid/reorder concept, just show/hide. DashboardGrid,
 * registry.ts's widgets, and WelcomeSection.tsx are unchanged and still
 * exist (nothing was deleted), they're just no longer mounted from this
 * page; Overview.tsx reuses WelcomeSection's exported HELP_RESOURCES for
 * its own "Getting started" links rather than duplicating those URLs.
 */
const Dashboard = () => <Overview />;

export default Dashboard;
