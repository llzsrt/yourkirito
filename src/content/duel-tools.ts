import { MyKirito } from "./my-kirito";
import { DomHelper } from "./dom-helper";
import { sleep, insertAfter } from "./utils";
import { getProfile } from "./api";

export class DuelTools {

    setPreyButton: Element;
    peepButton: Element;

    constructor(
        private myKirito: MyKirito,
        private domHelper: DomHelper
    ) {
        if (location.href.includes('profile')) {
            this.injectionTitleButtons();
        }
    }

    async injectionTitleButtons() {
        const self = this;
        const id = location.href.split('/').pop();
        const tempName = await this.domHelper.waitForText(
            this.myKirito.profileViewType === 'detail' || !this.myKirito.profileViewType ?
                'table > tbody > tr:nth-child(1) > td:nth-child(2)' :
                'div > table:nth-child(2) > tbody > tr:nth-child(4) > td'
        );
        if ((!tempName)) {
            await sleep(50);
            if (location.href.includes('profile')) {
                this.injectionTitleButtons();
            }
            return;
        }
        this.domHelper.loadButtons();
        this.setPreyButton = document.createElement('button');
        const isPrey = !!self.myKirito.preyId && self.myKirito.preyId !== '' && location.href.includes(self.myKirito.preyId);
        this.setPreyButton.id = 'button-prey';
        this.setPreyButton.className = 'sc-AxgMl llLWDd';
        this.setPreyButton.textContent = isPrey ? '移除目標' : '設為攻擊目標';
        this.setPreyButton.setAttribute('type', 'button');
        this.setPreyButton.addEventListener('click', () => {
            const isPrey = !!self.myKirito.preyId && self.myKirito.preyId !== '' && location.href.includes(self.myKirito.preyId);
            if (isPrey) {
                self.myKirito.preyId = '';
                self.myKirito.preyName = '';
                this.setPreyButton.textContent = '設為攻擊目標';
            } else {
                self.myKirito.preyId = location.href.split('/').pop();
                self.myKirito.preyName = tempName;
                this.setPreyButton.textContent = '移除目標';
            }

            self.myKirito.savePreyId();
            self.myKirito.savePreyName();
        });


        this.peepButton = document.createElement('button');
        this.peepButton.id = 'button-peep';
        this.peepButton.className = 'sc-AxgMl llLWDd';
        this.peepButton.textContent = '檢視完整數值';
        this.peepButton.setAttribute('type', 'button');
        this.peepButton.addEventListener('click', async () => {
            self.myKirito.loadToken();
            if (!!self.myKirito.token) {
                const data = await getProfile(self.myKirito.token, id);
                this.showProfilePopup(data);
            }
        });

        insertAfter(this.setPreyButton, this.domHelper.buttons['查看能力比對']);
        insertAfter(this.peepButton, this.setPreyButton);
    }

    showProfilePopup(data) {
        const popup = window.open('', '', `top=0,left=${screen.width - 300},width=300,height=650,location=no`);
        if (!popup) return console.error('Popup blocked! Please allow popups and try again.');

        const profile = data.profile;
        popup.document.write(
            `<!DOCTYPE html>
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
}