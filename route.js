/*

Module route.js

Le but de ce module est de simuler les routes des frameworks populaires.
Il exporte une fonction par défaut nécessaire à l'analyse des requêtes reçues afin de déterminer l'action à 
réaliser pour y répondre.

*/

"use strict";

// Import nécessaires pour le module
import {renderCSS, renderJS, renderWoff, renderWoff2} from "./controllers/general.js";
import {getFormLogin, login, getFormRegister, register, logout} from "./controllers/auth.js";
import {getAgenda, newAppointement, removeAppointement, readAppointementOfMonth, readAppointementOfWeek, setAppointement, readAppointementOfDay} from "./controllers/agenda.js";
import {getParametres, removeCalendar, setMDP } from "./controllers/parametres.js"; 
import {auth, guest} from "./middlewares.js";
import routerAPI from "./route_api.js";

// La fonction exportée par défaut qui analyse les requêtes (ou défini les routes)
export default async function router(request, response){

    if(request.url.split("/")[1] == "API"){

        routerAPI(request, response);

    // Si l'on a une route qui se termine par ".css" ou "css.map"
    } else if(request.url.substr(-4,4) == ".css" ||  request.url.substr(-8,4) == ".css"){
        // Si on cherche à accéder au dossier public
        if(request.url.split("/").indexOf("public") > -1){
            // On "retourne" dans la réponse le contenu du fichier css à l'emplacement de l'url de la requête
            renderCSS(request.url, response);
        }
    // Si l'on a une route qui se termine par ".js" ou ".js.map"
    } else if(request.url.substr(-3,3) == ".js" || request.url.substr(-7,3) == ".js"){
        // Si on cherche à accéder au dossier public
        if(request.url.split("/").indexOf("public") > -1){
            // On "retourne" dans la réponse le contenu du fichier js à l'emplacement de l'url de la requête
            renderJS(request.url, response);
        }
    // Si l'on a une route qui se termine par ".woff"
    } else if(request.url.substr(-5,5) == ".woff"){
        // Si on cherche à accéder au dossier public
        if(request.url.split("/").indexOf("public") > -1){
            // On "retourne" dans la réponse le contenu du fichier woff à l'emplacement de l'url de la requête
            renderWoff(request.url, response);
        }
    // Si l'on a une route qui se termine par ".woff2"
    } else if(request.url.substr(-6,6) == ".woff2"){
        // Si on cherche à accéder au dossier public
        if(request.url.split("/").indexOf("public") > -1){
            // On "retourne" dans la réponse le contenu du fichier woff2 à l'emplacement de l'url de la requête
            renderWoff2(request.url, response);
        }
    } else { // Si l'on a pas une route qui se termine par ".css" ou ".js" ou ".woff" ou ".woff2"
        // On analyse la valeur de l'url
        switch(request.url.split("?")[0]){
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
                // Si la méthode utilisé est GET, alors on affiche l'agenda de l'utilisateur s'il est connecté 
                // test de connexion préalable = fonction auth()
                // action d'affichage de l'agende = fonction getAgenda()
                if(request.method == "GET") auth(getAgenda, request, response);
                break;

            // Si elle est égale à "/accueil" (la page des agendas) 
            case "/accueil":
                // Si la méthode utilisé est GET, alors on affiche l'agenda de l'utilisateur s'il est connecté 
                // test de connexion préalable = fonction auth()
                // action d'affichage de l'agende = fonction getAgenda()
                if(request.method == "GET") auth(getAgenda, request, response);
                break;

            case "/parametres":
                if(request.method == "GET") auth(getParametres, request, response);
                if(request.method == "POST") auth(setMDP, request, response);
                break;
            case "/reset":
                if(request.method == "POST") auth(removeCalendar, request, response);
                break;

            // Si elle est égale à "/logout" 
            case "/logout":
                // Si la méthode utilisé est GET, alors on déconnecte l'utilisateur s'il est connecté 
                // test de connexion préalable = fonction auth()
                // action de déconnexion = logout()
                if(request.method == "GET") auth(logout, request, response);
                break;

            // Si elle est égale à "/appointement"
            case "/appointement":
                // Si la méthode utilisé est POST, alors on ajoute le nouveau rendez-vous si l'utilisateur est connecté 
                // test de connexion préalable = fonction auth()
                // action d'ajout = newAppointement()
                if(request.method == "POST") auth(newAppointement, request, response);

                // Si la méthode utilisé est DELETE, alors on supprime le rendez-vous si l'utilisateur est connecté 
                // test de connexion préalable = fonction auth()
                // action de suppresion = removeAppointement()
                if(request.method == "DELETE") auth(removeAppointement, request, response);
                break;

            // Si elle est égale à "/setAppointement"
            case "/setAppointement":
                // Si la méthode utilisé est POST, alors on modifie le rendez-vous si l'utilisateur est connecté 
                // test de connexion préalable = fonction auth()
                // action de modification = setAppointement()
                if(request.method == "POST") auth(setAppointement, request, response);
                break;
            // Si elle est égale à "/appointements"
            case "/appointements":
                // Si la méthode utilisé est GET, alors on retourne les rendez-vous de la semaine souhaité
                // si l'utilisateur est connecté 
                // test de connexion préalable = fonction auth()
                // action de lecteur = readAppointementOfWeek()
                if(request.method == "GET") auth(readAppointementOfWeek, request, response);
                break;
            case "/appointementsDay":
                if(request.method == "GET") auth(readAppointementOfDay, request, response);
                break;
            case "/appointementsMonth":
                if(request.method == "GET") auth(readAppointementOfMonth, request, response);
            // Si elle ne correspond à aucune des urls testées précédemment
            default:
                // On retourne une erreur 404
                response.writeHead(404, {'Content-Type': 'text/html'});
                response.end();
        }
    }
}
