/*

Module calendars.js

Le but de ce module est de simuler un model en exportant toutes les fonctions nécessaires 
pour la lecture et l'écriture dans les données persistantes des agendas (le fichier calendars.json)

*/

"use strict";

// Imports nécessaires pour le module
import {existsSync, readFileSync, writeFileSync} from "fs";

// Déclaration d'une constante représentant le chemin du fichier où sont stockées les données
const nomFichier = "./models/calendars/calendars.json";


// Fonction qui sera appelée pour afficher le texte informatif dans la console lorsque le fichier n'existe pas
function noFile(){
    console.log("Le fichier "+nomFichier+" n'existe pas !")
}

// Fonction qui permet de lire tous les calendriers stockés dans le fichier
export function readCalendars(){

    // Si le fichier existe
    if(existsSync(nomFichier)){
        
        // On retourne le contenu du fichier que l'on parse en JSON (= tableau JS au final)
        return JSON.parse(readFileSync(nomFichier)); 

    } else { // Si le fichier n'existe pas

        noFile(); // Appel de la fonction pour afficher le message d'erreur
        return false; 
    
    }
}

// Fonction qui sert à lire le calendrier d'un utilisateur en particulier
export function readCalendar(utilisateur){

    // Si le fichier existe
    if(existsSync(nomFichier)){
        
        // On récupère tous les calendriers présents dans le fichier
        let calendars = readCalendars(); 
        
        // Pour chacun des calendriers récupérés
        for(let i=0; i<calendars.length; i++){

            // Si le propriétaire du calendrier est bien l'utilisateur voulu
            if(calendars[i].proprietaire == utilisateur){
                return calendars[i].calendar; // On retourne son calendrier
            }

        }

        // Si on ressort de la boucle, c'est que l'utilisateur n'a pas de calendrier enregistré !
        console.log("L'utilisateur n'as pas de calendrier! ");
        return false;

    } else { // Si le fichier n'existe pas
        
        noFile(); // Appel de la fonction pour afficher le message d'erreur
        return false;
    
    }
}


// Fonction qui permet de lire les rendez-vous d'un certain utilisateur dans une semaine donnée
export function readWeekOfCalendar(utilisateur, mondayNumber, month, year){

    // Si le fichier existe
    if(existsSync(nomFichier)){
        
        // On récupère le calendrier de l'utilisateur voulu
        let calendar = readCalendar(utilisateur);

        // On retourne le calendrier filtré pour ne garder que les rendez-vous de la semaine voulu
        calendar = calendar.filter((item) => {

            // On sépare la date de l'heure via le premier split, puis le jour, le mois et l'année avec le second appel
            // On réalise la même chose pour les deux dates de chacun des rendez-vous (début et fin)
            let debut = item.dateDebut.split(" ")[0].split("/");
            let fin = item.dateFin.split(" ")[0].split("/");

            // Est-ce que l'année, le mois et le jour de la date de début correspondent à la semaine recherchée ?
            let debutInWeek = parseInt(debut[2]) == year 
                            && parseInt(debut[1]) == month 
                            && parseInt(debut[0]) >= mondayNumber 
                            && parseInt(debut[0]) <= parseInt(mondayNumber)+6;

            // Est-ce que l'année, le mois et le jour de la date de fin correspondent à la semaine recherchée ?
            let finInWeek = parseInt(fin[2]) == year 
                            && parseInt(fin[1]) == month 
                            && parseInt(fin[0]) >= mondayNumber 
                            && parseInt(fin[0]) <= parseInt(mondayNumber)+6; 

            let curseur = new Date(year, month-1, mondayNumber);
            let dateDebut = new Date(debut[2], debut[1]-1, debut[0]);
            let dateFin = new Date(fin[2], fin[1]-1, fin[0]);
            let middleInWeek = false;

            for(let i=0; i<7; i++){
                curseur.setDate( curseur.getDate()+1);
                if(dateDebut<= curseur && curseur <= dateFin){
                    middleInWeek = true;
                }
            }


            // On garde le rendez-vous si au moins une des deux dates correspondent à la semaine recherchée
            return debutInWeek || finInWeek || middleInWeek;

        });

        // on trie les rendez-vous obtenus dans l'ordre croissant des dates et heures de début
        calendar = calendar.sort((a,b) => {

            let monthDebutA = parseInt(a.dateDebut.split("/")[1]);
            let monthDebutB = parseInt(b.dateDebut.split("/")[1]);

            if(monthDebutA - monthDebutB != 0){
                return monthDebutA - monthDebutB;
            } else {

                // On récupère le jour de début de A
                let jourDebutA = parseInt(a.dateDebut.split("/")[0]);

                // On récupère le jour de début de B
                let jourDebutB = parseInt(b.dateDebut.split("/")[0]);

                // Si le résultat du jour de début de A moins celui de B est différent de 0
                if(jourDebutA - jourDebutB != 0){
                    // On retourne le jour de début de A moins celui de B
                    return jourDebutA - jourDebutB;
                } else { // sinon, si le résultat du jour de début de A moins celui de B est égale à 0
                    
                    // On récupère l'heure de début de A
                    let heureDebutA = parseInt(a.dateDebut.split(" ")[1].split("h")[0]);
                    // On récupère l'heure de début de B
                    let heureDebutB = parseInt(b.dateDebut.split(" ")[1].split("h")[0]);

                    // Si le résultat de l'heure de début de A moins celle de B est différent de 0
                    if(heureDebutA - heureDebutB != 0){
                    
                        // On returne le résultat
                        return heureDebutA - heureDebutB;
                    
                    } else { // Sinon, si le résultat de l'heure de début de A moins celle de B est égale à 0
                        
                        // On retourne le résultat de la minute de début de A moins celle de B
                        return a.dateDebut.split(" ")[1].split("h")[0] - b.dateDebut.split(" ")[1].split("h")[1];
                    }
                }
            }
        });

        // On retourne le tableau contenant les rendez-vous de la semaine triée par date et heure de début
        return calendar;
        
    } else { // Si le fichier n'existe pas

        noFile(); // Appel de la fonction pour afficher le message d'erreur
        return false;
    
    }

}

