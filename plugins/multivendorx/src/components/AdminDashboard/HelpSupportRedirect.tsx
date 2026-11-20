import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Help & Support is a card on the dashboard Overview now. A link to its old screen (`#&tab=help-support`, bookmarks,
 * docs, other plugins) opens the dashboard, which scrolls to the card (`&view=help-support`, see Insights.tsx).
 */
const HelpSupportRedirect = () => {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		navigate(
			`${location.pathname}${location.search}#&tab=dashboard&view=help-support`,
			{ replace: true }
		);
	}, [location, navigate]);

	return null;
};

export default HelpSupportRedirect;
