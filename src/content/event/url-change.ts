export function registerUrlChangeEvent() {
    let originalUrl = '';
    window.setInterval(() => {
        if (location.href != originalUrl) {
            window.dispatchEvent(new CustomEvent<UrlChangeEventDetail>('urlChange', { detail: { originalUrl, currentUrl: location.href } }));
            originalUrl = location.href;
        }
    }, 50);
}

export interface UrlChangeEventDetail {
    originalUrl: string;
    currentUrl: string;
}