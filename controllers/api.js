/*

Module agenda.js

Le but de ce module est de simuler un controller en exportant toutes les fonctions nécessaires 
pour le traitement mais aussi les actions conséquantes, celles pour les requêtes en rapport avec l'API

*/

"use strict";

import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { readStream } from "./general.js"
import { isExist, isUnique, addUser} from "../models/users/users.js";
import { deleteAppointement, readAppointement, addCalendar, addAppointment, updateAppointement, readDayOfCalendar, readWeekOfCalendar, readMonthOfCalendar, hasCalendar, estOccupee, estOccupeeModif } from "../models/calendars/calendars.js";

export function noRoute(response){

    // On retourne une réponse de type JSON indiquant l'erreur
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
    response.write(JSON.stringify({
        "code": "Erreur", 
        "description": "La route spécifiée n'est pas définie!"
    }));
    response.end();

}

export async function loginAPI(request, response){

    // Récupération des données transmises dans le corp de la requête
    let body = await readStream(request); // Utilisation de la fonction vu dans le CM5 pour analyser le corp
    
    // Les champ étant séparer par des '&' dans le Buffer, on le sépare en deux tableaux avec ce séparateur
    body = body.split("&"); 

    if(body.length != 2){
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attendus n'ont pas été transmis!"
        }));
        response.end();
        return;
    }

    // Les champs étant de la forme nom=valeur, on les segmentent en 2 tableaux sur le séparateur '='
    body[0] = body[0].split("=");
    body[1] = body[1].split("=");

    // Si l'on a pas les deux nom de champs attendus
    if(body[0][0] != "id" || body[1][0] != "mdp"){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attendus n'ont pas été transmis!"
        }));
        response.end();
        return; // On utilise return pour stopper l'exécution de la fonction (on vient de répondre au client)
    }

    // On peut maintenant récupérer les deux valeurs saisies dans les champs
    let ident = body[0][1];
    let mdp = body[1][1];

    // On test s'il existe une position dans la collection de données où on retrouve ces valeurs 
    let i = isExist(ident, mdp); // return -1 si n'existe pas
    
    if(i>=0){ // Si le couple ident/mdp existe dans les données de l'application

        dotenv.config(); // Initialisation de l'accès au .env

        // Création d'un JWT contenant l'identifiant de l'utilisateur
        // La clef utilisée est une phrase choisie généré en base64 de préférence (pour assurer la sécurité)
        let token = jwt.sign({"id": ident}, process.env.TOKEN_KEY, {expiresIn: 7200}); // Durée de validité 2h

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "OK", 
            "description": "L'authentification s'est dérouléé avec succes !",
            "token": token
        }));
        response.end();    
        
    } else { // Si le couple ident/mdp n'existe pas dans les données de l'application

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Les informations renseignées correspondent avec aucun compte !"
        }));
        response.end();
    }


}

