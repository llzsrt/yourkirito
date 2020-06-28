document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const blockLoading = document.getElementById('loading');

        const imgAvatar = document.getElementById('profile-avatar');
        const blockName = document.getElementById('profile-name');
        const blockTitle = document.getElementById('profile-title');
        const blockInfo = document.getElementById('profile-info');

        const fileSchedule = document.getElementById('file-schedule');
        const switchReceiveAward = document.getElementById('switch-receiveAward');
        const switchScheduleEnable = document.getElementById('switch-scheduleEnable');
        const switchScheduleDuelEnable = document.getElementById('switch-scheduleDuelEnable');

        const buttonRandomDelay = document.getElementById('button-randomDelay');
        const inputRandomDelay = document.getElementById('input-randomDelay');
        const buttonActionCd = document.getElementById('button-actionCd');
        const inputActionCd = document.getElementById('input-actionCd');
        const buttonDuelCd = document.getElementById('button-duelCd');
        const inputDuelCd = document.getElementById('input-duelCd');
        const buttonResetActionCd = document.getElementById('button-reset-actionCd');
        const buttonResetDuelCd = document.getElementById('button-reset-duelCd');

        const buttonBasicActionCd = document.getElementById('button-basic-actionCd');
        const inputBasicActionCd = document.getElementById('input-basic-actionCd');
        const buttonBasicDuelCd = document.getElementById('button-basic-duelCd');
        const inputBasicDuelCd = document.getElementById('input-basic-duelCd');
        
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
            switchScheduleEnable.checked = myKirito.schedule.isEnable;
            switchScheduleDuelEnable.checked = myKirito.schedule.isDuelScheduleEnable;
            inputRandomDelay.value = myKirito.randomDelay;
            inputBasicActionCd.value = myKirito.actionCd;
            inputBasicDuelCd.value = myKirito.duelCd;
            inputActionCd.value = myKirito.nextActionSecond;
            inputDuelCd.value = myKirito.nextDuelSecond;
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

        fileSchedule.addEventListener('change', (event)=> {
            if (event.target.files.length > 0) {
                const file = event.target.files[0];
                readFile(file, (result) => {
                    try {
                        const data = JSON.parse(result);

                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            {
                                event: 'set-schedule-process-list',
                                content: data
                            }
                        );
                    } catch (ex) {
                        alert(ex);
                    }
                });
            }
        });

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

        switchScheduleEnable.addEventListener('change', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-schedule-enable',
                    content: switchScheduleEnable.checked
                }
            );
        });

        switchScheduleDuelEnable.addEventListener('change', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-schedule-duel-enable',
                    content: switchScheduleDuelEnable.checked
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

        buttonBasicDuelCd.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-basic-duel-cd',
                    content: +(inputBasicDuelCd.value)
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

        buttonDuelCd.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-duel-cd',
                    content: +(inputDuelCd.value)
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

        buttonResetDuelCd.addEventListener('click', () => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    event: 'set-duel-cd',
                    content: 0
                }
            );
        });
    });
});

function readFile(file, callback) {
    if (typeof callback !== "function") {
        throw new Error("Please supply a callback function to handle the read text!")
    }
    const reader = new FileReader()
    reader.addEventListener("load", function () {
        callback(reader.result)
    })
    return reader.readAsText(file)
}