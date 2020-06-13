document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const resetActionCdButton = document.getElementById('button-resetActionCd');
        const resetActionCdInput = document.getElementById('input-resetActionCd');
        const resetHuntCdButton = document.getElementById('button-resetHuntCd');
        const resetHuntCdInput = document.getElementById('input-resetHuntCd');
        
        let myKirito=null;
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                event: 'sync'
            },
            (response) => {
                myKirito = response.myKirito;
                resetActionCdInput.value = myKirito.nextActionSecond;
                resetHuntCdInput.value = myKirito.nextHuntSecond;
            }
        );

        resetActionCdButton.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'reset-action-cd',
                    content: +(resetActionCdInput.value)
                }
            );
        });

        resetHuntCdButton.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'reset-hunt-cd',
                    content: +(resetHuntCdInput.value)
                }
            );
        });
    });
});