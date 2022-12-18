/*

Module agenda.js

Le but de ce module est de simuler un controller en exportant toutes les fonctions nécessaires 
pour le traitement mais aussi les actions conséquantes, celles pour les requêtes en rapport avec les agendas

*/

"use strict";

// Imports nécessaires au module
import {renderHTML, renderHTMLWithErreurs, renderHTMLWithNotif, readStream} from "./general.js";
import { addAppointment, updateAppointement, addCalendar, deleteAppointement, estOccupee, estOccupeeModif, hasCalendar, readWeekOfCalendar, readDayOfCalendar, readMonthOfCalendar } from "../models/calendars/calendars.js";


// Fonction qui permet de récuper la page principale des agendas
export function getAgenda(request, response){

    // On divise l'url de la requête sur le séparateur "?"
    let requestSplit = request.url.split("?");
    
    // Si la division donne au minimum deux string, et que le nom du premier paramètre est "addAppointement"
    // et que la valeur du premier paramètre est "true"
    if(requestSplit.length > 1 
        && requestSplit[1].split("=")[0] == "addAppointement" 
        && requestSplit[1].split("=")[1] == "true"){
        
        // On "retourne" la page html du calendrier, avec une notification annoncant l'ajout du rendez-vous
        renderHTMLWithNotif("/calendar/calendar", response,"Votre nouveau rendez-vous a bien été ajouté !");

    // Si la division donne au minimum deux string, et que le nom du premier paramètre est "setAppointement"
    // et que la valeur du premier paramètre est "true"
    } else if(requestSplit.length > 1 
        && requestSplit[1].split("=")[0] == "setAppointement" 
        && requestSplit[1].split("=")[1] == "true"){
        
        // On "retourne" la page html du calendrier, avec une notification annoncant la modification du rendez-vous
        renderHTMLWithNotif("/calendar/calendar", response,"Votre rendez-vous a bien été modifié !");

    } else  { // Sinon
        
        renderHTML("/calendar/calendar", response); // On "retourne" la page calendar.html dans la réponse
    }
}

// Fonction qui sert à gérer la soumission du formulaire qui ajoute un nouveau rendez-vous
export async function newAppointement(request, response, user){

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

        // Préparation du HTML pour l'erreur (dans un tableau car la fonction appelée ensuite est ainsi..)
        let erreur = ["Tous les champs attendus n'ont pas était transmis !"];

        // On "retourne" la page calendar.html dans la réponse, mais en y affichant l'erreur (voir la fonction)
        renderHTMLWithErreurs("/calendar/calendar", response, erreur);
        
        return; // On utilise return pour stopper l'exécution de la fonction (on vient de répondre au client)
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
    dateDebut = dateDebut.split("-");
    dateFin = dateFin.split("-");

    // On sépare les chaînes de caractères des deux heures avec le séparateur "%3A" (format: 08%3A00 (= 08h00))
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
        errors.push("La date de fin du rendez-vous doit être inférieure à celle du début !");
    }

    // Si la taille du lieu est comprise entre 2 et 15 inclus
    if(lieu.length < 2 || lieu.length > 15){

        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("Le champ lieu doit faire entre 2 et 15 caractères inclus !");
    }

    // Si on a au moins une erreur
    if(errors.length > 0){

        // On "retourne" la page calendar.html dans la réponse, en y ajoutant les erreurs du tableau
        renderHTMLWithErreurs("/calendar/calendar", response, errors);

        return; // On utilise return ici pour stopper l'exécution de la fonction (on vient de répondre au client)
    }

    // Si la plage du rendez-vous à ajouter est déjà utilisé par un autre rendez-vous
    if(estOccupee(user, 
    dateDebut[2]+"/"+dateDebut[1]+"/"+dateDebut[0]+" "+timeDebut[0]+"h"+timeDebut[1],
    dateFin[2]+"/"+dateFin[1]+"/"+dateFin[0]+" "+timeFin[0]+"h"+timeFin[1])){
        
        // On ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Vous avez déjà un autre rendez-vous durant cette plage horaire !");
        
        // On "retourne" la page calendar.html dans la réponse, en y ajoutant les erreurs du tableau
        renderHTMLWithErreurs("/calendar/calendar", response, errors);

        return; // On utilise return ici pour stopper l'exécution de la fonction (on vient de répondre au client)    
    }

    // Si l'utilisateur n'as pas encore de calendrier
    if(!hasCalendar(user)){
        addCalendar(user); // On ajoute un calendrier vide au nom de l'utilisateur
    }

    titre = titre.replaceAll("+", " ");
    lieu = lieu.replaceAll("+", " ");

    // On ajoute le nouveau rendez-vous avec les données reçues, en reformatant les dates et heures comme souhaité
    if(addAppointment(user, titre, lieu, 
        dateDebut[2]+"/"+dateDebut[1]+"/"+dateDebut[0]+" "+timeDebut[0]+"h"+timeDebut[1],
        dateFin[2]+"/"+dateFin[1]+"/"+dateFin[0]+" "+timeFin[0]+"h"+timeFin[1])){ // Si l'ajout réussi
    
        // On redirige le client vers le lien "/accueil?addAppointement=true"
        response.writeHead(302, {
            'Location': '/accueil?addAppointement=true'
        });
        response.end();

    } else { // Sinon, si l'ajout ne réussit pas

        // On ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Impossible d'ajouter ce nouveau rendez-vous !");
        
        // On "retourne" la page calendar.html dans la réponse, en y ajoutant les erreurs du tableau
        renderHTMLWithErreurs("/calendar/calendar", response, erreurs);
    }

}

