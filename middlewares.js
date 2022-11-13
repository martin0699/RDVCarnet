"use strict";


import Cookies from "cookies";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export function auth(f, request, response){
    
    let token = new Cookies(request,response).get('access_token');
    dotenv.config();
    
    try{
        jwt.verify(token, process.env.TOKEN_KEY);
        //Utilisateur connectée    
        f(response,response);
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