export async function registerAPI(request, response){

    // Récupération des données transmises dans le corp de la requête
    let body = await readStream(request); // Utilisation de la fonction vu dans le CM5 pour analyser le corp

    // Les champ étant séparer par des '&' dans le Buffer, on le sépare en trois tableaux avec ce séparateur
    body = body.split("&");

    if(body.length != 3){
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attendus n'ont pas été transmis!"
        }));
        response.end();
        return;
    }

    // Les champs étant de la forme nom=valeur, on les segmentent en 2 tableaux sur le séparateur '='
    body[0] = body[0].split("=");
    body[1] = body[1].split("=");
    body[2] = body[2].split("=");

    // Si l'on a pas les trois nom de champs attendus
    if(body[0][0] != "id" || body[1][0] != "mdp" || body[2][0] != "retape_mdp"){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attendus n'ont pas été transmis!"
        }));
        response.end();
        return;
    }

    // On peut maintenant récupérer les deux valeurs saisies dans les champs
    let ident = body[0][1];
    let mdp = body[1][1];
    let retape_mdp = body[2][1];

    // Déclaration et initialisation d'un nouveau tableau pour les erreurs
    let erreurs = [];

    // Si la taille de l'identifiant n'est pas comprise entre 3 et 10 inclus
    if(ident.length < 3 || ident.length > 10){
        // On ajout l'html pour l'erreur dans le tableau des erreurs
        erreurs.push("La taille de l'identifiants doit être comprise entre 3 et 10 caractères inclus !");
    }

    // Si l'identifiant ne contient pas que des caractères alphanumériques
    if(!ident.match(/^[0-9a-z]+$/i)){
        // On ajout l'html pour l'erreur dans le tableau des erreurs
        erreurs.push("L'identifiant doit contenir que des caractères de type alphanumérique!");
    }

    // Si la taille du mot de passe est inférieure à 6
    if(mdp.length < 6){
        // On ajout l'html pour l'erreur dans le tableau des erreurs
        erreurs.push("Le mot de passe doit faire un minimum 6 caractères!");
    }

    // Si on a au moins une erreur
    if(erreurs.length > 0){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": erreurs
        }));
        response.end();
        return;
    }

    // Si l'identifiant est unique (obligatoire pour différencier les utilisateurs)
    if(isUnique(ident)){

        // Si les deux saisies de mot de passe sont égaux
        if(mdp == retape_mdp){
            
            // On ajout les données du nouvelle utilisateur dans celles de l'application
            addUser(ident, mdp);
    
            dotenv.config(); // Initialisation de l'accès au .env

            // Création d'un JWT contenant l'identifiant de l'utilisateur
            // La clef utilisée est une phrase choisie généré en base64 de préférence (pour assurer la sécurité)
            let token = jwt.sign({"id": ident}, process.env.TOKEN_KEY, {expiresIn: 7200}); // Durée de validité 2h

           // On retourne une réponse de type JSON indiquant l'erreur
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
            response.write(JSON.stringify({
                "code": "OK", 
                "description": "L'inscription s'est déroulée avec success!",
                "token": token
            }));
            response.end();
            return;
        
        } else { // Si les deux saisies de mot de passe ne sont pas égaux

            // On retourne une réponse de type JSON indiquant l'erreur
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
            response.write(JSON.stringify({
                "code": "Erreur", 
                "description": "Les deux saisies de mot de passe doivent être identiques !"
            }));
            response.end();
            return;
        }

    } else { // Si il existe déjà un utilisateur avec cette identifiant
        
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Le champ id est déjà utilisé !"
        }));
        response.end();
        return;

    }

}

export function getAppointementAPI(request, response, user){

    // On divise l'url de la requête sur le séparateur "?"
    let params = request.url.split("?");
    
    // On divise la partie contenant les paramètres de requête avec le séparateur "&"
    params = params[1].split("&");

    if(params.length != 1){
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attendus n'ont pas été transmis !"
        }));
        response.end();
        return;
    }

    params = params[0].split("=");
    
    if(params[0] != "id"){
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attendus n'ont pas été transmis !"
        }));
        response.end();
        return;
    }

    let id = params[1];

    if(id < 0){
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "L'identifiant doit être suprérieur à 1 !"
        }));
        response.end();
        return;
    }

    let rdv;

    if((rdv = readAppointement(user, id)) != false){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "OK", 
            "description": "Le rendez-vous a bien été récupéré!",
            "rendezVous": rdv 
        }));
        response.end();
        return;

    } else {
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Aucun rendez-vous comporte l'identifiant spécifié!"
        }));
        response.end();
        return;
    }

}