// Fonction qui permet de lire les rendez-vous contenu dans un mois
export function readAppointementOfMonth(request, response, user){
    // On divise l'url de la requête sur le séparateur "?"
    let params = request.url.split("?");
    
    // On divise la partie contenant les paramètres de requête avec le séparateur "&"
    params = params[1].split("&");

    // Si le nombre de paramètre reçu dans la requête est différent de deux
    if(params.length != 2){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Le nombre d'arguments présents dans la requête n'est pas celui attendu !"
        }));
        response.end();

        return; // on effectue un return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
    }

    // On récupère divise les deux paramètres sur le séparateur "="
    let monthNumber = params[0].split("=");
    let yearNumber = params[1].split("=");

    // Si au moins un des nom des deux paramètres n'est pas celui attendus
    if(monthNumber[0] != "month" || yearNumber[0] != "year"){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Les noms des données reçues dans la requête ne sont pas ceux attendus !"
        }));
        response.end();

        return; // on effectue un return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
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

    // On initialise un nouveau tableau vide, qui va servir pour stoquer les rendez-vous
    let rendezVous = [];
    
    // Si l'utilisateur a un calendrier
    if(hasCalendar(user)){
        // On récupère les rendez-vous concernant la semaine dans son calendrier
        rendezVous = readMonthOfCalendar(user, monthNumber, yearNumber);
    }

    // On prépare l'objet JSON de retour, avec comme code OK pour dire que l'action s'est bien passée.
    // On y ajoute aussi le tableau des rendez-vous de la semaine en question 
    let retour = {
        "code": "OK",
        "rdvs": rendezVous
    };

    // On effectue une réponse de type JSON au client, qui contient l'objet JSON de retour
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
    response.write(JSON.stringify(retour));
    response.end();
}

