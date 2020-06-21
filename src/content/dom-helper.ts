import { ACTION, DUEL } from './constant';
import { MyKirito } from './my-kirito';
import { sleep } from './utils';

export class DomHelper {

    myKirito: MyKirito;

    buttons: any = {}
    links: any = {}
    actionButtons: Element[] = [];
    duelButtons: Element[] = [];
    messageBlock: Element;
    hunterButton: Element;
    pauseButton: Element;
    preyNameBlock: Element;

    oldUrl: string = '';

    constructor(myKirito: MyKirito) {
        this.myKirito = myKirito;
        this.loadLinks();
        this.loadButtons();
        this.injectionTools();
        this.checkPrey();
        this.watchUrl();
        this.messageBlock = document.getElementById('message-block');
    }

    addButton(parentId, id, content) {
        const parent = document.getElementById(parentId);
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('id', id);
        button.innerHTML = content;
        return parent.appendChild(button);
    }

    injectionTools() {
        const self = this;
        const toolsWrapper = document.createElement('div');
        toolsWrapper.setAttribute('id', 'tools-wrapper');

        const hunterWrapper = document.createElement('div');
        hunterWrapper.setAttribute('id', 'hunter-wrapper');

        const preyName = document.createElement('div');
        preyName.setAttribute('id', 'prey-name');

        const buttonGroup = document.createElement('div');
        buttonGroup.setAttribute('class', 'btn-group');
        buttonGroup.setAttribute('id', 'button-group');

        const duelButtonGroup = document.createElement('div');
        duelButtonGroup.setAttribute('class', 'btn-group');
        duelButtonGroup.setAttribute('id', 'duel-group');

        const statusBar = document.createElement('div');
        statusBar.setAttribute('class', 'alert alert-info text-right');
        statusBar.setAttribute('id', 'status-bar');
        const messageBlock = document.createElement('div');
        messageBlock.setAttribute('id', 'message-block');
        statusBar.appendChild(messageBlock);

        document.getElementById('root').appendChild(toolsWrapper);
        toolsWrapper.appendChild(hunterWrapper);
        toolsWrapper.appendChild(buttonGroup);
        toolsWrapper.appendChild(statusBar);

        for (let action in ACTION) {
            const button = this.addButton('button-group', `button-${action}`, action);
            this.actionButtons.push(button);
            button.setAttribute('class', ACTION[action] === this.myKirito.action ? 'btn btn-secondary active' : 'btn btn-secondary');
            button.addEventListener('click', () => {
                self.myKirito.action = ACTION[action];
                self.myKirito.saveDefaultAction();
                self.setToolsButtonStyle();
            });
        }

        this.pauseButton = this.addButton('button-group', `button-pause`, '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>');
        this.setPauseButtonStyle();
        this.pauseButton.addEventListener('click', () => {
            if (!self.myKirito.isActionPause) {
                self.myKirito.isActionPause = true;
                self.myKirito.saveIsActionPause();
                localStorage.setItem('scriptIsActionPause', 'true');
            } else {
                self.myKirito.isActionPause = false;
                self.myKirito.saveIsActionPause();
                const tempSecond = self.myKirito.getTempSecond();
                self.myKirito.loadNextActionSecond(tempSecond);
            }
            self.setPauseButtonStyle();
        });

        this.preyNameBlock = hunterWrapper.appendChild(preyName);

        hunterWrapper.appendChild(duelButtonGroup);
        this.hunterButton = this.addButton('hunter-wrapper', 'button-hunter', '自動攻擊');
        this.setHunterButtonStyle();
        this.hunterButton.addEventListener('click', () => {
            if (!self.myKirito.isHuntPause) {
                self.myKirito.unlock();
                self.myKirito.isHuntPause = true;
                self.myKirito.saveIsHuntPause();
            } else {
                const tempSecond = self.myKirito.getTempSecond();
                self.myKirito.loadNextHuntSecond(tempSecond);

                self.myKirito.isHuntPause = false;
                self.myKirito.saveIsHuntPause();
            }
            self.setHunterButtonStyle();
        });

        for (let duel in DUEL) {
            const button = this.addButton('duel-group', `button-${duel}`, duel);
            this.duelButtons.push(button);
            button.setAttribute('class', DUEL[duel] === this.myKirito.duel ? 'btn btn-secondary active' : 'btn btn-secondary');
            button.addEventListener('click', () => {
                self.myKirito.duel = DUEL[duel];
                self.myKirito.saveDefaultDuel();
                self.setToolsButtonStyle();
            });
        }
    }


