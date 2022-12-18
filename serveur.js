/*

Script serveur.js

Le but de ce script est de créer et démarrer un serveur node.js local, en écoute sur le port 8500.

*/

"use strict";

// Imports nécessaire au script
import { createServer } from "http";
import router from "./route.js";
import dotenv from "dotenv";

dotenv.config();

// Création du serveur avec une fonction de paramètrage pour gérer les requêtes
let server = createServer((request, response) => { 

    // Appelle de la fonction du module de routage pour déterminer quelme fonction de contrôle appellée suivant
    // l'url et la méthode de la requête
    router(request, response);
    
});

server.listen(process.env.PORT); // Ecoute sur le port
console.log("Serveur lancé.");