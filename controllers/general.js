/*

Module auth.js

Le but de ce module est de simuler un controller en exportant toutes les fonctions nécessaires 
pour le traitement mais aussi les actions conséquantes, celles qui sont susceptibles de se retrouver 
dans plusieurs modules de contrôles différents.

*/

"use strict";

// Imports nécessaires au module
import fs from "fs";
import dotenv from "dotenv";

// Déclaration d'une constant pour la localisation du dossier Views (les "vues" HTML)
const cheminViews = "./views";

// Fonction qui permet de "retourner" un fichier HTML au sein d'une réponse
export function renderHTML(link, response){

    // Si le fichier HTML voulu existe
    if(fs.existsSync(cheminViews+link+".html")){

        dotenv.config();

        // On lit le contenu du fichier dans le Buffer html
        let html = fs.readFileSync(cheminViews+link+".html");

        html = String(html).split("@AppName");

        html = html[0] + process.env.APP_NAME + html[1];

        // Si le texte lu du fichier contient @errors
        if(html.indexOf("@errors") !== -1){
            // Alors on le retire (car on ne donne par d'erreurs dans cette fonction)
            let tmp = String(html).split("@errors");
            html = tmp[0]+tmp[1];
        }

        if(html.indexOf("@notif") !== -1){
            let tmp = String(html).split("@notif");
            html = tmp[0]+tmp[1];
        }

        // On crée l'entête de la réponse, code 200 (l'opération à réussie)
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8"});
        response.write(html); // On insère le contenu du fichier html (modifié) dans la réponse
        response.end();

    } else { // Si le fichier n'existe pas
        console.log("Le fichier n'existe pas !");
        return false;
    }
}

// Fonction qui permet de "retourner" un fichier HTML au sein d'une réponse mais en y ajoutant des erreurs variables
export function renderHTMLWithErreurs(link, response, erreurs){
    
    // Si le fichier HTML voulu existe
    if(fs.existsSync(cheminViews+link+".html")){

        dotenv.config();

        // On lit le contenu du fichier dans le String html
        let html = String(fs.readFileSync(cheminViews+link+".html"));

        html = html.split("@AppName");

        html = html[0] + process.env.APP_NAME + html[1];

        // Si le texte lu du fichier contient @errors
        if(html.indexOf("@errors") !== -1){
            
            // On remplace @errors par les erreurs fournies en paramètres
            let fichierDecoupe = html.split("@errors");
            html = fichierDecoupe[0];
            erreurs.forEach(item => {
                html += "<div class='row'>"
                            +"<div class='alert alert-danger col-10 offset-1 p-2 alert-dismissible fade show' role='alert'>"
                                +"<div class='row'>"
                                    +"<span class='col-11'>"+item+"</span>"
                                    +"<button type='button' class='btn-close col-1 pt-1 pe-3' data-bs-dismiss='alert' aria-label='Close'></button>"
                                +"</div>"
                            +"</div>"
                        +"</div>";
            });
            html += fichierDecoupe[1];
                
        }

        if(html.indexOf("@notif") !== -1){
            let tmp = html.split("@notif");
            html = tmp[0]+tmp[1];
        }

        // On crée l'entête de la réponse, code 200 (l'opération à réussie)
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8"});
        response.write(html); // On insère le contenu du fichier html (modifié) dans la réponse
        response.end();
        
    } else { // Si le fichier n'existe pas
        console.log("Le fichier n'existe pas !");
        return false;
    }
}

// Fonction qui permet de "retourner" un fichier HTML au sein d'une réponse mais en y ajoutant une notification variable
export function renderHTMLWithNotif(link, response, notif){
    
    // Si le fichier HTML voulu existe
    if(fs.existsSync(cheminViews+link+".html")){

        dotenv.config();

        // On lit le contenu du fichier dans le String html
        let html = String(fs.readFileSync(cheminViews+link+".html"));

        html = html.split("@AppName");

        html = html[0] + process.env.APP_NAME + html[1];

        // Si le texte lu du fichier contient @errors
        if(html.indexOf("@notif") !== -1){
            
            // On remplace @errors par les erreurs fournies en paramètres
            let fichierDecoupe = html.split("@notif");
            html = fichierDecoupe[0];
            
            html += "<div class='row'>"
                        +"<div class='alert alert-success col-10 offset-1 p-2 alert-dismissible fade show' role='alert'>"
                            +"<div class='row'>"
                                +"<span class='col-11'>"+notif+"</span>"
                                +"<button type='button' class='btn-close col-1 pt-1 pe-3' data-bs-dismiss='alert' aria-label='Close'></button>"
                            +"</div>"
                        +"</div>"
                    +"</div>";
            
            html += fichierDecoupe[1];
                
        }

        if(html.indexOf("@errors") !== -1){
            let tmp = html.split("@errors");
            html = tmp[0]+tmp[1];
        }

        // On crée l'entête de la réponse, code 200 (l'opération à réussie)
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8"});
        response.write(html); // On insère le contenu du fichier html (modifié) dans la réponse
        response.end();
        
    } else { // Si le fichier n'existe pas
        console.log("Le fichier n'existe pas !");
        return false;
    }
}