// Fonction qui permet de lire les rendez-vous d'un certain utilisateur dans une journée donnée
export function readDayOfCalendar(utilisateur, dayNumber, month, year){

    // Si le fichier existe
    if(existsSync(nomFichier)){
        
        // On récupère le calendrier de l'utilisateur voulu
        let calendar = readCalendar(utilisateur);

        // On retourne le calendrier filtré pour ne garder que les rendez-vous de la semaine voulu
        calendar = calendar.filter((item) => {

            // On sépare la date de l'heure via le premier split, puis le jour, le mois et l'année avec le second appel
            // On réalise la même chose pour les deux dates de chacun des rendez-vous (début et fin)
            let debut = item.dateDebut.split(" ")[0].split("/");
            let fin = item.dateFin.split(" ")[0].split("/");

            // Est-ce que l'année, le mois et le jour de la date de début correspondent à la semaine recherchée ?
            let debutInDay = parseInt(debut[2]) == year 
                            && parseInt(debut[1]) == month 
                            && parseInt(debut[0]) == dayNumber;
            
            let finInDay = parseInt(fin[2]) == year 
                            && parseInt(fin[1]) == month 
                            && parseInt(fin[0]) == dayNumber;

            let middleInDay = false;

            let dDebut = new Date(debut[2], debut[1]-1, debut[0]);
            let dFin = new Date(fin[2], fin[1]-1, fin[0]);
            let c = new Date(year, month-1, dayNumber);

            if(dDebut<=c && c <= dFin){
                middleInDay = true;
            }
                            

            // On garde le rendez-vous si au moins une des deux dates correspondent à la semaine recherchée
            return debutInDay || finInDay || middleInDay;

        });

        // on trie les rendez-vous obtenus dans l'ordre croissant des dates et heures de début
        calendar = calendar.sort((a,b) => {

            // On récupère l'heure de début de A
            let heureDebutA = parseInt(a.dateDebut.split(" ")[1].split("h")[0]);
            // On récupère l'heure de début de B
            let heureDebutB = parseInt(b.dateDebut.split(" ")[1].split("h")[0]);

            // Si le résultat de l'heure de début de A moins celle de B est différent de 0
            if(heureDebutA - heureDebutB != 0){
                
                // On returne le résultat
                return heureDebutA - heureDebutB;
                
            } else { // Sinon, si le résultat de l'heure de début de A moins celle de B est égale à 0
                    
                // On retourne le résultat de la minute de début de A moins celle de B
                return a.dateDebut.split(" ")[1].split("h")[0] - b.dateDebut.split(" ")[1].split("h")[1];
            }
        
        });

        // On retourne le tableau contenant les rendez-vous de la semaine triée par date et heure de début
        return calendar;
        
    } else { // Si le fichier n'existe pas

        noFile(); // Appel de la fonction pour afficher le message d'erreur
        return false;
    
    }

}