    setToolsButtonStyle() {
        this.actionButtons.forEach(button => {
            button.setAttribute('class', ACTION[button.textContent] === this.myKirito.action ? 'btn btn-secondary active' : 'btn btn-secondary');
        });
        this.duelButtons.forEach(button => {
            button.setAttribute('class', DUEL[button.textContent] === this.myKirito.duel ? 'btn btn-secondary active' : 'btn btn-secondary');
        })
    }


    setPauseButtonStyle() {
        this.pauseButton.setAttribute('class', !this.myKirito.isActionPause ? 'btn btn-info active' : 'btn btn-secondary');
        if (this.myKirito.isActionPause) {
            this.pauseButton.innerHTML = '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>'
        } else {
            this.pauseButton.innerHTML = '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>'
        }
    }


    loadButtons() {
        document.querySelectorAll('button').forEach(button => {
            this.buttons[button.textContent] = button;
        });
    }


    loadLinks() {
        document.querySelectorAll('a').forEach(button => {
            this.links[button.textContent] = button;
        });
    }

    checkPrey() {
        if (!this.myKirito.preyId || this.myKirito.preyId === 'null' || this.myKirito.preyId === '') {
            document.getElementById('hunter-wrapper').setAttribute('class', 'hidden');
            this.preyNameBlock.innerHTML = '無攻擊目標';
        } else {
            document.getElementById('hunter-wrapper').setAttribute('class', 'text-right');
            this.preyNameBlock.innerHTML = `當前攻擊目標: <a href="/profile/${this.myKirito.preyId}">${this.myKirito.preyName}</a>`;
        }
    }

    async watchUrl() {
        if (location.href != this.oldUrl) {
            this.oldUrl = location.href;
            // window.dispatchEvent(new Event('urlChange'));
            if (location.href.includes('profile')) {
                this.injectionTitleButton();
            }
        }
        await sleep(50);
        this.watchUrl();
    }