// Fonction qui permet de "retourner" un fichier CSS au sein d'une réponse 
// Elle est très utile pour permettre aux fichiers HTLM d'y accéder si besoin
export function renderCSS(link, response){

    // Si le fichier souhaité existe
    if(fs.existsSync("."+link)){

        // On lit le contenu du fichier dans la variable css
        let css = fs.readFileSync("."+link);

        // On Change le type de l'header de la réponse en précisant qu'il s'agit de css
        response.setHeader("Content-Type", "text/css");
        response.write(css); // On écrit le contenu du fichier CSS dans la réponse
        response.end();

    } else { // Si le fichier n'existe pas
        console.log("Le fichier n'existe pas !");
        return false;
    }
}

// Fonction qui permet de "retourner" un fichier JS au sein d'une réponse 
// Elle est très utile pour permettre aux fichiers HTLM d'y accéder si besoin
export function renderJS(link, response){

    // Si le fichier souhaité existe
    if(fs.existsSync("."+link)){

        // On lit le contenu du fichier dans la variable css
        let js = fs.readFileSync("."+link);

        // On Change le type de l'header de la réponse en précisant qu'il s'agit de css
        response.setHeader("Content-Type", "text/javascript");
        response.write(js); // On écrit le contenu du fichier JS dans la réponse
        response.end();

    } else { // Si le fichier n'existe pas
        console.log("Le fichier n'existe pas !");
        return false;
    }
}

// Fonction qui permet de "retourner" un fichier JS au sein d'une réponse 
// Elle est très utile pour permettre aux fichiers HTLM d'y accéder si besoin
export function renderWoff(link, response){

    // Si le fichier souhaité existe
    if(fs.existsSync("."+link)){

        // On lit le contenu du fichier dans la variable css
        let woff = fs.readFileSync("."+link);

        // On Change le type de l'header de la réponse en précisant qu'il s'agit de css
        response.setHeader("Content-Type", "font/woff");
        response.write(woff); // On écrit le contenu du fichier JS dans la réponse
        response.end();

    } else { // Si le fichier n'existe pas
        console.log("Le fichier n'existe pas !");
        return false;
    }
}

// Fonction qui permet de "retourner" un fichier JS au sein d'une réponse 
// Elle est très utile pour permettre aux fichiers HTLM d'y accéder si besoin
export function renderWoff2(link, response){

    // Si le fichier souhaité existe
    if(fs.existsSync("."+link)){

        // On lit le contenu du fichier dans la variable css
        let woff2 = fs.readFileSync("."+link);

        // On Change le type de l'header de la réponse en précisant qu'il s'agit de css
        response.setHeader("Content-Type", "font/woff2");
        response.write(woff2); // On écrit le contenu du fichier JS dans la réponse
        response.end();

    } else { // Si le fichier n'existe pas
        console.log("Le fichier n'existe pas !");
        return false;
    }
}


// Fonction issue du CM5 du cours, qui permet de lire les données présentent dans le corp d'une requête
export function readStream(stream, limit = Infinity) {

    // On crée une nouvelle promesse
    return new Promise((resolve, reject) => {

        // Déclaration et initialisation des variables nécessaires
        let data = []; // Le tableau de données
        let length = 0; // Le nombre de données

        stream.on("error", reject); // Si la donnée est une erreur, on rejette la promesse
        
        // Si les données sont des vraies données, on les stocks dans le tableau, on augmente leur taille,
        // et on vérifie que celles-ci ne dépassent pas la taille maximum (limit)
        stream.on("data", (chunk) => {
            data.push(chunk);
            length += chunk.length;
            if (data.length > limit) { reject(new Error("Too many data to process.")); }
        });
        
        // Une fois arrivée à la fin du flux, on concatène la destructuration du tableau de données data avec
        // un nouveau tableau vide, et on résoud la promesse avec le toString de ce nouveau tableau
        stream.on("end", () => resolve([].concat(...data).toString()));
    });
}