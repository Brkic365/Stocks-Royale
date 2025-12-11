const API_URL = 'http://localhost:4000/api';

async function run() {
    try {
        console.log("--- 1. REGISTER ---");
        const email = `api_debug_${Date.now()}@test.com`;
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'apidebug_new',
                email: email,
                password: 'password123'
            })
        });

        const text = await regRes.text();
        let regData;
        try {
            regData = JSON.parse(text);
        } catch (e) {
            console.log("Register Failed. Response:", text);
            return;
        }

        if (!regData.token) {
            console.log("No token in register response:", regData);
            return;
        }

        const token = regData.token;
        console.log("Token acquired.");

        console.log("--- 2. OPEN POSITION (10x) ---");
        const openRes = await fetch(`${API_URL}/positions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                stockSymbol: 'QLT',
                type: 'LONG',
                amount: 100,
                leverage: 10
            })
        });
        const openData = await openRes.json();
        console.log("Open Response:", JSON.stringify(openData, null, 2));

        console.log("--- 3. GET POSITIONS ---");
        const posRes = await fetch(`${API_URL}/positions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const posData = await posRes.json();
        console.log('\n--- RAW POSITIONS RESPONSE ---');
        console.log(JSON.stringify(posData, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
