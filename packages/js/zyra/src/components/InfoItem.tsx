import React from 'react';
import '../styles/web/UI/InfoItem.scss';
import Skeleton from './UI/Skeleton';

type AvatarProps = {
    image?: string;
    imageHtml?: string;
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
    onClick?: () => void;
    descriptions?: DescriptionProps[];
    badges?: BadgeProps[];
    amount?: React.ReactNode;
    amountClassName?: string;
    className?: string;
    isLoading?: boolean;
};

const InfoItem: React.FC<InfoItemProps> = ({
    title,
    titleLink,
    avatar,
    onClick,
    descriptions = [],
    badges = [],
    amount,
    amountClassName = '',
    className = '',
    isLoading = false,
}) => {
    const renderAvatar = () => {
        if (!avatar) {
            return null;
        }

        const avatarContent = avatar.image ? (
            <img src={avatar.image} alt={title} />
        ) : avatar.iconClass ? (
            <i className={`adminfont-${avatar.iconClass}`} />
        ) : (
            <span className={`adminfont-${avatar.iconClass}`}>
                {avatar.text}
            </span>
        );

        return (
            <div className="avatar">
                {avatar.link ? (
                    <a
                        href={avatar.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {avatarContent}
                    </a>
                ) : (
                    avatarContent
                )}
            </div>
        );
    };

    const Title = titleLink ? (
        <a href={titleLink} rel="noopener noreferrer">
            {title}
        </a>
    ) : onClick ? (
        <span onClick={onClick}>{title}</span>
    ) : (
        title
    );

    return (
        <div className="info-item-wrapper">
            <div className={`info-item ${className}`}>
                {isLoading ? (
                    <>
                        <div className="details-wrapper">
                            {avatar && (
                                <div className="avatar">
                                    <Skeleton
                                        variant="circular"
                                        width={1.875}
                                        height={1.875}
                                    />
                                </div>
                            )}

                            <div className="details">
                                <div className="name">
                                    <Skeleton width={11.25} height={1.5} />
                                    {badges.length > 0 && (
                                        <Skeleton
                                            variant="rectangular"
                                            width={3.75}
                                            height={1.25}
                                        />
                                    )}
                                </div>
                                {descriptions && (
                                    <div className="des">
                                        <Skeleton width="90%" />
                                    </div>
                                )}
                                <div className="des">
                                    <Skeleton width="75%" />
                                </div>
                            </div>
                        </div>
                        {amount !== undefined && (
                            <div className="right-details">
                                <div className="price">
                                    <Skeleton width={4.375} />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
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
                                                {desc.boldLabel ? (
                                                    <b>{desc.label}</b>
                                                ) : (
                                                    desc.label
                                                )}
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
                    </>
                )}
            </div>
        </div>
    );
};

export default InfoItem;
