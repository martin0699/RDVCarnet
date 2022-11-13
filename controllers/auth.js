/*

Module auth.js

Le but de ce module est de simuler un controller en exportant toutes les fonctions nécessaires 
pour le traitement mais aussi les actions conséquantes, celles pour les requêtes en rapport avec l'authentification

*/

"use strict";

// Imports nécessaires au module
import {isExist, isUnique, addUser} from "../models/users/users.js";
import {renderHTML, renderHTMLWithErreurs, readStream} from "./general.js";
import jwt from "jsonwebtoken";
import Cookies from "cookies";
import dotenv from "dotenv";

// Fonction qui permet de récupérer la page contenant le formulaire de connexion
export function getFormLogin(request, response){
    renderHTML("/auth/login", response); // On "retourne" la page login.html dans la réponse
}


// Fonction qui permet de gérer la soumission du formulaire de connexion
export async function login(request, response){

    // Récupération des données transmises dans le corp de la requête
    let body = await readStream(request); // Utilisation de la fonction vu dans le CM5 pour analyser le corp
    
    // Les champ étant séparer par des '&' dans le Buffer, on le sépare en deux tableaux avec ce séparateur
    body = body.split("&"); 

    // Les champs étant de la forme nom=valeur, on les segmentent en 2 tableaux sur le séparateur '='
    body[0] = body[0].split("=");
    body[1] = body[1].split("=");

    // Si l'on a pas les deux nom de champs attendus
    if(body[0][0] != "id" || body[1][0] != "mdp"){

        // Préparation de l'html pour l'erreur (dans un tableau car la fonction appelée ensuite est ainsi..)
        let erreur = ["<p>Tous les champs attendus n'ont pas était transmis !</p>"];
        
        // On "retourne" la page login.html dans la réponse, en ajoutant y ajoutant l'erreur (voir la fonction)
        renderHTMLWithErreurs("/auth/login", response, erreur);
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

        // On ajoute le token au sein de cookie de l'utilisateur (pour pouvoir vérifier son authentification)
        new Cookies(request,response).set('access_token',token , {
            httpOnly: true,
            secure: false
        });


        // On retourne maintenant une reponse de redirection vers la page d'accueil des agendas
        response.writeHead(302, {
            'Location': '/'
        });
        response.end();    
        
    } else { // Si le couple ident/mdp n'existe pas dans les données de l'application

        // Préparation du HTML pour l'erreur (dans un tableau car la fonction appelée ensuite est ainsi..)
        let erreur = ["<p>Les informations renseignées correspondent avec aucun compte !</p>"];
        // On "retourne" la page login.html dans la réponse, mais en y affichant l'erreur (voir la fonction)
        renderHTMLWithErreurs("/auth/login", response, erreur);
        return; // On utilise return pour stopper l'exécution de la fonction (on vient de répondre au client)
    }

}

// Fonction qui permet de récupérer la page contenant le formulaire d'inscription
export function getFormRegister(request, response){
    renderHTML("/auth/register", response); // On "retourne" la page register.html dans la réponse
}


// Fonction qui assure la gestion d'une soumission du formulaire d'inscription
export async function register(request, response){

    // Récupération des données transmises dans le corp de la requête
    let body = await readStream(request); // Utilisation de la fonction vu dans le CM5 pour analyser le corp

    // Les champ étant séparer par des '&' dans le Buffer, on le sépare en trois tableaux avec ce séparateur
    body = body.split("&");

    // Les champs étant de la forme nom=valeur, on les segmentent en 2 tableaux sur le séparateur '='
    body[0] = body[0].split("=");
    body[1] = body[1].split("=");
    body[2] = body[2].split("=");

    // Si l'on a pas les trois nom de champs attendus
    if(body[0][0] != "id" || body[1][0] != "mdp" || body[2][0] != "retape_mdp"){

        // Préparation du HTML pour l'erreur (dans un tableau car la fonction appelée ensuite est ainsi..)
        let erreur = ["<p>Tous les champs attendus n'ont pas était transmis !</p>"];
        // On "retourne" la page login.html dans la réponse, mais en y affichant l'erreur (voir la fonction)
        renderHTMLWithErreurs("/auth/register", response, erreur);
        return; // On utilise return pour stopper l'exécution de la fonction (on vient de répondre au client)
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
        erreurs.push("<p>La taille de l'identifiants doit être comprise entre 3 et 10 caractères inclus !</p>");
    }

    // Si l'identifiant ne contient pas que des caractères alphanumériques
    if(!ident.match(/^[0-9a-z]+$/i)){
        // On ajout l'html pour l'erreur dans le tableau des erreurs
        erreurs.push("<p>L'identifiant doit contenir que des caractères de type alphanumérique!</p>");
    }

    // Si la taille du mot de passe est inférieure à 6
    if(mdp.length < 6){
        // On ajout l'html pour l'erreur dans le tableau des erreurs
        erreurs.push("<p>Le mot de passe doit faire un minimum 6 caractères!</p>");
    }

    // Si on a au moins une erreur
    if(erreurs.length > 0){
        // On "retourne" la page register.html dans la réponse, en y ajoutant les erreurs du tableau
        renderHTMLWithErreurs("/auth/register", response, erreurs);
        return; // On utilise return ici pour stopper l'exécution de la fonction (on vient de répondre au client)
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

            // On ajoute le token au sein de cookie de l'utilisateur (pour pouvoir vérifier son authentification)
            new Cookies(request,response).set('access_token',token , {
                httpOnly: true,
                secure: false
            });

            // On retourne maintenant une réponse de redirection vers la page d'accueil des agendas
            response.writeHead(302, {
                'Location': '/'
            });
            response.end();
        
        } else { // Si les deux saisies de mot de passe ne sont pas égaux

            // Préparation du HTML pour l'erreur (dans un tableau car la fonction appelée ensuite est ainsi..)
            let erreur = ["<p>Les deux saisies de mot de passe doivent être identiques !</p>"];
            // On "retourne" la page register.html dans la réponse, en y ajoutant le erreur précédente
            renderHTMLWithErreurs("/auth/register", response, erreur);
            return; // On utilise return ici pour stopper l'exécution de la fonction (on vient de répondre au client)
        
        }

    } else { // Si il existe déjà un utilisateur avec cette identifiant

        // Préparation du HTML pour l'erreur (dans un tableau car la fonction appelée ensuite est ainsi..)
        let erreur = ["<p>Le champ identification est déjà utilisé !</p>"];
        // On "retourne" la page register.html dans la réponse, en y ajoutant le erreur précédente
        renderHTMLWithErreurs("/auth/register", response, erreur);
        return; // On utilise return ici pour stopper l'exécution de la fonction (on vient de répondre au client)

    }

}


// Fonction qui permet de gérer la désauthentification d'un utilisateur
export function logout(request, response){

    // On ajout une chaîne de caractère vide à la place du cookie (suppression du JWT)
    new Cookies(request,response).set('access_token', "" , {
        httpOnly: true,
        secure: false
    });

    // On "retourne" une réponse de redirection vers la page du formulaire de connexion
    response.writeHead(302, {
        'Location': '/login'
    });
    response.end();
}