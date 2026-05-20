// Frontend script to handle dynamic banner images
document.addEventListener('DOMContentLoaded', () => {
    const bannerUrl = window.StoreInfo?.storeDetails?.storeBanner || '';

    document.querySelectorAll('.multivendorx-store-banner').forEach(banner => {
        if (bannerUrl) {
            banner.style.backgroundImage = `url(${bannerUrl})`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.style.backgroundRepeat = 'no-repeat';
        }
    });
});