// Fonction qui permet de lire les rendez-vous d'un certain utilisateur dans un mois donnée
export function readMonthOfCalendar(utilisateur, month, year){

    // Si le fichier existe
    if(existsSync(nomFichier)){
        
        // On récupère le calendrier de l'utilisateur voulu
        let calendar = readCalendar(utilisateur);

        // On retourne le calendrier filtré pour ne garder que les rendez-vous de la semaine voulu
        calendar = calendar.filter((item) => {

            // On sépare la date de l'heure via le premier split, puis le jour, le mois et l'année avec le second appel
            // On réalise la même chose pour les deux dates de chacun des rendez-vous (début et fin)
            let debut = item.dateDebut.split(" ")[0].split("/");
            let fin = item.dateFin.split(" ")[0].split("/");

            // Est-ce que l'année, le mois et le jour de la date de début correspondent à la semaine recherchée ?
            let debutInMonth = parseInt(debut[2]) == year 
                            && parseInt(debut[1]) == month;

            // Est-ce que l'année, le mois et le jour de la date de fin correspondent à la semaine recherchée ?
            let finInMonth = parseInt(fin[2]) == year 
                            && parseInt(fin[1]) == month;

            let curseur = new Date(year, month-1, 1);
            let dateDebut = new Date(debut[2], debut[1]-1, debut[0]);
            let dateFin = new Date(fin[2], fin[1]-1, fin[0]);
            let middleInMonth = dateDebut<=curseur && curseur<= dateFin;

            // On garde le rendez-vous si au moins une des deux dates correspondent à la semaine recherchée
            return debutInMonth || finInMonth || middleInMonth;

        });

        // on trie les rendez-vous obtenus dans l'ordre croissant des dates et heures de début
        calendar = calendar.sort((a,b) => {

            // On récupère le jour de début de A
            let jourDebutA = parseInt(a.dateDebut.split("/")[0]);

            // On récupère le jour de début de B
            let jourDebutB = parseInt(b.dateDebut.split("/")[0]);

            // Si le résultat du jour de début de A moins celui de B est différent de 0
            if(jourDebutA - jourDebutB != 0){
                // On retourne le jour de début de A moins celui de B
                return jourDebutA - jourDebutB;
            } else { // sinon, si le résultat du jour de début de A moins celui de B est égale à 0
                
                // On récupère l'heure de début de A
                let heureDebutA = parseInt(a.dateDebut.split(" ")[1].split("h")[0]);
                // On récupère l'heure de début de B
                let heureDebutB = parseInt(b.dateDebut.split(" ")[1].split("h")[0]);

                // Si le résultat de l'heure de début de A moins celle de B est différent de 0
                if(heureDebutA - heureDebutB != 0){
                
                    // On returne le résultat
                    return heureDebutA - heureDebutB;
                
                } else { // Sinon, si le résultat de l'heure de début de A moins celle de B est égale à 0
                    
                    // On retourne le résultat de la minute de début de A moins celle de B
                    return a.dateDebut.split(" ")[1].split("h")[0] - b.dateDebut.split(" ")[1].split("h")[1];
                }
            }
        });

        // On retourne le tableau contenant les rendez-vous de la semaine triée par date et heure de début
        return calendar;
        
    } else { // Si le fichier n'existe pas

        noFile(); // Appel de la fonction pour afficher le message d'erreur
        return false;
    
    }

}