export function getAppointementsAPI(request, response, user){

    // On divise l'url de la requête sur le séparateur "?"
    let params = request.url.split("?");
    
    // On divise la partie contenant les paramètres de requête avec le séparateur "&"
    params = params[1].split("&");
    let jours = false;
    let semaines = false;
    let mois = false;
    let dayNumber;

    if(params.length == 2){

        mois = true;

    } else if(params.length == 3) {

        dayNumber = params[0].split("=");

        if(dayNumber[0] == "day"){

            jours = true;
            dayNumber = dayNumber[1];

        } else if(dayNumber[0] == "monday"){
            
            semaines = true;
            dayNumber = dayNumber[1];
        }
    }

    if(!jours && !semaines && !mois){
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attddendus n'ont pas été transmis !"
        }));
        response.end();
        return;
    }

    let monthNumber, yearNumber;

    if(mois){
        // On récupère divise les deux paramètres sur le séparateur "="
        monthNumber = params[0].split("=");
        yearNumber = params[1].split("=");
    } else {
        // On récupère divise les deux paramètres sur le séparateur "="
        monthNumber = params[1].split("=");
        yearNumber = params[2].split("=");
    }
 
    // Si au moins un des nom des deux paramètres n'est pas celui attendus
    if(monthNumber[0] != "month" || yearNumber[0] != "year"){
 
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs atteeeendus n'ont pas été transmis !"
        }));
        response.end();
    }
 
    // on peut maintenant récupérer uniquement les valeurs des paramètres
    monthNumber = monthNumber[1];
    yearNumber = yearNumber[1];
 
    // Si le numéro du mois n'est pas compris entre 1 et 12 inclut, ou bien que l'année est inférieure à 1970
    if((monthNumber>12 || monthNumber < 1) || yearNumber<1970){
         
        // On retourne une réponse de type JSON expliquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Les données reçues dans la requête ne sont pas au format attendu !"
        }));
        response.end();
 
        return; // on utilise return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
    }
    
    let rendezVous = [];

    // Si l'utilisateur a un calendrier
    if(hasCalendar(user)){

        if(jours){
            // On récupère les rendez-vous concernant la semaine dans son calendrier
            rendezVous = readDayOfCalendar(user, dayNumber, monthNumber, yearNumber);
        } else if(semaines){
            rendezVous = readWeekOfCalendar(user, dayNumber, monthNumber, yearNumber);
        } else {
            rendezVous = readMonthOfCalendar(user, monthNumber, yearNumber);
        }
    }

    // On prépare l'objet JSON de retour, avec comme code OK pour dire que l'action s'est bien passée.
    // On y ajoute aussi le tableau des rendez-vous de la semaine en question 
    let retour = {
        "code": "OK",
        "description": "Les rendez-vous ont bien été recupérés !",
        "rendezVous": rendezVous
    };

    // On effectue une réponse de type JSON au client, qui contient l'objet JSON de retour
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
    response.write(JSON.stringify(retour));
    response.end();
}

export async function removeAppointementAPI(request, response, user){

    // On divise l'url de la requête sur le séparateur "?"
    let params = await readStream(request);
    
    // On divise la partie contenant les paramètres de requête avec le séparateur "&"
    params = params.split("&");

    if(params.length != 1){
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attendus n'ont pas été transmis !"
        }));
        response.end();
        return;
    }

    params = params[0].split("=");
    
    if(params[0] != "id"){
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attendus n'ont pas été transmis !"
        }));
        response.end();
        return;
    }

    let id = params[1];

    if(id < 0){
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "L'identifiant doit être suprérieur à 1 !"
        }));
        response.end();
        return;
    }

    if(deleteAppointement(user, id)){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "OK", 
            "description": "Le rendez-vous a bien été supprimé!"
        }));
        response.end();
        return;

    } else {
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Aucun rendez-vous comporte l'identifiant spécifié!"
        }));
        response.end();
        return;
    }

}

