import { createServer } from "http";
import fs from "fs";

const nomFichier = "../bdd/identifiant.json";
const idAInserer = "TEST1";
const mdpAInserer = "abc123";

let server = createServer((request, response) => { // paramétrage

    if(request.url == "/lecture"){
    
        if(fs.existsSync(nomFichier)) {        
            fs.readFile(nomFichier, function(erreur, fichier) {
                let donnees = JSON.parse(fichier)
                console.log("lecture du fichier JSON:\n", donnees);

                response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                response.write("<h1>Félicitations !</h1><p>La fonctionnalité lecture s'est bien déroulée.</p><p>Le fichier contient:"+JSON.stringify(donnees)+"</p>");
                response.end(); 
                if(erreur){
                    console.log(erreur);
                }
            });
        } else {
            console.log("Le fichier n'existe pas !");
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            response.write("<h1>Félicitations !</h1><p>La fonctionnalité lecture s'est bien déroulée.</p><p>Le fichier n'existe cependant pas !</p>");
            response.end(); 
      
        }

    } else if(request.url == "/ajout"){

        let donnees;

        if(fs.existsSync(nomFichier)) { 
            fs.readFile(nomFichier, function(erreur, fichier) {
                
                donnees = JSON.parse(fichier)
                console.log("Ancienne données du fichier: \n", donnees);
                
                donnees.push({ "ID": idAInserer, "mdp": mdpAInserer});

                fs.writeFile(nomFichier, JSON.stringify(donnees), function(erreur) {
                    if(erreur){
                        console.log(erreur);
                    }
                });

                if(erreur){
                    console.log(erreur);
                }
            });

            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            response.write(`
                <h1>Félicitations !</h1>
                <p>La fonctionnalité ajout s'est bien déroulée.</p>
                <p>Les modifications ont étaient effectuées dans le fichiers json. (les constantes de début de fichier de serveur)</p>
            `);
            response.end();

        } else {

            donnees = [{ "ID": idAInserer, "mdp": mdpAInserer}];
            fs.writeFile(nomFichier, JSON.stringify(donnees), function(erreur) {
                if(erreur){
                    console.log(erreur);
                }
            });

            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            response.write(`
                <h1>Félicitations !</h1>
                <p>La fonctionnalité ajout s'est bien déroulée.</p>
                <p>Les modifications ont étaient effectuées dans le fichiers json. (les constantes de début de fichier de serveur)</p>
            `);
            response.end();
            
        }
  
    } else {

        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.write(`
        <h1>Félicitations !</h1>
        <p>Vous venez de créer votre premier serveur.</p>
        <p>Vous cherchiez à accéder à la ressource <code>${request.url}</code> en
        utilisant la méthode <code>${request.method}</code>.</p>`);
        response.end();
    }
});

server.listen(8500); // start !
console.log("Serveur lancé.");