import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Status & Tools is a folder of Settings now. A link to its old screen (`#&tab=status-tools&subtab=log`, bookmarks,
 * docs, other plugins) opens the same tab under Settings; without a subtab, System Status.
 */
const StatusAndToolsRedirect = () => {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const subtab =
			new URLSearchParams(location.hash.substring(1)).get('subtab') ||
			'system-status';

		navigate(
			`${location.pathname}${location.search}#&tab=settings&subtab=${subtab}`,
			{ replace: true }
		);
	}, [location, navigate]);

	return null;
};

export default StatusAndToolsRedirect;