export async function addAppointementAPI(request, response, user){

    // Récupération des données transmises dans le corp de la requête
    let body = await readStream(request); // Utilisation de la fonction vu dans le CM5 pour analyser le corp

    // Les champs étant séparés par des '&' dans le Buffer, on le sépare en quatres tableaux avec ce séparateur
    body = body.split("&");

    let test = true;

    // Si les données reçus sont bien au nombre de 6 comme attendu
    if(body.length == 6){

        // Les champs étant de la forme nom=valeur, on les segmentent en 2 tableaux sur le séparateur '='
        body[0] = body[0].split("=");
        body[1] = body[1].split("=");
        body[2] = body[2].split("=");
        body[3] = body[3].split("=");
        body[4] = body[4].split("=");
        body[5] = body[5].split("=");

    } else { // Si on a moins de 6 données
        test = false;
    }

    // Si l'on a pas les six noms de champs attendus écrit correctement
    if(!test || body[0][0] != "titre" || body[1][0] != "dateDebut" || body[2][0] != "timeDebut" || body[3][0] != "dateFin"
        || body[4][0] != "timeFin" || body[5][0] != "lieu"){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attendus n'ont pas été transmis !"
        }));
        response.end();
        return;
    }

    // On peut maintenant récupérer uniquement les six valeurs saisies dans les champs
    let titre = body[0][1];
    let dateDebut = body[1][1];
    let timeDebut = body[2][1];
    let dateFin = body[3][1];
    let timeFin = body[4][1];
    let lieu = body[5][1];

    // Déclaration d'un tableau pour stockées les futurs erreurs rencontrées
    let errors = [];

    // On sépare les chaînes de caractères des deux dates avec le séparateur "-" (format: 2022-11-25)  
    dateDebut = dateDebut.split("%2F");
    dateFin = dateFin.split("%2F");

    // On sépare les chaînes de caractères des deux heures avec le séparateur ":" (format: 08:00 (= 08h00))
    timeDebut = timeDebut.split("%3A");
    timeFin = timeFin.split("%3A");

    // Si la taille du titre n'est pas comprise entre 3 et 20 caractères inclus
    if(titre.length < 3 || titre.length > 20){

        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("Le champ titre/description doit faire entre 3 et 20 caractères inclus !");
    }

    // Si la date de début est bien composé de 3 nombres, que le premier est composé de 4 chiffres (les années),
    // et que les deux autres sont composés de 2 chiffres (mois et jours)
    if(dateDebut.length != 3 || !dateDebut[0].match(/^[0-9][0-9][0-9][0-9]$/i) 
        || !dateDebut[1].match(/^[0-9][0-9]$/i) || !dateDebut[2].match(/^[0-9][0-9]$/i)){

        // On ajoute un decriptif de l'erreur dans le tableau
        errors.push("La date de début n'est pas au format attendu !");
    }

    // Si l'heure de début est bien composé de 2 nombres, et qu'ils sont composés de 2 chiffres chacun (heure et minute)
    if(timeDebut.length != 2 || !timeDebut[0].match(/^[0-9][0-9]$/i) || !timeDebut[1].match(/^[0-9][0-9]$/i)){

        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("L'heure de début n'est pas au format attendu !");
    }

    // Si la date de fin est bien composé de 3 nombres, que le premier est composé de 4 chiffres (les années),
    // et que les deux autres sont composés de 2 chiffres (mois et jours)
    if(dateFin.length != 3 || !dateFin[0].match(/^[0-9][0-9][0-9][0-9]$/i) 
        || !dateFin[1].match(/^[0-9][0-9]$/i) || !dateFin[2].match(/^[0-9][0-9]$/i)){
        
        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("La date de fin n'est pas au format attendu !");

    }

    // Si l'heure de fin est bien composé de 2 nombres, et qu'ils sont composés de 2 chiffres chacun (heure et minute)
    if(timeFin.length != 2 || !timeFin[0].match(/^[0-9][0-9]$/i) || !timeFin[1].match(/^[0-9][0-9]$/i)){

        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("L'heure de fin n'est pas au format attendu !");
    }

    // Si l'année de début ou l'année de fin sont inférieures à 1970
    if(dateDebut[0] < 1970 || dateFin[0] < 1970){
    
        // on ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les années de début et de fin doivent être supérieures à 1970 !");
    }

    // Si le mois de début ou le mois de fin sont inférieures à 1, ou supérieur à 12
    if(dateDebut[1] < 1 || dateFin[1] < 1 || dateDebut[1] > 12 || dateFin[1] > 12){
    
        // On ajoute une erreur expliquant le problème dans le tableau des erreurs 
        errors.push("Les mois de début et de fin doivent être compris entre 1 et 12 !");
    }

    // Si l'heure de début ou l'heure de fin ne sont pas comprises entre 0 et 23 inclut
    if(timeDebut[0] < 0 || timeFin[0] < 0 || timeDebut[0] > 23 || timeFin[0] > 23){

        // On ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les heures de début et de fin doivent être comprises entre 0 et 23 !");
    }

    // Si la minute de début ou la minute de fin ne sont pas comprises entre 0 et 59 inclut
    if(timeDebut[1] < 0 || timeFin[1] < 0 || timeDebut[1] > 59 || timeFin[1] > 59){

        // On ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les minutes de début et de fin doivent être comprises entre 0 et 59 !");
    }

    // Si le jour de début ou le jour de fin sont inférieurs à 0
    if(dateDebut[3] < 1 || dateFin[3] < 1){

        // On ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les jours de début et de fin doivent être supérieurs à 0 !");
    }

    // On récupère le nombre de jour du mois de début du rendez-vous
    let nbJoursMoisDebut = new Date(dateDebut[0], dateDebut[1], 0).getDate();
    // On récupère le nombre de jour du mois de fin du rendez-vous
    let nbJoursMoisFin = new Date(dateFin[0], dateFin[1], 0).getDate();

    // Si le jour de début est supérieur au nombre de jour du mois de début,
    // ou si le jour de fin est supérieur au nombre de jour du mois de fin
    if(dateDebut[3] > nbJoursMoisDebut || dateFin[3] > nbJoursMoisFin){

        // On ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les jours de début et de fin ne doivent pas dépassé le nombre de jours du mois concerné !");
    }

    // On crée les deux objets Date symbolisant les dates et heures de début et de fin
    let objetDateDebut = new Date(dateDebut[0], dateDebut[1]-1, dateDebut[0], timeDebut[0], timeDebut[1], 0);
    let objetDateFin = new Date(dateFin[0], dateFin[1]-1, dateFin[0], timeFin[0], timeFin[1], 0);

    // Si la date de début est inférieure ou égale à la date de fin
    if(objetDateFin <= objetDateDebut){

        // On ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("La date de fin du rendez-vous doit être supérieure à celle du début !");
    }

    // Si la taille du lieu est comprise entre 2 et 15 inclus
    if(lieu.length < 2 || lieu.length > 15){

        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("Le champ lieu doit faire entre 2 et 15 caractères inclus !");
    }

    // Si on a au moins une erreur
    if(errors.length > 0){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": errors
        }));
        response.end();
        return;
    }

    // Si la plage du rendez-vous à ajouter est déjà utilisé par un autre rendez-vous
    if(estOccupee(user, 
    dateDebut[2]+"/"+dateDebut[1]+"/"+dateDebut[0]+" "+timeDebut[0]+"h"+timeDebut[1],
    dateFin[2]+"/"+dateFin[1]+"/"+dateFin[0]+" "+timeFin[0]+"h"+timeFin[1])){
        
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Vous avez déjà un autre rendez-vous durant cette plage horaire !"
        }));
        response.end();
        return;  
    }

    // Si l'utilisateur n'as pas encore de calendrier
    if(!hasCalendar(user)){
        addCalendar(user); // On ajoute un calendrier vide au nom de l'utilisateur
    }

    // On ajoute le nouveau rendez-vous avec les données reçues, en reformatant les dates et heures comme souhaité
    if(addAppointment(user, titre, lieu, 
        dateDebut[2]+"/"+dateDebut[1]+"/"+dateDebut[0]+" "+timeDebut[0]+"h"+timeDebut[1],
        dateFin[2]+"/"+dateFin[1]+"/"+dateFin[0]+" "+timeFin[0]+"h"+timeFin[1])){ // Si l'ajout réussi

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "OK", 
            "description": "L'ajout du rendez-vous a été réalisé avec succes !"
        }));
        response.end();

    } else { // Sinon, si l'ajout ne réussit pas

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Impossible d'ajouter ce nouveau rendez-vous !"
        }));
        response.end();
    }
}

