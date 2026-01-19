import React from 'react';
import "../../styles/web/UI/InfoItem.scss";

type AvatarProps = {
    image?: string;
    iconClass?: string;
    text?: string;
    link?: string;
};

type DescriptionProps = {
    label?: string;
    value?: React.ReactNode;
    boldLabel?: boolean;
};

type BadgeProps = {
    text: string;
    className: string;
    onClick?: () => void;
};

type InfoItemProps = {
    title: string;
    titleLink?: string;

    avatar?: AvatarProps;

    descriptions?: DescriptionProps[];

    badges?: BadgeProps[];

    amount?: React.ReactNode;
    amountClassName?: string;

    className?: string;
};

const InfoItem: React.FC<InfoItemProps> = ({
    title,
    titleLink,
    avatar,
    descriptions = [],
    badges = [],
    amount,
    amountClassName = '',
    className = '',
}) => {
    const renderAvatar = () => {
        if (!avatar) return null;

        const avatarContent = avatar.image ? (
            <img src={avatar.image} alt={title} />
        ) : avatar.iconClass ? (
            <i className={avatar.iconClass} />
        ) : (
            <span className={avatar.iconClass}>{avatar.text}</span>
        );

        return (
            <div className="avatar">
                {avatar.link ? (
                    <a href={avatar.link} target="_blank" rel="noopener noreferrer">
                        {avatarContent}
                    </a>
                ) : (
                    avatarContent
                )}
            </div>
        );
    };

    const Title = titleLink ? (
        <a href={titleLink} target="_blank" rel="noopener noreferrer">
            {title}
        </a>
    ) : (
        title
    );

    return (
        <div className="info-item-wrapper">
            <div className={`info-item ${className}`}>
                <div className="details-wrapper">
                    {renderAvatar()}

                    <div className="details">
                        <div className="name">
                            {Title}

                            {badges.map((badge, index) => (
                                <span
                                    key={index}
                                    className={`admin-badge ${badge.className}`}
                                    onClick={badge.onClick}
                                >
                                    {badge.text}
                                </span>
                            ))}
                        </div>

                        {descriptions.map((desc, index) => (
                            <div className="des" key={index}>
                                {desc.label && (
                                    <>
                                        {desc.boldLabel ? <b>{desc.label}</b> : desc.label}
                                        {': '}
                                    </>
                                )}
                                {desc.value}
                            </div>
                        ))}
                    </div>
                </div>

                {amount !== undefined && (
                    <div className="right-details">
                        <div className={`price ${amountClassName}`}>
                            {amount}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfoItem;