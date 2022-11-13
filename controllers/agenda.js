/*

Module agenda.js

Le but de ce module est de simuler un controller en exportant toutes les fonctions nécessaires 
pour le traitement mais aussi les actions conséquantes, celles pour les requêtes en rapport avec les agendas

*/

"use strict";


// Imports nécessaires au module
import { renderHTML } from "./general.js";

// Fonction qui permet de récuper la page principale des agendas
export function getAgenda(response){
    renderHTML("/calendar/rdv", response); // On "retourne" la page rdv.html dans la réponse
}