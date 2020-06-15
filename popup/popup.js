document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const imgAvatar = document.getElementById('profile-avatar');
        const blockName = document.getElementById('profile-name');

        const switchReceiveAward = document.getElementById('switch-receiveAward');

        const buttonRandomDelay = document.getElementById('button-randomDelay');
        const inputRandomDelay = document.getElementById('input-randomDelay');
        const buttonActionCd = document.getElementById('button-actionCd');
        const inputActionCd = document.getElementById('input-actionCd');
        const buttonHuntCd = document.getElementById('button-huntCd');
        const inputHuntCd = document.getElementById('input-huntCd');
        const buttonResetActionCd = document.getElementById('button-reset-actionCd');
        const buttonResetHuntCd = document.getElementById('button-reset-huntCd');

        const buttonBasicActionCd = document.getElementById('button-basic-actionCd');
        const inputBasicActionCd = document.getElementById('input-basic-actionCd');
        const buttonBasicHuntCd = document.getElementById('button-basic-huntCd');
        const inputBasicHuntCd = document.getElementById('input-basic-huntCd');
        
        let myKirito=null;
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                event: 'sync'
            },
            (response) => {
                myKirito = response.myKirito;

                if (!myKirito.profileAvatar) {
                    imgAvatar.hidden = true;
                } else {
                    imgAvatar.src = myKirito.profileAvatar;
                }
                blockName.textContent = myKirito.profileName;

                switchReceiveAward.checked = myKirito.isAutoReceiveAward;
                inputRandomDelay.value = myKirito.randomDelay;
                inputBasicActionCd.value = myKirito.actionCd;
                inputBasicHuntCd.value = myKirito.huntCd;
                inputActionCd.value = myKirito.nextActionSecond;
                inputHuntCd.value = myKirito.nextHuntSecond;
            }
        );

        switchReceiveAward.addEventListener('change', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-auto-receive-award',
                    content: switchReceiveAward.checked
                }
            );
        });

        buttonRandomDelay.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-random-delay',
                    content: +(inputRandomDelay.value)
                }
            );
        });


        buttonBasicActionCd.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-basic-action-cd',
                    content: +(inputBasicActionCd.value)
                }
            );
        });

        buttonBasicHuntCd.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-basic-hunt-cd',
                    content: +(inputBasicHuntCd.value)
                }
            );
        });

        buttonActionCd.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-action-cd',
                    content: +(inputActionCd.value)
                }
            );
        });

        buttonHuntCd.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-hunt-cd',
                    content: +(inputHuntCd.value)
                }
            );
        });

        buttonResetActionCd.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-action-cd',
                    content: 0
                }
            );
        });

        buttonResetHuntCd.addEventListener('click', () => {
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