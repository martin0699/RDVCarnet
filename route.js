/*

Module route.js

Le but de ce module est de simuler les routes des frameworks populaires.
Il exporte une fonction par défaut nécessaire à l'analyse des requêtes reçues afin de déterminer l'action à 
réaliser pour y répondre.

*/

"use strict";

// Import nécessaires pour le module
import {renderCSS} from "./controllers/general.js";
import {getFormLogin, login, getFormRegister, register, logout} from "./controllers/auth.js";
import {getAgenda} from "./controllers/agenda.js";
import {auth, guest} from "./middlewares.js";


// La fonction exportée par défaut qui analyse les requêtes (ou défini les routes)
export default async function router(request, response){

    // Si l'on a une route qui se termine par ".css"
    if(request.url.substr(-4,4) == ".css"){
        // On "retourne" dans la réponse le contenu du fichier css à l'emplacement de l'url de la requête
        renderCSS(request.url, response);
    } else { // Si l'on a pas une route qui se termine par ".css"
        
        // On analyse la valeur de l'url
        switch(request.url){

            // Si elle est égale à "/login"
            case "/login":
                // Si la méthode utilisé est GET, alors on affiche le formulaire de connexion
                // On s'assure avant que l'utilisateur est bien déconnecté (fonction guest()) 
                // action d'affichage du formulaire = fonction getFormLogin()
                if(request.method == "GET") guest(getFormLogin, request, response);

                // Si la méthode utilisé est POST, alors on doit gérer la soumission du formulaire de connexion
                // On s'assure avant que l'utilisateur est bien déconnecté (fonction guest()) 
                // action de gestion de la soumission = fonction login()
                if(request.method == "POST") guest(login, request, response);
                break;
            
            // Si elle est égale à "/register"
            case "/register":
                // Si la méthode utilisé est GET, alors on affiche le formulaire d'inscription
                // On s'assure avant que l'utilisateur est bien déconnecté (fonction guest()) 
                // action d'affichage du formulaire = fonction getFormRegister()
                if(request.method == "GET") guest(getFormRegister, request, response);

                // Si la méthode utilisé est POST, alors on doit gérer la soumission du formulaire d'inscription
                // On s'assure avant que l'utilisateur est bien déconnecté (fonction guest()) 
                // action de gestion de la soumission = fonction register()
                if(request.method == "POST") guest(register, request, response);
                break;

            // Si elle est égale à "/" (la racine)
            case "/":
                // Si la méthode utilisé est GET, alors on affiche l'agende de l'utilisateur s'il est connecté 
                // test de connexion préalable = fonction auth()
                // action d'affichage de l'agende = fonction getAgenda()
                if(request.method == "GET") auth(getAgenda, request, response);
                break;

            // Si elle est égale à "/logout" 
            case "/logout":
                // Si la méthode utilisé est GET, alors on déconnecte l'utilisateur s'il est connecté 
                // test de connexion préalable = fonction auth()
                // action de déconnexion = logout()
                if(request.method == "GET") auth(logout, request, response);
                break;

            // Si elle ne correspond à aucune des urls testées précédemment
            default:
                // On retourne une erreur 404
                response.writeHead(404, {'Content-Type': 'text/html'});
                response.end();
        }
    }
}
