export function registerXhrDoneEvent() {
    const originalXhr = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends XMLHttpRequest {
        constructor() {
            super();
            const xhr = new originalXhr();
            xhr.addEventListener('readystatechange', function () {
                if (this.readyState === xhr.DONE) {
                    window.dispatchEvent(
                        new CustomEvent<XMLHttpRequest>('xhrDone', { detail: this })
                    );
                }
            }, false);
            return xhr;
        }
    }
}