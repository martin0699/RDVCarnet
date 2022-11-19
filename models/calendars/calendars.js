/*

Module calendars.js

Le but de ce module est de simuler un model en exportant toutes les fonctions nécessaires 
pour la lecture et l'écriture dans les données persistantes des agendas (le fichier calendars.json)

*/

"use strict";

// Imports nécessaires pour le module
import {existsSync, readFileSync, writeFileSync} from "fs";

const nomFichier = "./models/users/calendars.json";

function noFile(){
    console.log("Le fichier "+nomFichier+" n'existe pas !")
    return false; 
}

export function rdvsTab(){
    if(existsSync(nomFichier)){
        return JSON.parse(readFileSync(nomFichier)); 
    }else{
        noFile(); 
    }
}

export function addCalendar(id, titre, lieu, debut, fin){
    let cal; 
    let donnees = {"ID" : id, "Titre": titre, "Lieu" : lieu, "Debut": debut, "Fin" : fin}; 
    if(existsSync(nomFichier)){
        cal = rdvsTab(); 
        cal.push(donnees); 
    }else{
        cal  = donnees; 
    }

    writeFileSync(nomFichier, JSON.stringify(cal)); 
}


function trCal(tr, donnee, borne){
    let t = document.createElement(borne); 
    tr.append(t); 
    t.append(donnee); 
}

export function afficheCalendar(id){
    if(existsSync(nomFichier)){
        let i = 0; 
        let btd = "td"; 
        let bth = "th"; 
        let cal = rdvsTab(); 
        let tab = document.createElement("table");
        let trt = document.createElement("tr");
        tab.append(trt); 
        trCal(trt, "Titre", bth); 
        trCal(trt, "Lieu", bth); 
        trCal(trt, "Date Debut", bth); 
        trCal(trt, "Date Fin", bth);  
        while(i<cal.length){
            if(cal[i].ID == id){
                let tr = document.createElement("tr");
                tab.append(tr); 
                
                trCal(tr, cal[i].Titre, btd);
                trCal(tr, cal[i].Lieu, btd); 
                trCal(tr, cal[i].Debut, btd);
                trCal(tr, cal[i].Fin, btd); 
            }
            i++; 
        }
        return tab; 
    }else{
        noFile(); 
    }
}
