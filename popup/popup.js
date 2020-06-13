document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const randomDelayButton = document.getElementById('button-randomDelay');
        const randomDelayInput = document.getElementById('input-randomDelay');
        const actionCdButton = document.getElementById('button-actionCd');
        const actionCdInput = document.getElementById('input-actionCd');
        const huntCdButton = document.getElementById('button-huntCd');
        const huntCdInput = document.getElementById('input-huntCd');
        const resetActionCdButton = document.getElementById('button-reset-actionCd');
        const resetHuntCdButton = document.getElementById('button-reset-huntCd');
        
        let myKirito=null;
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                event: 'sync'
            },
            (response) => {
                myKirito = response.myKirito;
                randomDelayInput.value = myKirito.randomDelay;
                actionCdInput.value = myKirito.nextActionSecond;
                huntCdInput.value = myKirito.nextHuntSecond;
            }
        );

        randomDelayButton.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-random-delay',
                    content: +(randomDelayInput.value)
                }
            );
        });

        actionCdButton.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-action-cd',
                    content: +(actionCdInput.value)
                }
            );
        });

        huntCdButton.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-hunt-cd',
                    content: +(huntCdInput.value)
                }
            );
        });

        resetActionCdButton.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-action-cd',
                    content: 0
                }
            );
        });

        resetHuntCdButton.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-hunt-cd',
                    content: 0
                }
            );
        });
    });
});