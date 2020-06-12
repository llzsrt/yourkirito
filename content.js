(async () => {
    const src = chrome.extension.getURL('dist/content/main.js');
    const contentScript = await import(src);
    contentScript.main();
})();