// Fonction qui est utile pour ajouter un calendrier vide à un utilisateur (lorsque nouvel utilisateur)
export function addCalendar(utilisateur){

    let calendars;
 
    // Si le fichier existe
    if(existsSync(nomFichier)){
        
        // On lit tous les calendriers du fichier
        calendars = readCalendars(); 
        
        // On ajoute un nouveau calendrier à la fin du tableau
        calendars.push({
            "proprietaire": utilisateur, // On précise l'utilisateur voulu en propriétaire
            "calendar": [] // On initialise un tableau de rendez-vous à vide
        });

    } else { // Si le fichier n'existe pas

        // On créer un nouveau tableau contenant uniquement le nouveau calendrier
        calendars = [
            {
                "proprietaire": utilisateur,
                "calendar": {}
            }
        ];

    }

    // On écrit la nouvelle version du tableau de calendriers dans le fichier
    writeFileSync(nomFichier, JSON.stringify(calendars)); 

    return true; // Le traitement à réussi donc on retourne true
}

// Fonction qui sert à ajouter un nouveau rendez-vous dans le calendrier d'un utilisateur
export function addAppointment(utilisateur, titre, lieu, debut, fin){
    
    // Si le fichier existe
    if(existsSync(nomFichier)){

        let calendars = readCalendars(); // On récupère le tableau des calendriers du fichier
        let retour = false; // On initialise la valeur de retour

        // Pour chacun des calendriers du tableau lut
        for(let i=0; i<calendars.length; i++){

            // Si le propriétaire est celui recherché
            if(calendars[i].proprietaire == utilisateur){

                let new_id;

                // Si le calendier de l'utilisateur n'est pas vide
                if(calendars[i].calendar.length-1 >=0){
                    // On calcul l'id du rendez-vous à insérer: (l'id du dernier rendez-vous du tableau)+1
                    new_id = calendars[i].calendar[calendars[i].calendar.length-1].id+1;
                } else { // Si le calendrier de l'utilisateur est vide
                    new_id = 1; // On écrit le premier id étant égale à 1 
                }

                // On peut maintenant ajouter le nouveau rendez-vous à la fin du tableau
                calendars[i].calendar.push({
                    "id": new_id, // On spécifie le nouveau id calculé
                    "titre": titre, // On défini le titre comme étant celui voulu
                    "dateDebut": debut, // On défini la date de début comme étant celle voulue
                    "dateFin": fin, // On défini la date de fin comme étant celle voulue
                    "lieu": lieu // On défini le lieu comme étant celui voulu
                });

                retour = true; // On change la valeur de retour à true car le traitement voulu à réussi
                
            }
        }

        // On écrit la nouvelle version du tableau de calendriers dans le fichier
        writeFileSync(nomFichier, JSON.stringify(calendars)); 

        return retour; // On retourne un booléen qui détermine si le traitement à réussi ou non
        
    } else { // Si le fichier n'existe pas

        noFile(); // Appel de la fonction pour afficher le message d'erreur
        return false; 
    }

}


// Fonction qui permet de supprimer un rendez-vous d'un utilisateur
export function deleteAppointement(utilisateur, id){

    // Si le fichier existe
    if(existsSync(nomFichier)){


        let calendars = readCalendars(); // On récupère le tableau des calendriers du fichier
        let retour = false; // On initialise la valeur de retour

        // Pour chacun des calendriers du tableau lut
        for(let i=0; i<calendars.length; i++){

            // Si le propriétaire est celui recherché
            if(calendars[i].proprietaire == utilisateur){
                
                // Le nouveau tableau de rendez-vous est l'ancien dans lequel on garde uniquement les id
                // différents de l'id du rendez-vous que l'on souhaite supprimer
                let new_tab = calendars[i].calendar.filter(item => item.id != id);

                // La valeur de retour est false si le nouveau tableau est toujours de même taille 
                // (et donc pas de rendez-vous retirés), true sinon
                retour = new_tab.lenght == calendars[i].calendar.length? false:true;

                // Le nouveau tableau obtenu remplace l'ancien tableau de rendez-vous de l'utilisateur
                calendars[i].calendar = new_tab;
                
            }
        }

        // On écrit la nouvelle version du tableau de calendriers dans le fichier
        writeFileSync(nomFichier, JSON.stringify(calendars)); 

        return retour; // On retourne un booléen qui détermine si le traitement à réussi ou non
        
    } else { // Si le fichier n'existe pas

        noFile(); // Appel de la fonction pour afficher le message d'erreur
        return false; 
    
    }

}

