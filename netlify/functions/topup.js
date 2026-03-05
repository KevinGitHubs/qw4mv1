// functions/topup.js
const crypto = require('crypto');

const API_ENDPOINT_TOPUP = 'https://api.vip-reseller.co.id/v1/topup'; // Sesuaikan!

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { game, userId, zoneId, server, packId, diamonds, price, payment } = JSON.parse(event.body);

        if (!game || !userId || !packId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Data tidak lengkap' }) };
        }

        const API_ID = process.env.API_ID;
        const API_KEY = process.env.API_KEY;
        const STATIC_SIGN = process.env.STATIC_SIGN;

        if (!API_ID || !API_KEY || !STATIC_SIGN) {
            return { statusCode: 500, body: JSON.stringify({ error: 'Kredensial tidak tersedia' }) };
        }

        const sign = STATIC_SIGN;

        const payload = {
            api_id: API_ID,
            api_key: API_KEY,
            sign: sign,
            game: game,
            customer_id: userId,
            zone_id: zoneId || '',
            server: server || '',
            product_code: packId,
            payment_method: payment, // mungkin ada di API
            ref_id: `TRX-${Date.now()}`
        };

        const response = await fetch(API_ENDPOINT_TOPUP, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    transaction_id: result.data.trx_id || null,
                    message: 'Topup sedang diproses'
                })
            };
        } else {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: result.message || 'Gagal topup' })
            };
        }
    } catch (error) {
        console.error('Topup error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};