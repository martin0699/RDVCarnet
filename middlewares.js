"use strict";


import Cookies from "cookies";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export function auth(f, request, response){
    
    let token = new Cookies(request,response).get('access_token');
    dotenv.config();
    let decode;
    
    try{
        decode = jwt.verify(token, process.env.TOKEN_KEY);
         //Utilisateur connectée    
        f(request, response, decode.id);
    } catch(Error) {

        // UTILISATEUR NON CONNECTEE
        response.writeHead(302, {
            'Location': '/login'
        });
        response.end();
    }
}

export function guest(f, request, response){
    
    let token = new Cookies(request,response).get('access_token');
    dotenv.config();
    
    try{
        jwt.verify(token, process.env.TOKEN_KEY);
        //Utilisateur connectée      
        response.writeHead(302, {
            'Location': '/'
        });
        response.end();
    } catch {
        // UTILISATEUR NON CONNECTEE
       f(request, response);
    }
}

export function authAPI(f, request, response){
   
    if(request.headers.authorization == undefined){
        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Vous devez fournir un token de connexion valide dans les autorisations !"
        }));
        response.end();
    }
   
    let token = request.headers.authorization.split(" ")[1];

    dotenv.config();
    let decode;
    
    try{
        decode = jwt.verify(token, process.env.TOKEN_KEY);
        //Utilisateur connectée    
        f(request, response, decode.id);
    } catch(Error) {

        // On retourne une réponse de type JSON indiquant l'erreur
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8"});
        response.write(JSON.stringify({
            "code": "Erreur", 
            "description": "Vous devez fournir un token de connexion valide dans les autorisations !"
        }));
        response.end();
    }
    
}