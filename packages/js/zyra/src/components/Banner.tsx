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
	proUrl: string;
	tag: string;
	buttonText: string;
}

const Banner: React.FC<BannerProps> = ({
	isPro,
	products,
	proUrl,
	tag,
	buttonText,
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
			carouselItems.forEach((item) => item.classList.remove('active'));
			carouselItems[index].classList.add('active');
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
		document.getElementById('nextBtn')?.addEventListener('click', () => {
			nextSlide();
			stopAutoSlide();
			startAutoSlide();
		});

		document.getElementById('prevBtn')?.addEventListener('click', () => {
			prevSlide();
			stopAutoSlide();
			startAutoSlide();
		});
	}, [banner]);

	return (
		<>
			{!isPro && banner && (
				<div className="custom-banner">
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
					<div className="admin-carousel-container">
						<div className="carousel-container">
							<div
								className="admin-font adminlib-cross pro-slider-cross"
								role="button"
								tabIndex={0}
								onClick={handleCloseBanner}
							></div>
							{tag && (
								<div
									className="why-go-pro-tag"
									role="button"
									tabIndex={0}
									onClick={handleOpen}
								>
									{tag}
								</div>
							)}
							<ul className="carousel-list">
								{products?.map((product, i) => {
									return (
										<li
											key={i}
											className={`carousel-item ${i === 0 ? 'active' : ''}`}
										>
											<div className="admin-pro-txt-items">
												<h3>{product.title}</h3>
												<p>{product.description}</p>
												{buttonText && (
													<a
														href={proUrl}
														target="_blank"
														rel="noreferrer"
														className="admin-btn btn-red"
													>
														{buttonText}
													</a>
												)}
											</div>
										</li>
									);
								})}
							</ul>
						</div>
						<div className="carousel-controls">
							<button id="prevBtn">
								<i className="admin-font adminlib-arrow-left"></i>
							</button>
							<button id="nextBtn">
								<i className="admin-font adminlib-arrow-right"></i>
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default Banner;
