const express = require("express");
const path = require("path");
const fs = require("fs");
const config = require("./config/env")
const { QuickDB } = require("quick.db");
const cookieParser = require("cookie-parser");
const authGuardMiddleWare = require("./middleware/authGuardMiddleWare");
const loadingMiddleWare = require("./middleware/loadingMiddleWare");

const { generateRandomToken } = require("./services/tokensService");


// Initialiser Quick.DB
const dbFilePath = path.join(__dirname, "data/database.sqlite");
const db = new QuickDB({ filePath: dbFilePath });

const app = express();
const PORT = config.port;

// Configurer le moteur de template EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Servir les fichiers statiques (CSS, JS, Vidéos)
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
// Middleware pour parser les requêtes POST (formulaires & JSON)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Charger dynamiquement toutes les routes depuis ./routes
const routesPath = path.join(__dirname, "routes");
const hostedServicePath = path.join(__dirname, "hostedService");

fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith(".js")) {
        const route = require(`./routes/${file}`);
        app.use("/", route);
    }
});


fs.readdirSync(hostedServicePath).forEach((file) => {
    if (file.endsWith(".js")) {
        const hostedService = require(`./hostedService/${file}`);
        hostedService.run()
    }
});

app.listen(PORT, async () => {
    console.log(`🚀 Serveur démarré sur ${config.url}`);

    // Ajouter un token admin par défaut si aucun n'existe
    let tokens = await db.get("tokens") || [];
    if (tokens.length === 0) {
        generateRandomToken(true);
    }
});

