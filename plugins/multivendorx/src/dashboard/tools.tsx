import { __ } from '@wordpress/i18n';
import { AdminButtonUI, Card, NavigatorHeader } from 'zyra';

const Tools: React.FC = () => {
	return (
		<>
			<NavigatorHeader
				headerTitle={__('Tools', 'multivendorx')}
				headerDescription={__(
					'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Debitis, perferendis.',
					'multivendorx'
				)}
			/>

			<Card
				title={__('Vendor Dashboard transients', 'multivendorx')}
				desc={__(
					'Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, nesciunt?',
					'multivendorx'
				)}
			>
				<AdminButtonUI
					buttons={[
						{
							icon: 'delete',
							text: __('Clear Transients', 'multivendorx'),
							color: 'purple',
							// onClick: (e) => {
							//     handleDownloadLog?.(e);
							// },
						},
					]}
				/>
			</Card>
		</>
	);
};

export default Tools;
