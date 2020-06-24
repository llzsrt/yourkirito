function generateHeaders(token: string) {
    return {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "token": token,
        "x-requested-with": "XMLHttpRequest"
    }
}

export async function getProfile(token: string, id: string = null) {
    const headers = generateHeaders(token);
    if(!!id) {
        const reponse = await fetch(`https://mykirito.com/api/profile/${id}`, {
            "headers": headers
        });
        return await reponse.json();
    } else {
        const reponse = await fetch("https://mykirito.com/api/my-kirito", {
            "headers": headers
        });
        return await reponse.json();
    }
}