    async injectionTitleButton() {
        const self = this;
        const tempName = await this.waitForElement(
            this.myKirito.profileViewType === 'detail' || !this.myKirito.profileViewType ?
                'table > tbody > tr:nth-child(1) > td:nth-child(2)' :
                'div > table:nth-child(2) > tbody > tr:nth-child(4) > td'
        );
        if ((!tempName || tempName === '')) {
            await sleep(50);
            if (location.href.includes('profile')) {
                this.injectionTitleButton();
            }
            return;
        }
        const title = document.querySelector('#root > div > div:nth-child(1) > div:nth-child(1) > h3');
        const button = document.createElement('button');
        const isPrey = !!self.myKirito.preyId && self.myKirito.preyId !== '' && location.href.includes(self.myKirito.preyId);
        button.setAttribute('type', 'button');
        button.setAttribute('id', 'button-prey');
        button.setAttribute('class', 'sc-AxgMl llLWDd');
        button.textContent = isPrey ? '移除目標' : '設為攻擊目標';
        title.textContent = '';
        title.appendChild(button);
        button.addEventListener('click', () => {
            const isPrey = !!self.myKirito.preyId && self.myKirito.preyId !== '' && location.href.includes(self.myKirito.preyId);
            if (isPrey) {
                self.myKirito.preyId = '';
                self.myKirito.preyName = '';
                button.textContent = '設為攻擊目標';
            } else {
                self.myKirito.preyId = location.href.split('/').pop();
                self.myKirito.preyName = tempName;
                button.textContent = '移除目標';
            }

            self.myKirito.savePreyId();
            self.myKirito.savePreyName();
            self.checkPrey();
        });


        const peepButton = document.createElement('button');
        peepButton.setAttribute('type', 'button');
        peepButton.setAttribute('id', 'button-peep');
        peepButton.setAttribute('class', 'sc-AxgMl llLWDd');
        peepButton.textContent = '檢視完整數值';
        title.appendChild(peepButton);

        const id = location.href.split('/').pop();
        peepButton.addEventListener('click', async () => {
            self.myKirito.loadToken();
            if (!!self.myKirito.token) {
                const data = await self.getProfile(self.myKirito.token, id);
                console.log(data);
                const popup = window.open('', '', `top=0,left=${screen.width - 300},width=300,height=650,location=no`);
                if (!popup) return console.error('Popup blocked! Please allow popups and try again.');
    
                const profile = data.profile;
                popup.document.write(`<!DOCTYPE html>
                                        <html>
    
                                        <head>
                                            <meta charset='utf-8'>
                                            <title>${profile.nickname} </title>
                                            <base target="_blank">
                                            <style> 
                                                body {
                                                    background-color: #3A3A3A;
                                                    color: #FFFFFF;
                                                    font-family: 'Noto Sans TC', 'Microsoft JhengHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                                                }
                                                .avatar-wapper {
                                                    text-align: center;
                                                    margin: 0 0 2rem 0;
                                                }
                                                .avatar {
                                                    vertical-align: middle;
                                                    width: 180px;
                                                    height: 180px;
                                                    border-radius: 50%;
                                                }
                                                .plus{
                                                    color: #00b5b5;
                                                }
                                                table {
                                                    width: 100%;
                                                }
                                                th {
                                                    width: 35%;
                                                    background-color: rgba(255, 255, 255, 0.15);
                                                    text-align: center;
                                                    padding: 4px 8px;
                                                }
                                                td {
                                                    text-align: left;
                                                    padding: 4px 8px;
                                                }
                                            </style>
                                        </head>
    
                                        <body>
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td colspan="2">
                                                            <div class="avatar-wapper">
                                                                <picture>
                                                                    <img class="avatar" src="https://storage.googleapis.com/kirito-1585904519813.appspot.com/avatars/${profile.avatar}.png">
                                                                </picture>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th>等級</th>
                                                        <td>${profile.lv}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>暱稱</th>
                                                        <td>${profile.nickname}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>角色</th>
                                                        <td>${profile.character}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>稱號</th>
                                                        <td>${profile.title}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>HP</th>
                                                        <td>${profile.hp + profile.rattrs.hp}<span class="plus">${profile.rattrs.hp > 0 ? ` (+${profile.rattrs.hp})` : ''}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>攻擊</th>
                                                        <td>${profile.atk + profile.rattrs.atk}<span class="plus">${profile.rattrs.atk > 0 ? ` (+${profile.rattrs.atk})` : ''}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>防禦</th>
                                                        <td>${profile.def + profile.rattrs.def}<span class="plus">${profile.rattrs.def > 0 ? ` (+${profile.rattrs.def})` : ''}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>體力</th>
                                                        <td>${profile.stm + profile.rattrs.stm}<span class="plus">${profile.rattrs.stm > 0 ? ` (+${profile.rattrs.stm})` : ''}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>敏捷</th>
                                                        <td>${profile.agi + profile.rattrs.agi}<span class="plus">${profile.rattrs.agi > 0 ? ` (+${profile.rattrs.agi})` : ''}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>反應速度</th>
                                                        <td>${profile.spd + profile.rattrs.spd}<span class="plus">${profile.rattrs.spd > 0 ? ` (+${profile.rattrs.spd})` : ''}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>技巧</th>
                                                        <td>${profile.tec + profile.rattrs.tec}<span class="plus">${profile.rattrs.tec > 0 ? ` (+${profile.rattrs.tec})` : ''}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>智力</th>
                                                        <td>${profile.int + profile.rattrs.int}<span class="plus">${profile.rattrs.int > 0 ? ` (+${profile.rattrs.int})` : ''}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>幸運</th>
                                                        <td>${profile.lck + profile.rattrs.lck}<span class="plus">${profile.rattrs.lck > 0 ? ` (+${profile.rattrs.lck})` : ''}</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </body>
    
                                        </html>`
                );
            }
        });
    }

    setHunterButtonStyle() {
        if (!this.myKirito.isHuntPause) {
            this.hunterButton.textContent = '停止';
            this.hunterButton.setAttribute('class', 'btn btn-danger active');
        } else {
            this.hunterButton.textContent = '自動攻擊';
            this.hunterButton.setAttribute('class', 'btn btn-danger');
        }
    }

    async waitForElement(selector: string, value: string = '', timeout: number = 10000): Promise<string> {
        if (timeout < 1) {
            return null;
        }
        const target = document.querySelector(selector);
        if (!!target && target.textContent.includes(value)) {
            return target.textContent;
        } else {
            await sleep(500);
            return await this.waitForElement(selector, value, timeout - 500);
        }
    }

    async getProfile(token: string, id: string) {
        const reponse = await fetch(`https://mykirito.com/api/profile/${id}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "token": token,
                "x-requested-with": "XMLHttpRequest"
            }
        });
        return await reponse.json();
    }
}