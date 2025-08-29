/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';

/**
 * Internal dependencies
 */
import ProPopup from './Popup';
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
    tag: string;
    buttonText: string;
    bgCode: string;
    textCode: string;
    btnCode: string;
    btnBgCode: string;
}

const Banner: React.FC<BannerProps> = ({
    isPro,
    products,
    proUrl,
    tag,
    buttonText,
    bgCode, textCode, btnCode, btnBgCode
}) => {
    // Ensure localStorage is initialized correctly
    if (localStorage.getItem('banner') !== 'false') {
        localStorage.setItem('banner', 'true');
    }

    const [modal, setModal] = useState<boolean>(false);
    const [banner, setBanner] = useState<boolean>(
        localStorage.getItem('banner') === 'true'
    );

    const handleCloseBanner = (): void => {
        localStorage.setItem('banner', 'false');
        setBanner(false);
    };

    const handleClose = (): void => {
        setModal(false);
    };

    const handleOpen = (): void => {
        setModal(true);
    };

    useEffect(() => {
        if (!banner) return;

        const carouselItems: NodeListOf<Element> =
            document.querySelectorAll('.carousel-item');
        const totalItems: number = carouselItems.length;
        if (!totalItems) return;

        let currentIndex: number = 0;
        let interval: NodeJS.Timeout;

        // Function to show the current slide and hide others
        const showSlide = (index: number): void => {
            carouselItems.forEach((item) =>
                item.classList.remove( 'active' )
            );
            carouselItems[ index ].classList.add( 'active' );
        };

        // Function to go to the next slide
        const nextSlide = (): void => {
            currentIndex = (currentIndex + 1) % totalItems;
            showSlide(currentIndex);
        };

        // Function to go to the previous slide
        const prevSlide = (): void => {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            showSlide(currentIndex);
        };

        // Start the auto-slide interval
        const startAutoSlide = (): void => {
            interval = setInterval(nextSlide, 7000); // Change slide every 7 seconds
        };

        // Stop the auto-slide interval
        const stopAutoSlide = (): void => {
            clearInterval(interval);
        };

        // Initialize the carousel
        showSlide(currentIndex);
        startAutoSlide();

        // Handle next button click
        document
            .getElementById('next-btn')
            ?.addEventListener('click', () => {
                nextSlide();
                stopAutoSlide();
                startAutoSlide();
            });

        document
            .getElementById('prev-btn')
            ?.addEventListener('click', () => {
                prevSlide();
                stopAutoSlide();
                startAutoSlide();
            });
    }, [banner]);

    return (
        <>
            {!isPro && banner && (
                <div className="top-header">
                    <Dialog
                        className="admin-module-popup"
                        open={modal}
                        onClose={handleClose}
                        aria-labelledby="form-dialog-title"
                    >
                        <span
                            className="admin-font adminlib-cross stock-manager-popup-cross"
                            role="button"
                            tabIndex={0}
                            onClick={handleClose}
                        ></span>
                        <ProPopup />
                    </Dialog>

                    <i
                        className="adminlib-close"
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
                                    {/* <i className="adminlib-support"></i> */}
                                    <span className="title">{product.title}: </span>
                                    <span className="description">{product.description} </span>
                                    <a href="#">Upgrade Now</a>
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
