/*

Module route.js

Le but de ce module est de simuler les routes des frameworks populaires.
Il exporte une fonction par défaut nécessaire à l'analyse des requêtes reçues afin de déterminer l'action à 
réaliser pour y répondre.
Dans le cas de ce fichier, on gère les routes de l'API uniquement.s

*/

"use strict";

import { authAPI } from "./middlewares.js";
import { noRoute, loginAPI, registerAPI, getAppointementsAPI, getAppointementAPI, removeAppointementAPI, updateAppointementAPI, addAppointementAPI } from "./controllers/api.js";

export default async function routerAPI(request, response){

    switch(request.url.split("?")[0]){
        case "/API/login":
            if(request.method == "POST") loginAPI(request, response);
            break;
        case "/API/register":
            if(request.method == "POST") registerAPI(request, response);
            break;
        case "/API/appointements":
            if(request.method == "GET") authAPI(getAppointementsAPI, request, response);
            break;
        case "/API/appointement":
            if(request.method == "GET") authAPI(getAppointementAPI, request, response);
            if(request.method == "POST") authAPI(addAppointementAPI, request, response);
            if(request.method == "PATCH") authAPI(updateAppointementAPI, request, response);
            if(request.method == "DELETE") authAPI(removeAppointementAPI,request, response);
            break;
        default:
            noRoute(response);
    }
}