export async function updateAppointementAPI(request, response, user){
    // Récupération des données transmises dans le corp de la requête
    let body = await readStream(request); // Utilisation de la fonction vu dans le CM5 pour analyser le corp

    // Les champs étant séparés par des '&' dans le Buffer, on le sépare en quatres tableaux avec ce séparateur
    body = body.split("&");

    let test = true;

    // Si les données reçus sont bien au nombre de 6 comme attendu
    if(body.length == 7){

        // Les champs étant de la forme nom=valeur, on les segmentent en 2 tableaux sur le séparateur '='
        body[0] = body[0].split("=");
        body[1] = body[1].split("=");
        body[2] = body[2].split("=");
        body[3] = body[3].split("=");
        body[4] = body[4].split("=");
        body[5] = body[5].split("=");
        body[6] = body[6].split("=");

    } else { // Si on a moins de 6 données
        test = false;
    }

    // Si l'on a pas les six noms de champs attendus écrit correctement
    if(!test || body[0][0] != "id" || body[1][0] != "titre" || body[2][0] != "dateDebut" || body[3][0] != "timeDebut" 
        || body[4][0] != "dateFin" || body[5][0] != "timeFin" || body[6][0] != "lieu"){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Tous les champs attendus n'ont pas était transmis !"
        }));
        response.end();
        return; // On utilise return pour stopper l'exécution de la fonction (on vient de répondre au client)
    }

    // On peut maintenant récupérer uniquement les six valeurs saisies dans les champs
    let id = body[0][1]
    let titre = body[1][1];
    let dateDebut = body[2][1];
    let timeDebut = body[3][1];
    let dateFin = body[4][1];
    let timeFin = body[5][1];
    let lieu = body[6][1];

    // Déclaration d'un tableau pour stockées les futurs erreurs rencontrées
    let errors = [];

    // On sépare les chaînes de caractères des deux dates avec le séparateur "-" (format: 2022-11-25)  
    dateDebut = dateDebut.split("%2F");
    dateFin = dateFin.split("%2F");

    // On sépare les chaînes de caractères des deux heures avec le séparateur ":" (format: 08:00 (= 08h00))
    timeDebut = timeDebut.split("%3A");
    timeFin = timeFin.split("%3A");

    // Si la valeur du paramètre id reçu est inférieure à 0
    if(id<0){

        // On ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("L'id du rendez-vous fournit est incohérent !");
    }

    // Si la taille du titre n'est pas comprise entre 3 et 20 caractères inclus
    if(titre.length < 3 || titre.length > 20){

        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("Le champ titre/description doit faire entre 3 et 20 caractères inclus !");
    }

    // Si la date de début est bien composé de 3 nombres, que le premier est composé de 4 chiffres (les années),
    // et que les deux autres sont composés de 2 chiffres (mois et jours)
    if(dateDebut.length != 3 || !dateDebut[0].match(/^[0-9][0-9][0-9][0-9]$/i) 
        || !dateDebut[1].match(/^[0-9][0-9]$/i) || !dateDebut[2].match(/^[0-9][0-9]$/i)){

            // On ajoute un decriptif de l'erreur dans le tableau
            errors.push("La date de début n'est pas au format attendu !");
    }

    // Si l'heure de début est bien composé de 2 nombres, et qu'ils sont composés de 2 chiffres chacun (heure et minute)
    if(timeDebut.length != 2 || !timeDebut[0].match(/^[0-9][0-9]$/i) || !timeDebut[1].match(/^[0-9][0-9]$/i)){

        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("L'heure de début n'est pas au format attendu !");
    }

    // Si la date de fin est bien composé de 3 nombres, que le premier est composé de 4 chiffres (les années),
    // et que les deux autres sont composés de 2 chiffres (mois et jours)
    if(dateFin.length != 3 || !dateFin[0].match(/^[0-9][0-9][0-9][0-9]$/i) 
        || !dateFin[1].match(/^[0-9][0-9]$/i) || !dateFin[2].match(/^[0-9][0-9]$/i)){
            
            // On ajoute un descriptif de l'erreur dans le tableau
            errors.push("La date de fin n'est pas au format attendu !");

    }

    // Si l'heure de fin est bien composé de 2 nombres, et qu'ils sont composés de 2 chiffres chacun (heure et minute)
    if(timeFin.length != 2 || !timeFin[0].match(/^[0-9][0-9]$/i) || !timeFin[1].match(/^[0-9][0-9]$/i)){

        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("L'heure de fin n'est pas au format attendu !");
    }

    // Si l'année de début ou l'année de fin sont inférieures à 1970
    if(dateDebut[0] < 1970 || dateFin[0] < 1970){
        // On ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les années de début et de fin doivent être supérieures à 1970 !");
    }
    
    // Si le mois de début ou le mois de fin ne sont pas inclut dans l'interval [1,12]
    if(dateDebut[1] < 1 || dateFin[1] < 1 || dateDebut[1] > 12 || dateFin[1] > 12){
        // On ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les mois de début et de fin doivent être compris entre 1 et 12 !");
    }
    
    // Si l'heure de début ou l'heure de fin ne sont pas inclut dans l'interval [0,23]
    if(timeDebut[0] < 0 || timeFin[0] < 0 || timeDebut[0] > 23 || timeFin[0] > 23){
        // on ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les heures de début et de fin doivent être comprises entre 0 et 23 !");
    }
    
    // Si la minute de début ou la minute de fin ne sont pas inclut dans l'interval [0,59]
    if(timeDebut[1] < 0 || timeFin[1] < 0 || timeDebut[1] > 59 || timeFin[1] > 59){
        // on ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les minutes de début et de fin doivent être comprises entre 0 et 59 !");
    }
    
    // Si le jour de début ou le jour de fin sont inférieurs à 1
    if(dateDebut[3] < 1 || dateFin[3] < 1){
        // on ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les jours de début et de fin doivent être supérieurs à 0 !");
    }
    
    // On récupère le nombre de jours dans le mois de début et dans le mois de fin 
    let nbJoursMoisDebut = new Date(dateDebut[0], dateDebut[1], 0).getDate();
    let nbJoursMoisFin = new Date(dateFin[0], dateFin[1], 0).getDate();
    
    // Si le jour de début est supérieur au nombre de jours dans le mois de début, ou que le jour de fin
    // est supérieur au nombre de jours dans le mois de fin
    if(dateDebut[3] > nbJoursMoisDebut || dateFin[3] > nbJoursMoisFin){
        // on ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Les jours de début et de fin ne doivent pas dépassé le nombre de jours du mois concerné !");
    }

    // On construit les deux objets symbolisant les dates ainsi que les heures de début et de fin
    let objetDateDebut = new Date(dateDebut[0], dateDebut[1]-1, dateDebut[0], timeDebut[0], timeDebut[1], 0);
    let objetDateFin = new Date(dateFin[0], dateFin[1]-1, dateFin[0], timeFin[0], timeFin[1], 0);

    // Si la date et l'heure de fin est inférieure ou égale à la date et l'heure de début
    if(objetDateFin <= objetDateDebut){
        // on ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("La date de fin du rendez-vous doit être inférieure à celle du début !");
    }

    // Si la taille du lieu est comprise entre 2 et 15 inclus
    if(lieu.length < 2 || lieu.length > 15){

        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("Le champ lieu doit faire entre 2 et 15 caractères inclus !");
    }

    // Si on a au moins une erreur
    if(errors.length > 0){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": errors
        }));
        response.end();
        return; // On utilise return pour stopper l'exécution de la fonction (on vient de répondre au client)
    }

    // Si l'utilisateur à déjà un rendez-vous dans la nouvelle plage horaire choisit
    if(estOccupeeModif(user, id,
    dateDebut[2]+"/"+dateDebut[1]+"/"+dateDebut[0]+" "+timeDebut[0]+"h"+timeDebut[1],
    dateFin[2]+"/"+dateFin[1]+"/"+dateFin[0]+" "+timeFin[0]+"h"+timeFin[1])){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Vous avez déjà un autre rendez-vous durant cette plage horaire !"
        }));
        response.end();
        return; // On utilise return pour stopper l'exécution de la fonction (on vient de répondre au client)
  
    }

    // Si l'utilisateur n'as pas encore de calendrier
    if(!hasCalendar(user)){
        addCalendar(user); // On ajoute un calendrier vide au nom de l'utilisateur
    }

    // On ajoute le nouveau rendez-vous avec les données reçues, en reformatant les dates et heures comme souhaité
    if(updateAppointement(user, id,  titre, lieu, 
        dateDebut[2]+"/"+dateDebut[1]+"/"+dateDebut[0]+" "+timeDebut[0]+"h"+timeDebut[1],
        dateFin[2]+"/"+dateFin[1]+"/"+dateFin[0]+" "+timeFin[0]+"h"+timeFin[1])){ // si la modification réussit

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "OK", 
            "description": "Le rendez-vous a été modifié avec success !"
        }));
        response.end();
    
    } else { // si la modification échoue

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Impossible de modifier le rendez-vous !"
        }));
        response.end();

    }

}