// Fonction dont le but est de modifier un rendez-vous particulier d'un utilisateur
export function updateAppointement(utilisateur, id, titre, lieu, debut, fin){

    // Si le fichier existe
    if(existsSync(nomFichier)){

        let calendars = readCalendars(); // On récupère le tableau des calendriers du fichier
        let retour = false; // On initialise la valeur de retour

        // Pour chacun des calendriers du tableau lut
        for(let i=0; i<calendars.length; i++){

            // Si le propriétaire est celui recherché
            if(calendars[i].proprietaire == utilisateur){
                

                // On recherche la position dans le tableau du rendez-vous qui à l'id souhaitée
                let index = calendars[i].calendar.findIndex(item => item.id == id);

                // La valeur de retour est false si l'on a pas trouver le rendez-vous avec l'id voulu 
                // (et donc la variable index = -1), true sinon
                retour = (index == -1 ? false:true);
                
                // Si on a bien trouver le rendez-vous dans le tableau
                if(index != -1){

                    // On modifie le rendez-vous à la position index en l'écrassant par le nouveau
                    calendars[i].calendar[index] = {
                        "id": id, // On défini l'id comme étant le même qu'avant
                        "titre": titre, // On défini le titre comme étant celui modifé
                        "dateDebut": debut, // On défini la date de début comme étant celle modifiée
                        "dateFin": fin, // On défini la date de fin comme étant celle modifiée
                        "lieu": lieu // On défini le lieu comme étant celui modifié
                    };
                }

            }
        }

        // on ecrit le string contenant le JSON des calendriers dans le fichier
        writeFileSync(nomFichier, JSON.stringify(calendars)); 

        return retour; // On retourne un booléen qui détermine si le traitement à réussi ou non
        
    } else { // Si le fichier n'existe pas

        noFile(); // Appel de la fonction qui affiche le message d'erreur
        return false; 
    
    }

}

// Fonction qui sert à savoir si le joueur à un calendrier
export function hasCalendar(utilisateur){

    // Si le fichier existe
    if(existsSync(nomFichier)){

        // On récupère le tableau des calendriers du fichier
        let calendars = readCalendars();

        // On filtre le tableau pour garder uniquement les objets dont le propriétaire est l'utilisateur voulu
        calendars = calendars.filter(item => item.proprietaire == utilisateur);

        // Si le nouveau tableau est supérieur à 0, alors l'utilisateur à un calendrier dans le tableau
        // sinon il n'en a donc pas (on retourne le résultat)
        return calendars.length>0?true:false;

    } else { // Si le fichier n'existe pas

        noFile(); // Appel de la fonction pour afficher le message d'erreur
        return false; // L'utilisateur n'a donc pas de calendrier

    }

}