// Fonction qui permet de lire les rendez-vous contenu dans un jour
export function readAppointementOfDay(request, response, user){
    // On divise l'url de la requête sur le séparateur "?"
    let params = request.url.split("?");
    
    // On divise la partie contenant les paramètres de requête avec le séparateur "&"
    params = params[1].split("&");

    // Si le nombre de paramètre reçu dans la requête est différent de trois
    if(params.length != 3){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Le nombre d'arguments présents dans la requête n'est pas celui attendu !"
        }));
        response.end();

        return; // on effectue un return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
    }

    // On récupère divise les trois paramètres sur le séparateur "="
    let dayNumber = params[0].split("=");
    let monthNumber = params[1].split("=");
    let yearNumber = params[2].split("=");

    // Si au moins un des nom des trois paramètres n'est pas celui attendus
    if(dayNumber[0] != "day" || monthNumber[0] != "month" || yearNumber[0] != "year"){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Les noms des données reçues dans la requête ne sont pas ceux attendus !"
        }));
        response.end();

        return; // on effectue un return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
    }

    // on peut maintenant récupérer uniquement les valeurs des paramètres
    dayNumber = dayNumber[1];
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
    
    // On récupère le nombre de jours du mois concerné
    let numberDaysOfMonth = new Date(yearNumber, monthNumber, 0).getDate();

    // Si le numéro du jours n'est pas compris dans l'intervalle des jours du mois
    if((dayNumber>numberDaysOfMonth || dayNumber < 1)){
        
        // On retourne une réponse de type JSON expliquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Les données reçues dans la requête ne sont pas au format attendu !"
        }));
        response.end();

        return; // on utilise return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
    }  

    // On initialise un nouveau tableau vide, qui va servir pour stoquer les rendez-vous
    let rendezVous = [];
    
    // Si l'utilisateur a un calendrier
    if(hasCalendar(user)){
        // On récupère les rendez-vous concernant la semaine dans son calendrier
        rendezVous = readDayOfCalendar(user, dayNumber, monthNumber, yearNumber);
    }

    // On prépare l'objet JSON de retour, avec comme code OK pour dire que l'action s'est bien passée.
    // On y ajoute aussi le tableau des rendez-vous de la semaine en question 
    let retour = {
        "code": "OK",
        "rdvs": rendezVous
    };

    // On effectue une réponse de type JSON au client, qui contient l'objet JSON de retour
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
    response.write(JSON.stringify(retour));
    response.end();
}

// Fonction qui permet de lire les rendez-vous contenu dans une semaine
export function readAppointementOfWeek(request, response, user){
    
    // On divise l'url de la requête sur le séparateur "?"
    let params = request.url.split("?");
    
    // On divise la partie contenant les paramètres de requête avec le séparateur "&"
    params = params[1].split("&");

    // Si le nombre de paramètre reçu dans la requête est différent de trois
    if(params.length != 3){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Le nombre d'arguments présents dans la requête n'est pas celui attendu !"
        }));
        response.end();

        return; // on effectue un return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
    }

    // On récupère divise les trois paramètres sur le séparateur "="
    let mondayNumber = params[0].split("=");
    let monthNumber = params[1].split("=");
    let yearNumber = params[2].split("=");

    // Si au moins un des nom des trois paramètres n'est pas celui attendus
    if(mondayNumber[0] != "monday" || monthNumber[0] != "month" || yearNumber[0] != "year"){

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Les noms des données reçues dans la requête ne sont pas ceux attendus !"
        }));
        response.end();

        return; // on effectue un return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
    }

    // on peut maintenant récupérer uniquement les valeurs des paramètres
    mondayNumber = mondayNumber[1];
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

    // On récupère le nombre de jours du mois concerné
    let numberDaysOfMonth = new Date(yearNumber, mondayNumber, 0).getDate();
    
    // Si le numéro du jours n'est pas compris dans l'intervalle des jours du mois
    if((mondayNumber>numberDaysOfMonth || mondayNumber < 1)){
        
        // On retourne une réponse de type JSON expliquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Les données reçues dans la requête ne sont pas au format attendu !"
        }));
        response.end();

        return; // on utilise return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
    }  

    // On initialise un nouveau tableau vide, qui va servir pour stoquer les rendez-vous
    let rendezVous = [];
    
    // Si l'utilisateur a un calendrier
    if(hasCalendar(user)){
        // On récupère les rendez-vous concernant la semaine dans son calendrier
        rendezVous = readWeekOfCalendar(user, mondayNumber, monthNumber, yearNumber);
    }

    // On prépare l'objet JSON de retour, avec comme code OK pour dire que l'action s'est bien passée.
    // On y ajoute aussi le tableau des rendez-vous de la semaine en question 
    let retour = {
        "code": "OK",
        "rdvs": rendezVous
    };


    // On effectue une réponse de type JSON au client, qui contient l'objet JSON de retour
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
    response.write(JSON.stringify(retour));
    response.end();

}


