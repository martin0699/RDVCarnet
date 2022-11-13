/*

Module users.js

Le but de ce module est de simuler un model en exportant toutes les fonctions nécessaires 
pour la lecture et l'écriture dans les données persistantes des utilisateurs (le fichier users.json)

*/

"use strict";

// Imports nécessaires pour le module
import {existsSync, readFileSync, writeFileSync} from "fs";


// Déclaration d'une constante représentant le fichier où sont stockées les donnéess
const nomFichier = "./models/users/users.json";


// Fonction qui permet de récupérer le tableau des utilisateurs stocké dans le fichier
export function readUsers(){
 
    // Si le fichier existe
    if(existsSync(nomFichier)){

        // On retourne le contenu du fichier que l'on parse en JSON (= tableau JS au final)
        return JSON.parse(readFileSync(nomFichier));

    } else { // Si le fichier existe pas
        console.log("Le fichier n'existe pas !");
        return false;
    }
    
} 

// Fonction qui permet l'ajout d'un nouvel utilisateur dans le fichier des données
export function addUser(ident, mdp){
    
    // Déclaration de la variable nécessaire
    let donnees;

    // Si le fichier existe
    if(existsSync(nomFichier)) { 
        // On récupère le contenu du fichier que l'on parse en JSON (= tableau JS au final) 
        donnees = JSON.parse(readFileSync(nomFichier));
        // On ajout le nouvel utilisateur à la fin du tableau
        donnees.push({ "ID": ident, "mdp": mdp});
    } else { // Si le fichier existe pas
        // On peut donc dire que les nouvelles données sont le tableau qui contient uniquement le nouvel utilisateur
        donnees = [{ "ID": ident, "mdp": mdp}];
    }

    // On écrit le nouvel état des données dans le fichier 
    // (création si non existant) (remplacement si déjà présent)
    writeFileSync(nomFichier, JSON.stringify(donnees)); // On reparse le tableau en String représentant le JSON
}


// Fonction qui permet de déterminer si un couple (identifiant/mot de passe) existe dans les données,
// et si oui à quelle position dans le tableau
export function isExist(ident, mdp){

    // On récupère le tableau enregistré dans le fichier
    let users = readUsers();

    // Déclaration d'une variable nécessaire pour la boucle
    let i;

    // Pour tous les utilisateurs du tableau (de 0 à length-1)
    for(i=0; i<users.length; i++){
        // Si l'utilisateur du tableau à les mêmes valeurs de id et mdp que ceux du couple recherché
        if(users[i].ID == ident && users[i].mdp == mdp){
            return i; // On retourne la position actuelle du parcours du tableau
        }
    }

    return -1; // On retourne -1 si on a pas trouvé le couple recherché
}

// Fonction qui permet de déterminer si un identifiant est unique dans les données du fichier
export function isUnique(ident){

    // On récupère le tableau enregistré dans le fichier
    let users = readUsers();

    // Déclaration d'une variable nécessaire pour la boucle
    let i;

    // Pour tous les utilisateurs du tableau (de 0 à length-1)
    for(i=0; i<users.length; i++){

        //Si l'utilisateur du tableau à le même identifiant que l'id reçu en paramètre
        if(users[i].ID == ident){
            return false; // On retune faux car il n'est pas unique 
        }
    }

    return true; // Si on a parcouru tout le tableau sans trouver l'id recherché, il est unique

}