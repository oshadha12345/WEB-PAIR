const express = require("express");
const router = express.Router();
const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    useMultiFileAuthState
} = require('@adiwajshing/baileys');
const fs = require('fs');
require('dotenv').config();

async function startPair() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const sock = makeWASocket({
        version,
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async update => {
        const { connection } = update;

        if (connection === 'open') {
            console.log("✅ WhatsApp connected!");

            // --- Read session files
            let sessionData = {};
            const files = fs.readdirSync('./session');

            files.forEach(f => {
                sessionData[f] = fs.readFileSync(`./session/${f}`, 'utf8');
            });

            // --- Convert to Base64 session ID
            const sessionID = Buffer.from(JSON.stringify(sessionData)).toString('base64');

            // --- Save session ID to .env
            let envData = fs.readFileSync(".env", "utf8");
            envData = envData.replace(/SESSION_ID=.*/g, `SESSION_ID=${sessionID}`);
            fs.writeFileSync(".env", envData);

            console.log("📌 SESSION_ID updated inside .env");

            // --- Send session to OWNER_NUMBER
            const owner = process.env.OWNER_NUMBER;
            if (owner) {
                await sock.sendMessage(`${owner}@s.whatsapp.net`, {
                    text: `🔐 *Your Session ID:*\n\n${sessionID}`
                });
                console.log("📨 Session ID sent to owner WhatsApp");
            } else {
                console.log("⚠️ OWNER_NUMBER missing in .env");
            }
        }
    });
}

// ROUTE
router.get('/', (req, res) => {
    res.send("PAIR system working… scan QR in console.");
    startPair();
});

module.exports = router;
