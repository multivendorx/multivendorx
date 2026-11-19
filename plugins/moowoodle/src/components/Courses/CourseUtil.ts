import type { CourseRow } from './Courses';

/**
 * Sample courses for the Courses screen before the first sync: drawn, dimmed and inert, behind the "sync your
 * courses" card, so a new site sees what the screen will hold. Made-up data; never sent anywhere.
 */
export const sampleCourses: CourseRow[] = [
	{
		id: 1,
		course_name: 'Web Development Beginners',
		course_short_name: 'WEB101',
		category_name: 'Development',
		date: 'Jan 15, 2026 – Apr 15, 2026',
		product_name: 'Web Development Course',
		enrolled_user: 18,
	},
	{
		id: 2,
		course_name: 'Digital Marketing Essentials',
		course_short_name: 'MKT201',
		category_name: 'Marketing',
		date: 'Feb 1, 2026 – May 1, 2026',
		product_name: 'Digital Marketing Bundle',
		enrolled_user: 25,
	},
	{
		id: 3,
		course_name: 'Introduction to Data Science',
		course_short_name: 'DS110',
		category_name: 'Data',
		date: 'Mar 3, 2026 – Jun 30, 2026',
		enrolled_user: 0,
	},
	{
		id: 4,
		course_name: 'Graphic Design Fundamentals',
		course_short_name: 'DES150',
		category_name: 'Design',
		date: 'Mar 20, 2026 – Jul 20, 2026',
		product_name: 'Graphic Design Masterclass',
		enrolled_user: 12,
	},
];
