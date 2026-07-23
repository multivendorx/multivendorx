window.VULOPILOT_ROUTES = window.VULOPILOT_ROUTES || [];

export const registerVuloPilotRoute = (route: {
	tab: string;
	component: React.ComponentType<Record<string, unknown>>;
}) => {
	window.VULOPILOT_ROUTES.push(route);

	// notify React
	window.dispatchEvent(new Event('vulopilot-routes'));
};

window.registerVuloPilotRoute = registerVuloPilotRoute;
