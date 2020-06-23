export async function getProfile(token: string, id: string = null) {
    if(!!id) {
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
    } else {
        const reponse = await fetch("https://mykirito.com/api/my-kirito", {
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