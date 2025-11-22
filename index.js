require("dotenv").config();
const express = require('express');
const bodyParser = require("body-parser");
const fs = require("fs");
const __path = process.cwd();
const PORT = process.env.PORT || 8000;

// --- Create .env if missing (empty values)
if (!fs.existsSync("./.env")) {
    fs.writeFileSync("./.env",
`MEGA_EMAIL=
MEGA_PASSWORD=
OWNER_NUMBER=
SESSION_ID=
`);
    console.log("⚠️ .env missing → Created new one.");
    console.log("➡️ Please fill MEGA_EMAIL, MEGA_PASSWORD, OWNER_NUMBER and run again.");
    process.exit();
}

const app = express();
const pairRouter = require('./pair');
app.use('/code', pairRouter);

app.get('/', async (req, res) => {
    res.sendFile(__path + '/pair.html');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`⏩ Server running at http://localhost:${PORT}`);
});

module.exports = app;
