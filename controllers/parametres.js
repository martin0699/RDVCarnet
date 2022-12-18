/*

Module parameyre.js

Le but de ce module est de simuler un controller en exportant toutes les fonctions nécessaires 
pour le traitement mais aussi les actions conséquantes, celles pour les requêtes en rapport avec les paramètres

*/

import { deleteAllAppointement } from "../models/calendars/calendars.js";
import { changeMDP, isExist } from "../models/users/users.js";
import { renderHTML, renderHTMLWithErreurs, renderHTMLWithNotif, readStream } from "./general.js";

export function getParametres(request, response){
    let param = request.url.split("?");

    
    if(param.length == 2){
        param = param[1].split("=");
        if(param.length == 2){
            if(param[0] == "reset"){
                if(param[1] == "true"){
                    renderHTMLWithNotif("/parametres/parametres", response, "Le calendrier a bien été remis à zéro !");
                    return;
                } else if(param[1] == "false") {
                    renderHTMLWithErreurs("/parametres/parametres", response, ["Le calendrier ne peut pas être remis à jour !"]);
                    return;
                }
            }
        }
    }

    renderHTML("/parametres/parametres", response); // On "retourne" la page calendar.html dans la réponse
}

export function removeCalendar(request, response, user){

    if(deleteAllAppointement(user)){
        // On retourne maintenant une reponse de redirection vers la page d'accueil des agendas
        response.writeHead(302, {
            'Location': '/parametres?reset=true'
        });
        response.end();    
    } else {
        // On retourne maintenant une reponse de redirection vers la page d'accueil des agendas
        response.writeHead(302, {
            'Location': '/parametre?reset=false'
        });
        response.end();    
    }

}

export async function setMDP(request, response, user){

    // Récupération des données transmises dans le corp de la requête
    let body = await readStream(request); // Utilisation de la fonction vu dans le CM5 pour analyser le corp

    // Les champs étant séparés par des '&' dans le Buffer, on le sépare en quatres tableaux avec ce séparateur
    body = body.split("&");

    if(body.length != 3){

        renderHTMLWithErreurs("/parametres/parametres", response, ["Tous les champs attendus n'ont pas été transmis !"]);
        return;
    }

    let mdp = body[0].split("=");
    let new_mdp = body[1].split("=");
    let retape_mdp = body[2].split("=");

    if(mdp[0] != "mdp" || new_mdp[0] != "new_mdp" || retape_mdp[0] != "retape_mdp"){
        renderHTMLWithErreurs("/parametres/parametres", response, ["Tous les champs attendus n'ont pas été transmis !"]);
        return;
    }

    mdp = mdp[1];
    new_mdp = new_mdp[1];
    retape_mdp = retape_mdp[1];


    if(isExist(user, mdp) == -1){
        renderHTMLWithErreurs("/parametres/parametres", response, ["Le mot de passe actuel n'est pas correct !"]);
        return;
    }

    if(new_mdp.length < 6){
        renderHTMLWithErreurs("/parametres/parametres", response, ["Le nouveau mot de passe doit faire 6 caractères au minium !"]);
        return;
    }

    if(new_mdp != retape_mdp){
        renderHTMLWithErreurs("/parametres/parametres", response, ["Les deux saisies du nouveau mot de passe ne correspondent pas !"]);
        return;
    }
    
    if(changeMDP(user, new_mdp)){
        renderHTMLWithNotif("/parametres/parametres", response, "Le mot de passe a bien été modifié !");
    } else {
        renderHTMLWithErreurs("/parametres/parametres", response, ["Impossible de changer le mot de passe de l'utilisateur !"]);
    }
    
}