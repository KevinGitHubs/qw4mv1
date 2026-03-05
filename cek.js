// functions/cek.js
const crypto = require('crypto');

// Ganti dengan endpoint cek ID yang sebenarnya
const API_ENDPOINT_CEK = 'https://api.vip-reseller.co.id/v1/cek-id'; // Contoh, sesuaikan!

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { game, userId, zoneId, server } = JSON.parse(event.body);

        if (!game || !userId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Data tidak lengkap' }) };
        }

        const API_ID = process.env.API_ID;
        const API_KEY = process.env.API_KEY;
        const STATIC_SIGN = process.env.STATIC_SIGN;

        if (!API_ID || !API_KEY || !STATIC_SIGN) {
            return { statusCode: 500, body: JSON.stringify({ error: 'Kredensial tidak tersedia' }) };
        }

        // Buat sign jika dinamis, di sini pakai static
        const sign = STATIC_SIGN;

        // Susun payload sesuai API
        const payload = {
            api_id: API_ID,
            api_key: API_KEY,
            sign: sign,
            game: game,
            user_id: userId,
            zone_id: zoneId || '',
            server: server || ''
        };

        const response = await fetch(API_ENDPOINT_CEK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, nickname: result.data.nickname })
            };
        } else {
            return {
                statusCode: 200, // tetap 200 agar frontend bisa baca error
                body: JSON.stringify({ success: false, error: result.message || 'Akun tidak ditemukan' })
            };
        }
    } catch (error) {
        console.error('Cek error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};