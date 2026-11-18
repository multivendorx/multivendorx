import { createRoot } from '@wordpress/element';
import MyCourse from './MyCourse';

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('moowoodle-my-course');
	if (container) {
		createRoot(container).render(<MyCourse />);
	}
});
