export function registerXhrDoneEvent() {
    const internalScript = document.createElement("script");
    internalScript.textContent = `
    (()=>{
        const originalXhr = window.XMLHttpRequest;

        window.XMLHttpRequest = class extends XMLHttpRequest {
            constructor() {
                super();
                const xhr = new originalXhr();

                xhr.addEventListener('readystatechange', function () {
                    if (this.readyState === xhr.DONE) {
                        window.dispatchEvent(
                            new CustomEvent('xhrDone', { 
                                detail: {
                                    response: this.response,
                                    url: this.responseURL,
                                    status: this.status,
                                    readyState: this.readyState
                                } 
                            })
                        );
                    }
                }, false);
                return xhr;
            }
        }}
    )()`;
    document.body.appendChild(internalScript);
}