// Fonction qui permet de déterminer si une plage est déjà occupé par un rendez-vous
export function estOccupee(utilisateur, debut, fin){

    // On lit le calendrier de l'utilisateur concerné 
    let calendar = readCalendar(utilisateur);

    // Pour chaque rendez-vous du calendier
    for(let i=0; i<calendar.length; i++){

        // on récupère l'année de début du rendez-vous
        let anneeDebut = parseInt(calendar[i].dateDebut.split(" ")[0].split("/")[2]);
        // on récupère l'année de fin du rendez-vous
        let anneeFin = parseInt(calendar[i].dateFin.split(" ")[0].split("/")[2]);

        // on récupère le mois de début du rendez-vous
        let moisDebut = parseInt(calendar[i].dateDebut.split("/")[1]);
        // on récupère le mois de fin du rendez-vous
        let moisFin = parseInt(calendar[i].dateFin.split("/")[1]);

        // on récupère le jour de début du rendez-vous
        let jourDebut = parseInt(calendar[i].dateDebut.split("/")[0]);
        // on récupère le jour de fin du rendez-vous
        let jourFin = parseInt(calendar[i].dateFin.split("/")[0]);

        // on récupère l'heure de début du rendez-vous
        let heureDebut = parseInt(calendar[i].dateDebut.split(" ")[1].split("h")[0]);
        // on récupère l'heure de fin du rendez-vous
        let heureFin = parseInt(calendar[i].dateFin.split(" ")[1].split("h")[0]);

        // on récupère la minute de début du rendez-vous
        let minuteDebut = parseInt(calendar[i].dateDebut.split("h")[1]);
        // on récupère la minute de fin du rendez-vous
        let minuteFin = parseInt(calendar[i].dateFin.split("h")[1]);

        // On crée l'objet Date correspondant à la date et l'heure du début du rendez-vous
        let dateDebut = new Date(anneeDebut, moisDebut-1, jourDebut, heureDebut, minuteDebut);
        // On crée l'objet Date correspondant à la date et l'heure de fin du rendez-vous
        let dateFin = new Date(anneeFin, moisFin-1, jourFin, heureFin, minuteFin);

        // On récupère l'année de la date de début reçue en paramètres
        anneeDebut = parseInt(debut.split(" ")[0].split("/")[2]);
        // On récupère l'année de la date de fin reçue en paramètres
        anneeFin = parseInt(fin.split(" ")[0].split("/")[2]);

        // On récupère le mois de la date de début reçue en paramètres
        moisDebut = parseInt(debut.split("/")[1]);
        // On récupère le mois de la date de fin reçue en paramètres
        moisFin = parseInt(fin.split("/")[1]);

        // On récupère le jour de la date de début reçue en paramètres
        jourDebut = parseInt(debut.split("/")[0]);
        // On récupère le jour de la date de fin reçue en paramètres
        jourFin = parseInt(fin.split("/")[0]);

        // On récupère l'heure de la date de début reçue en paramètres
        heureDebut = parseInt(debut.split(" ")[1].split("h")[0]);
        // On récupère l'heure de la date de fin reçue en paramètres
        heureFin = parseInt(fin.split(" ")[1].split("h")[0]);

        // On récupère la minute de la date de début reçue en paramètres
        minuteDebut = parseInt(debut.split("h")[1]);
        // On récupère la minute de la date de fin reçue en paramètres
        minuteFin = parseInt(fin.split("h")[1]);

        // On construit l'objet Date représentant la date de début reçue en paramètres
        let dateDebutParam = new Date(anneeDebut, moisDebut-1, jourDebut, heureDebut, minuteDebut);
        // On construit l'objet Date représentant la date de fin reçue en paramètres
        let dateFinParam = new Date(anneeFin, moisFin-1, jourFin, heureFin, minuteFin);

        // Si la date de début du rendez-vous est inférieure ou égale à la date de début reçue en paramètres
        // et la date de fin du rendez-vous est supérieure ou égale à la date de fin reçue en paramètres
        if(dateDebut <= dateDebutParam && dateFinParam <= dateFin){
            // On retoune vrai (la plage est déjà occupée)
            return true;
        
        // Si la date de fin du rendez-vous est supérieure ou égale à la date de début reçue en paramètres
        // et la date de fin du rendez-vous est inférieure ou égale à la date de fin reçue en paramètres
        } else if (dateDebutParam <= dateFin && dateFinParam >= dateFin){
            // On retoune vrai (la plage est déjà occupée)
            return true;

        // Si la date de début du rendez-vous est supérieure ou égale à la date de début reçue en paramètres
        // et la date de début du rendez-vous est inférieure ou égale à la date de début reçue en paramètres
        } else if(dateDebutParam <= dateDebut && dateFinParam >= dateDebut){
            // On retoune vrai (la plage est déjà occupée)
            return true;
        }
    }

    // Si aucun des rendez-vous est sur la plage testée, on retourne false
    return false;
}

