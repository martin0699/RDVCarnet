/*

Module agenda.js

Le but de ce module est de simuler un controller en exportant toutes les fonctions nécessaires 
pour le traitement mais aussi les actions conséquantes, celles pour les requêtes en rapport avec les agendas

*/

"use strict";



// Imports nécessaires au module
import {renderHTML, renderHTMLWithErreurs, renderHTMLWithNotif, readStream} from "./general.js";
import { addAppointment, addCalendar, hasCalendar } from "../models/calendars/calendars.js";

// Fonction qui permet de récuper la page principale des agendas
export function getAgenda(request, response){
    renderHTML("/calendar/calendar", response); // On "retourne" la page rdv.html dans la réponse
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

    /* TO DO vérification:
        
        MOIS entre 1 et 12
        JOURS entre 1 et 31
        Heures entre 0 et 23
        Minutes entre 0 et 59

    */

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

    // Si la taille du lieu est comprise entre 2 et 15 inclus
    if(lieu.length < 2 || lieu.length > 15){

        // On ajoute un descriptif de l'erreur dans le tableau
        errors.push("Le champ lieu doit faire entre 2 et 15 caractères inclus !");
    }

    // Si on a au moins une erreur
    if(errors.length > 0){

        // On "retourne" la page calendar.html dans la réponse, en y ajoutant les erreurs du tableau
        renderHTMLWithErreurs("/calendar/calendar", response, erreurs);

        return; // On utilise return ici pour stopper l'exécution de la fonction (on vient de répondre au client)
    }

    // Si l'utilisateur n'as pas encore de calendrier
    if(!hasCalendar(user)){
        addCalendar(user); // On ajoute un calendrier vide au nom de l'utilisateur
    }

    // On ajoute le nouveau rendez-vous avec les données reçues, en reformatant les dates et heures comme souhaité
    addAppointment(user, titre, lieu, 
        dateDebut[2]+"/"+dateDebut[1]+"/"+dateDebut[0]+" "+timeDebut[0]+"h"+timeDebut[1],
        dateFin[2]+"/"+dateFin[1]+"/"+dateFin[0]+" "+timeFin[0]+"h"+timeFin[1]);

    // On "retourne" la page calendar.html dans la réponse, en y ajoutant une notifcation certifiant
    // l'ajout du rendez-vous    
    renderHTMLWithNotif("/calendar/calendar", response, "Votre nouveau rendez-vous a bien été ajouté !");

}