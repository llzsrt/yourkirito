import { MyKirito } from "../../service/my-kirito";
import { DomHelper } from "../../service/dom-helper";
import { CHARACTERS, PLAYER_STATUS, PLAYER_STATUS_COLOR, FIND_STATUS, SCRIPT_STATUS } from "../../constant";
import style from "./user-list-tools.css";
import { sleep, random } from '../../function/utils';

export class UserListTools {
    nextButton: HTMLButtonElement;
    findButton: HTMLButtonElement;
    titleInput: HTMLInputElement;
    characterSelect: HTMLSelectElement;
    statusSelect: HTMLSelectElement;
    huntCheckbox: HTMLInputElement;

    oldTable: string;

    constructor(
        private myKirito: MyKirito,
        private domHelper: DomHelper
    ) { }

    injectionComponent() {
        this.domHelper.loadButtons();
        this.nextButton = this.domHelper.buttons['下一頁'];
                
        const fragment = document.createDocumentFragment();

        this.characterSelect = document.createElement('select');
        this.characterSelect.classList.add(`${style.customSelect}`, `${style.mb}`);
        this.characterSelect.style.marginTop = '6px';
        for (const characterName of CHARACTERS) {
            let tempOption = document.createElement('option');
            tempOption.value = characterName;
            tempOption.text = characterName;
            this.characterSelect.appendChild(tempOption);
        }
        fragment.appendChild(this.characterSelect)

        this.titleInput = document.createElement('input');
        this.titleInput.classList.add('sc-AxheI', 'fniENO', `${style.mb}`); '';
        this.titleInput.style.width = '200px';
        this.titleInput.setAttribute('type', 'text');
        this.titleInput.setAttribute('placeholder', '稱號');
        fragment.appendChild(this.titleInput);

        this.huntCheckbox = document.createElement('input');
        this.huntCheckbox.setAttribute('type', 'checkbox');
        this.huntCheckbox.className = style.formCheckInput;
        this.huntCheckbox.id = 'checkbox-hunt';
        const tempHuntLabel = document.createElement('label');
        tempHuntLabel.className = style.formCheckLabel;
        tempHuntLabel.setAttribute('for', 'checkbox-hunt');
        tempHuntLabel.textContent = '找到後設為攻擊目標';
        const tempHuntCheckboxWrapper = document.createElement('div');
        tempHuntCheckboxWrapper.className = style.formCheck;

        tempHuntCheckboxWrapper.appendChild(this.huntCheckbox);
        tempHuntCheckboxWrapper.appendChild(tempHuntLabel);
        this.findButton = document.createElement('button');
        this.findButton.className = 'sc-AxgMl sc-fznWqX jAeFAC';
        this.findButton.textContent = '尋找';
        this.findButton.addEventListener('click', ()=> {
            if (this.myKirito.scriptStatus !== SCRIPT_STATUS.Find) {
                this.oldTable = null;
                this.myKirito.scriptStatus = SCRIPT_STATUS.Find;
                this.myKirito.findStatus = FIND_STATUS.Processing;
                this.myKirito.isBusy = true;
                this.myKirito.setFoundUserAsPrey = this.huntCheckbox.checked;
                this.find();
            }
        });
        tempHuntCheckboxWrapper.appendChild(this.findButton);
        fragment.appendChild(tempHuntCheckboxWrapper);

        this.statusSelect = document.createElement('select');
        this.statusSelect.setAttribute('multiple', '');
        this.statusSelect.style.width = '100%';
        for (const status of Object.keys(PLAYER_STATUS)) {
            let tempOption: HTMLOptionElement = document.createElement('option');
            tempOption.value = PLAYER_STATUS_COLOR[status];
            tempOption.text = PLAYER_STATUS[status];
            tempOption.style.color = PLAYER_STATUS_COLOR[status];
            this.statusSelect.appendChild(tempOption);
        }
        fragment.appendChild(this.statusSelect);
             
        const tempBlock = document.createElement('div');
        tempBlock.className = 'hRBsWH';
        tempBlock.textContent = '尋找角色 ：';
        tempBlock.appendChild(fragment);
        this.domHelper.buttons['搜尋'].parentElement.insertAdjacentElement('afterend', tempBlock)
    }

    async find() {
        if (!location.href.includes('user-list') || this.myKirito.scriptStatus != SCRIPT_STATUS.Find) {
            this.myKirito.scriptStatus = SCRIPT_STATUS.Normal;
            this.myKirito.isBusy = false;
            return;
        }

        const check = await this.domHelper.waitForText('#root > div > div > table > tbody > tr:nth-child(2)');
        const userListTable = this.domHelper.getElementArray<HTMLTableElement>(document, '#root > div > div > table');
        if (!check || userListTable.length === 0 || !!this.oldTable && this.oldTable == userListTable[0].textContent) {
            await sleep(500);
            this.find();
            return;
        } 
        
        if (!this.oldTable){
            this.oldTable = userListTable[0].textContent;
        }

        const userRows = this.domHelper.getElementArray<HTMLTableRowElement>(userListTable[0], 'tr');

        const optionColors = this.domHelper.getElementArray<HTMLOptionElement>(this.statusSelect, 'option:checked').map(x => x.value);
        for (let userRow of userRows) {
            const character = userRow.querySelector('td:nth-child(3) > div > div:nth-child(1) > div:nth-child(2)');
            if (!character) {
                continue;
            } else if (
                (this.characterSelect.value === '不指定' || character.textContent.includes(this.characterSelect.value))&& 
                character.textContent.includes(this.titleInput.value) &&
                (optionColors.length === 0 || optionColors.includes(userRow.style.color))
            ) {
                this.myKirito.findStatus = FIND_STATUS.Found;
                userRow.click();
                return;
            }
            
        }
        this.domHelper.loadButtons();
        this.nextButton = this.domHelper.buttons['下一頁'];
        if (this.nextButton.disabled) {
            this.myKirito.findStatus = FIND_STATUS.NotFound;
            return;
        }
        this.nextButton.click();
        await sleep(3000 + random(5) * 1000);
        this.find();
    }
}