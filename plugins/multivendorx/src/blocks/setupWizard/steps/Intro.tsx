import React, { useState } from 'react';

interface Task {
	title: string;
	description?: string;
	completed: boolean;
	actionText: string;
}

interface Section {
	title: string;
	steps: Task[];
}

const sectionsData: Section[] = [
	{
		title: 'Set Up The Basics',
		steps: [
			{
				title: 'Set Site Title & Tagline',
				description: 'Give your site a name and tagline.',
				completed: true,
				actionText: 'Set Up',
			},
			{
				title: 'Review Admin Email',
				description: 'Ensure your admin email is correct.',
				completed: false,
				actionText: 'Review',
			},
			{
				title: 'Choose Page Links',
				description: 'Decide how page links appear.',
				completed: false,
				actionText: 'Set Up',
			},
			{
				title: 'Search Engine Visibility',
				description: 'Control search engine indexing.',
				completed: false,
				actionText: 'Review',
			},
		],
	},
	{
		title: 'Design, Style & Theme',
		steps: [
			{
				title: 'Pick a Color Scheme',
				description: '',
				completed: false,
				actionText: 'Set Up',
			},
			{
				title: 'Choose Typography',
				description: '',
				completed: false,
				actionText: 'Set Up',
			},
		],
	},
];

const Intro: React.FC<IntroProps> = ({ onNext }) => {
	// return (
	// <section>
	//     <h2>Welcome to the CatalogX family!</h2>
	//     <p>
	//         Thank you for choosing CatalogX! This quick setup wizard will help you configure the basic settings and you will have your marketplace ready in no time.
	//         <strong> It’s completely optional and shouldn’t take longer than five minutes.</strong>
	//     </p>
	//     <p>
	//         If you don't want to go through the wizard right now, you can skip and return to the WordPress dashboard. Come back anytime if you change your mind!
	//     </p>
	//     <button className='footer-btn next-btn' onClick={onNext}>Next</button>
	// </section>

	// );
	const [expanded, setExpanded] = useState<number | null>(0);

	const toggleSection = (index: number) => {
		setExpanded(expanded === index ? null : index);
	};

	return (
		<div className="wizard-container">
			{sectionsData.map((section, idx) => {
				const completedSteps = section.steps.filter(
					(s) => s.completed
				).length;
				const totalSteps = section.steps.length;

				return (
					<div
						key={idx}
						className={`wizard-section ${
							expanded === idx ? 'expanded' : ''
						}`}
					>
						<div
							className="wizard-header"
							onClick={() => toggleSection(idx)}
						>
							<div className="wizard-title">
								<span
									className={`chevron ${
										expanded === idx ? 'rotate' : ''
									}`}
								>
									&gt;
								</span>
								{section.title}
							</div>
							<div className="wizard-progress">
								{completedSteps}/{totalSteps}
							</div>
						</div>

						{expanded === idx && (
							<div className="wizard-steps">
								{section.steps.map((task, tidx) => (
									<div key={tidx} className="wizard-step">
										<div className="step-info">
											<div
												className={`step-status ${
													task.completed
														? 'completed'
														: ''
												}`}
											>
												{task.completed && (
													<span className="check">
														&#10003;
													</span>
												)}
											</div>
											<div className="step-text">
												<span className="step-title">
													{task.title}
												</span>
												{task.description && (
													<span className="desc">
														{task.description}
													</span>
												)}
											</div>
										</div>
										<button className="admin-btn btn-blue">
											{task.actionText} &rarr;
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default Intro;
