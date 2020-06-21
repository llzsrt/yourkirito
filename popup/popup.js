document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const blockLoading = document.getElementById('loading');

        const imgAvatar = document.getElementById('profile-avatar');
        const blockName = document.getElementById('profile-name');
        const blockTitle = document.getElementById('profile-title');
        const blockInfo = document.getElementById('profile-info');

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
        
        const buttonReset = document.getElementById('button-reset');

        let myKirito=null;

        function init(myKirito) {
            blockLoading.hidden = true;

            if (!myKirito.profile.avatar) {
                imgAvatar.hidden = true;
            } else {
                imgAvatar.hidden = false;
                imgAvatar.src = `https://storage.googleapis.com/kirito-1585904519813.appspot.com/avatars/${myKirito.profile.avatar}.png`;
            }
            blockName.textContent = myKirito.profile.nickname;
            blockTitle.textContent = myKirito.profile.title;
            blockInfo.innerHTML = `
                        <div class="mb-2">目前樓層 <span class="badge badge-secondary mr-3">${myKirito.profile.floor}</span>  成就點數 <span class="badge badge-secondary">${myKirito.profile.achievementPoints}</span></div>
                        <div class="mb-2">行動次數 <span class="badge badge-secondary mr-3">${myKirito.profile.actionCount}</span> 挑戰次數 <span class="badge badge-secondary">${myKirito.profile.challengeCount}</span></div>
                `;

            switchReceiveAward.checked = myKirito.isAutoReceiveAward;
            inputRandomDelay.value = myKirito.randomDelay;
            inputBasicActionCd.value = myKirito.actionCd;
            inputBasicHuntCd.value = myKirito.huntCd;
            inputActionCd.value = myKirito.nextActionSecond;
            inputHuntCd.value = myKirito.nextHuntSecond;
        }

        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                event: 'sync'
            },
            (response) => {
                myKirito = response.myKirito;
                init(myKirito);
            }
        );

        buttonReset.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'reset'
                },
                (response) => {
                    myKirito = response.myKirito;
                    init(myKirito);
                }
            );
        });

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