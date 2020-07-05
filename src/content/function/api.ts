function generateHeaders(token: string) {
    return {
        "accept": "application/json, text/plain, */*",
        "x-requested-with": "XMLHttpRequest",
        "token": token
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