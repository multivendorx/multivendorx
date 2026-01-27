import React from 'react';
import "../../styles/web/UI/MessageState.scss";

interface MessageStateProps {
	icon?: string;
	iconColor?: string;
	title: React.ReactNode;
	desc?: React.ReactNode;
	buttonText?: string;
	buttonLink?: string;
	buttonTarget?: '_blank' | '_self';
	onButtonClick?: () => void;
	className?: string;
}

const MessageState: React.FC<MessageStateProps> = ({
	icon = 'info',
	iconColor = 'red',
	title,
	desc,
	buttonText,
	buttonLink,
	buttonTarget = '_self',
	onButtonClick,
	className = '',
}) => {
	return (
		<div className={`permission-wrapper ${className}`}>
			<i className={`adminfont-${icon} ${iconColor}`}></i>

			<div className="title">{title}</div>

			{desc && <div className="desc">{desc}</div>}

			{buttonText && (
				buttonLink ? (
					<a
						href={buttonLink}
						target={buttonTarget}
						rel={buttonTarget === '_blank' ? 'noopener noreferrer' : ''}
						className="admin-btn btn-purple"
					>
						{buttonText}
					</a>
				) : (
					<div
						className="admin-btn btn-purple"
						role="button"
						onClick={() => {
							if (onButtonClick) {
								onButtonClick();
							}
						}}
					>
						{buttonText}
					</div>
				)
			)}
		</div>
	);
};

export default MessageState;