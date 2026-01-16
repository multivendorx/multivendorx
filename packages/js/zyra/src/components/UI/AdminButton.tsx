type ButtonConfig = {
	icon?: string;
	text: string;
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
};

type AdminButtonProps = {
	buttons: ButtonConfig | ButtonConfig[];
	wrapperClass?: 'left' | 'right' | 'center';
};

const AdminButton: React.FC<AdminButtonProps> = ({
	buttons,
	wrapperClass = '',
}) => {
	const buttonsArray = Array.isArray(buttons) ? buttons : [buttons];

	const renderedButtons = buttonsArray.map((btn, index) => {
		const isDisabled = !!btn.disabled;

		return (
			<div
				key={index}
				className={`admin-btn ${
					btn.className ? `btn-${btn.className}` : ''
				} ${isDisabled ? 'btn-disabled' : ''}`}
				onClick={() => {
					if (isDisabled) return;
					btn.onClick?.();
				}}
				aria-disabled={isDisabled}
			>
				{btn.icon && <i className={`adminfont-${btn.icon}`}></i>}
				{btn.text}
			</div>
		);
	});

	const wrapperClasses = `buttons-wrapper${
		wrapperClass ? ` ${wrapperClass}` : ''
	}`;

	return <div className={wrapperClasses}>{renderedButtons}</div>;
};

export default AdminButton;
