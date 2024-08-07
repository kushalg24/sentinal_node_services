import fetch from 'node-fetch';

const TOKEN_URL = 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token';
const CLIENT_ID = "23b43d6f-2bbd-47b2-95be-5027d44d2d45";
const CLIENT_SECRET = "tWrGsKN93JHMVdi13aSnJTT0hPHV9y7y";

let token = null;
let tokenExpiryTime = 0;

async function generateToken() {
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch token');
    }

    const data = await response.json();
    token = data.access_token;
    tokenExpiryTime = Date.now() + data.expires_in * 1000;

    return token;
}

async function getToken() {
    if (!token || Date.now() >= tokenExpiryTime - 60000) { // Refresh token 1 minute before it expires
        token = await generateToken();
    }
    return token;
}

export { getToken };