// Fonction qui permet de déterminer si une plage est déjà occupé par un rendez-vous
// (sauf celui modifié dont on reçoit l'id)
export function estOccupeeModif(utilisateur, id, debut, fin){

    // On lit le calendrier de l'utilisateur concerné
    let calendar = readCalendar(utilisateur);

    // Pour chacun des rendez-vous du calendrier
    for(let i=0; i<calendar.length; i++){

        // Si l'id du rendez-vous est différent de celui que l'on modifie
        if(calendar[i].id != id){

            // on récupère l'année de début du rendez-vous
            let anneeDebut = parseInt(calendar[i].dateDebut.split(" ")[0].split("/")[2]);
            // on récupère l'année de fin du rendez-vous
            let anneeFin = parseInt(calendar[i].dateFin.split(" ")[0].split("/")[2]);

            // on récupère le mois de début du rendez-vous
            let moisDebut = parseInt(calendar[i].dateDebut.split("/")[1]);
            // on récupère le mois de fin du rendez-vous
            let moisFin = parseInt(calendar[i].dateFin.split("/")[1]);

            // on récupère le jour de début du rendez-vous
            let jourDebut = parseInt(calendar[i].dateDebut.split("/")[0]);
            // on récupère le jour de fin du rendez-vous
            let jourFin = parseInt(calendar[i].dateFin.split("/")[0]);

            // on récupère l'heure de début du rendez-vous
            let heureDebut = parseInt(calendar[i].dateDebut.split(" ")[1].split("h")[0]);
            // on récupère l'heure de fin du rendez-vous
            let heureFin = parseInt(calendar[i].dateFin.split(" ")[1].split("h")[0]);

            // on récupère la minute de début du rendez-vous
            let minuteDebut = parseInt(calendar[i].dateDebut.split("h")[1]);
            // on récupère la minute de fin du rendez-vous
            let minuteFin = parseInt(calendar[i].dateFin.split("h")[1]);

            // On crée l'objet Date correspondant à la date et l'heure du début du rendez-vous
            let dateDebut = new Date(anneeDebut, moisDebut-1, jourDebut, heureDebut, minuteDebut);
            // On crée l'objet Date correspondant à la date et l'heure de fin du rendez-vous
            let dateFin = new Date(anneeFin, moisFin-1, jourFin, heureFin, minuteFin);

            // On récupère l'année de la date de début reçue en paramètres
            anneeDebut = parseInt(debut.split(" ")[0].split("/")[2]);
            // On récupère l'année de la date de fin reçue en paramètres
            anneeFin = parseInt(fin.split(" ")[0].split("/")[2]);

            // On récupère le mois de la date de début reçue en paramètres
            moisDebut = parseInt(debut.split("/")[1]);
            // On récupère le mois de la date de fin reçue en paramètres
            moisFin = parseInt(fin.split("/")[1]);

            // On récupère le jour de la date de début reçue en paramètres
            jourDebut = parseInt(debut.split("/")[0]);
            // On récupère le jour de la date de fin reçue en paramètres
            jourFin = parseInt(fin.split("/")[0]);

            // On récupère l'heure de la date de début reçue en paramètres
            heureDebut = parseInt(debut.split(" ")[1].split("h")[0]);
            // On récupère l'heure de la date de fin reçue en paramètres
            heureFin = parseInt(fin.split(" ")[1].split("h")[0]);

            // On récupère la minute de la date de début reçue en paramètres
            minuteDebut = parseInt(debut.split("h")[1]);
            // On récupère la minute de la date de fin reçue en paramètres
            minuteFin = parseInt(fin.split("h")[1]);

            // On construit l'objet Date représentant la date de début reçue en paramètres
            let dateDebutParam = new Date(anneeDebut, moisDebut-1, jourDebut, heureDebut, minuteDebut);
            // On construit l'objet Date représentant la date de fin reçue en paramètres
            let dateFinParam = new Date(anneeFin, moisFin-1, jourFin, heureFin, minuteFin);

            // Si la date de début du rendez-vous est inférieure ou égale à la date de début reçue en paramètres
            // et la date de fin du rendez-vous est supérieure ou égale à la date de fin reçue en paramètres
            if(dateDebut <= dateDebutParam && dateFinParam <= dateFin){
                // On retoune vrai (la plage est déjà occupée)
                return true;

            // Si la date de fin du rendez-vous est supérieure ou égale à la date de début reçue en paramètres
            // et la date de fin du rendez-vous est inférieure ou égale à la date de fin reçue en paramètres
            } else if (dateDebutParam <= dateFin && dateFinParam >= dateFin){
                // On retoune vrai (la plage est déjà occupée)
                return true;

            // Si la date de début du rendez-vous est supérieure ou égale à la date de début reçue en paramètres
            // et la date de début du rendez-vous est inférieure ou égale à la date de début reçue en paramètres
            } else if(dateDebutParam <= dateDebut && dateFinParam >= dateDebut){
                // On retoune vrai (la plage est déjà occupée)
                return true;
            }
        }
    }

    // Si aucun des rendez-vous est sur la plage testée, on retourne false
    return false;
}