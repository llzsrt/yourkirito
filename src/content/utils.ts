export function random(x) {
    return Math.floor(Math.random() * x) + 1;
};

export async function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
};

export function getNowSecond() {
    return Math.ceil(+(new Date()) / 1000);
}

export function addButton(parentId, id, content) {
    const parent = document.getElementById(parentId);
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('id', id);
    button.innerHTML = content;
    return parent.appendChild(button);
}

export function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}