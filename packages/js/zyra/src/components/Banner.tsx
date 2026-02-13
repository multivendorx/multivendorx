// External dependencies
import React, { useState, useEffect } from 'react';

import '../styles/web/Banner.scss';

// Types
interface Products {
    title: string;
    description: string;
}
interface BannerProps {
    isPro?: boolean;
    products?: Products[];
    proUrl?: string;
}

const Banner: React.FC<BannerProps> = ({ isPro, products, proUrl }) => {
    // Ensure localStorage is initialized correctly
    if (localStorage.getItem('banner') !== 'false') {
        localStorage.setItem('banner', 'true');
    }

    const [banner, setBanner] = useState<boolean>(
        localStorage.getItem('banner') === 'true'
    );

    const handleCloseBanner = (): void => {
        localStorage.setItem('banner', 'false');
        setBanner(false);
    };

    useEffect(() => {
        if (!banner) return;

        const carouselItems =
            document.querySelectorAll<HTMLElement>('.carousel-item');

        const totalItems = carouselItems.length;
        if (!totalItems) return;

        let currentIndex = 0;

        const showSlide = (index: number): void => {
            carouselItems.forEach(item =>
                item.classList.remove('active')
            );
            carouselItems[index].classList.add('active');
        };

        const nextSlide = (): void => {
            currentIndex = (currentIndex + 1) % totalItems;
            showSlide(currentIndex);
        };

        showSlide(currentIndex);

        const interval = setInterval(nextSlide, 7000);

        return () => {
            clearInterval(interval);
        };
    }, [banner]);

    return (
        <>
            {!isPro && banner && (
                <div className="top-header">
                    <i
                        className="adminfont-close"
                        role="button"
                        tabIndex={0}
                        onClick={handleCloseBanner}
                    ></i>
                    <ul className="carousel-list ">
                        {products?.map((product, i) => {
                            return (
                                <li
                                    key={i}
                                    className={`carousel-item ${i === 0 ? 'active' : ''
                                        }`}
                                >
                                    <span className="title">
                                        {product.title}:{' '}
                                    </span>
                                    <span className="description">
                                        {product.description}{' '}
                                    </span>
                                    <a
                                        href={proUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Upgrade Now
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </>
    );
};

export default Banner;
