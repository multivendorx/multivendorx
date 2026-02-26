import { Suspense } from 'react';
import { Routes, Route, Navigate, MemoryRouter } from 'react-router-dom';
import Dashboard from './storeDashboard';

/**
 * Resolves the initial route for plain permalink mode from query params.
 *
 * Example plain URL:
 *   /?page_id=10&segment=products&element=edit&context_id=123
 * Maps to MemoryRouter initialEntries:
 *   ["/products/edit/123"]
 */
const getPlainPermalinkInitialPath = (): string => {
	const params = new URLSearchParams(window.location.search);
	const segment    = params.get('segment')    || 'dashboard';
	const element    = params.get('element')    || '';
	const context_id = params.get('context_id') || '';

	let path = `/${segment}`;
	if (element)    path += `/${element}`;
	if (context_id) path += `/${context_id}`;
	return path;
};

/**
 * The shared route tree used in both permalink modes.
 * Dashboard reads :tab, :element, :context_id from useParams().
 */
const AppRoutes = () => (
	<Suspense fallback={<div>Loading...</div>}>
		<Routes>
			{/* Redirect bare root to /dashboard */}
			<Route path="/" element={<Navigate to="/dashboard" replace />} />

			{/* All tab variations */}
			<Route path="/:tab"                          element={<Dashboard />} />
			<Route path="/:tab/:element"                 element={<Dashboard />} />
			<Route path="/:tab/:element/:context_id"     element={<Dashboard />} />

			{/* Catch-all */}
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	</Suspense>
);

/**
 * DashboardRoutes
 *
 * Pretty permalinks  → rendered inside <BrowserRouter> from index.tsx, so just export AppRoutes.
 * Plain permalinks   → rendered without a Router; we wrap in <MemoryRouter> here so navigation
 *                      works in-memory while URL bar stays as the WP query-param URL.
 */
const DashboardRoutes = () => {
	if (appLocalizer.permalink_structure) {
		// BrowserRouter is already provided by index.tsx
		return <AppRoutes />;
	}

	// Plain permalink: seed MemoryRouter with the current segment from query params
	const initialPath = getPlainPermalinkInitialPath();

	return (
		<MemoryRouter initialEntries={[initialPath]} initialIndex={0}>
			<AppRoutes />
		</MemoryRouter>
	);
};

export default DashboardRoutes;