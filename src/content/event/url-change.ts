import { sleep } from "../function/utils";

export function registerUrlChangeEvent() {
    return new UrlWatcher();
}

export interface UrlChangeEventDetail {
    originalUrl: string;
    currentUrl: string;
}

class UrlWatcher {

    private originalUrl: string = '';

    constructor() {
        this.watchUrl();
    }

    async watchUrl() {
        if (location.href != this.originalUrl) {
            window.dispatchEvent(new CustomEvent<UrlChangeEventDetail>('urlChange', { detail: { originalUrl: this.originalUrl, currentUrl: location.href } }));
            this.originalUrl = location.href;
        }
        await sleep(50);
        this.watchUrl();
    }
}