// Fonction qui permet de supprimer un rendez-vous de l'utilisateur
export function removeAppointement(request, response, user){

    // On récupère le nom du premier paramètre dans l'url de la requête ainsi que son contenu
    let id = request.url.split("?")[1].split("=");

    // Si le nom du paramètre est différent de "id" (le nom attendu)
    if(id[0] != "id"){

        // On effectue une réponse de type JSON au client, indiquant l'erreur qui s'est produite
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Le nom de la donnée reçue dans la requête n'est pas celui attendu !"
        }));
        response.end();

        return; // on utilise return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
    }

    // On récupère l'entier contenu dans la valeur du paramètre
    id = parseInt(id[1]);

    // Si l'id est inférieur à 0
    if(id<0){

        // On effectue une réponse de type JSON au client, indiquant l'erreur qui s'est produite
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "La donnée reçue dans la requête n'est pas au format attendu !"
        }));
        response.end();

        return; // On utilise return ici pour arrêter l'exécution de la fonction, on vient de répondre au client
    }

    // On effectue la suppresion du rendez-vous de l'utilisateur contenant l'id reçu en paramètre
    if(deleteAppointement(user, id)){ // Si la suppresion à reussit

        // On effectue une réponse de type JSON au client, en lui indiquant que la suppresion a reussi
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "OK", 
            "description": "Le rendez-vous a bien été supprimé !"
        }));
        response.end();
    
    } else { // Si la suppression échoue

        // On effectue une réponse de type JSON au client, en lui indiquant que la suppression a échoué
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Impossible de supprimer le rendez-vous !"
        }));
        response.end();

    }
}

// Fonction qui sert à gérer la soumission du formulaire qui modifie un rendez-vous
export async function setAppointement(request, response, user){

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

        // Préparation du HTML pour l'erreur (dans un tableau car la fonction appelée ensuite est ainsi..)
        let erreur = ["Tous les champs attendus n'ont pas était transmis !"];

        // On "retourne" la page calendar.html dans la réponse, mais en y affichant l'erreur (voir la fonction)
        renderHTMLWithErreurs("/calendar/calendar", response, erreur);
        
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
    dateDebut = dateDebut.split("-");
    dateFin = dateFin.split("-");

    // On sépare les chaînes de caractères des deux heures avec le séparateur "%3A" (format: 08%3A00 (= 08h00))
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

        // On "retourne" la page calendar.html dans la réponse, en y ajoutant les erreurs du tableau
        renderHTMLWithErreurs("/calendar/calendar", response, errors);

        return; // On utilise return ici pour stopper l'exécution de la fonction (on vient de répondre au client)
    }

    // Si l'utilisateur à déjà un rendez-vous dans la nouvelle plage horaire choisit
    if(estOccupeeModif(user, id,
    dateDebut[2]+"/"+dateDebut[1]+"/"+dateDebut[0]+" "+timeDebut[0]+"h"+timeDebut[1],
    dateFin[2]+"/"+dateFin[1]+"/"+dateFin[0]+" "+timeFin[0]+"h"+timeFin[1])){
        
        // on ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Vous avez déjà un autre rendez-vous durant cette plage horaire !");
        
        // On "retourne" la page calendar.html dans la réponse, en y ajoutant les erreurs du tableau
        renderHTMLWithErreurs("/calendar/calendar", response, errors);

        return; // On utilise return ici pour stopper l'exécution de la fonction (on vient de répondre au client)    
    }

    // Si l'utilisateur n'as pas encore de calendrier
    if(!hasCalendar(user)){
        addCalendar(user); // On ajoute un calendrier vide au nom de l'utilisateur
    }

    titre = titre.replaceAll("+", " ");
    lieu = lieu.replaceAll("+", " ");
    // On ajoute le nouveau rendez-vous avec les données reçues, en reformatant les dates et heures comme souhaité
    if(updateAppointement(user, id,  titre, lieu, 
        dateDebut[2]+"/"+dateDebut[1]+"/"+dateDebut[0]+" "+timeDebut[0]+"h"+timeDebut[1],
        dateFin[2]+"/"+dateFin[1]+"/"+dateFin[0]+" "+timeFin[0]+"h"+timeFin[1])){ // si la modification réussit
    
        // On redirige le client vers l'url "/accueil?setAppointement=true"
        response.writeHead(302, {
            'Location': '/accueil?setAppointement=true'
        });
        response.end();

    } else { // si la modification échoue

        // on ajoute une erreur expliquant le problème dans le tableau des erreurs
        errors.push("Impossible de modifier le rendez-vous !");
        
        // On "retourne" la page calendar.html dans la réponse, en y ajoutant les erreurs du tableau
        renderHTMLWithErreurs("/calendar/calendar", response, errors);
    }

}