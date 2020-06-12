export function random(x) {
    return Math.floor(Math.random() * x) + 1;
};

export async function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
};

export function getNowSecond() {
    return Math.ceil(+(new Date()) / 1000);
}