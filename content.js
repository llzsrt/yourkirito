(async () => {
    const src = chrome.extension.getURL('content/main.js');
    const contentScript = await import(src);
    contentScript.main();
})();