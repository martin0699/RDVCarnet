import 'bootstrap';

// Initialisation lors du chargement de la fenêtre

// Récupération de la date d'aujourd'hui
let date_curseur = new Date();


// Récupération des éléments HTML de la page sur lesquelles on doit travailler
let select_month = document.getElementById('select_months'); // Le selecteur de mois
let select_years = document.getElementById('select_years'); // Le selecteur d'année
let titre_table = document.getElementById('titre_table'); // Le titre du tableau
let titre_colonnes = document.getElementsByClassName("titre_colonne"); // Le titre des colonnes du tableau
let table_body = document.getElementById('table_body'); // Le contenu des colonnes du tableau
let boutonGauche = document.getElementById('bouton_gauche'); // Le bouton pour parcourir à gauche les dates
let boutonDroit = document.getElementById('bouton_droit'); // Le bouton pour parcourir à droite les dates


// Initialisation de la page lors de son chargement
initialiserCurseur(date_curseur); // On met le curseur de la date à celle voulu (lundi du début de la semaine)
// On selectionne dans les selecteurs le mois et l'année de cette semaine
initialiserSelects(select_month, select_years, date_curseur); 
// On mets à jour les informations de date dans le titre du tableau et le titre des colonnes
setInfosJourTableHead(date_curseur, titre_table, titre_colonnes);
// On ajoute les rendez-vous de la semaine dans le tableau
setRendezVousTableBody(date_curseur, table_body);

// On ajoute les réactions aux divers événements de la page (boutton de déplacement, changement de valeur des élément select) 
addEvent();

// Déclaration des fonctions dont nous avons besoin

// Cette fonction permet d'initialiser le curseur au lundi de la semaine en cours
function initialiserCurseur(curseur){

    // Si le jour n'est pas lundi
    if(curseur.getDay() != 1){
    
        // Si le jour est dimanche
        if(curseur.getDay() == 0){
            // On recule de 6 jours pour avoir le lundi
            curseur.setDate( curseur.getDate()-6);
        } else { // Sinon si le jour n'est pas dimanche
            // On recule le curseur jusqu'à lundi
            curseur.setDate( curseur.getDate()-(curseur.getDay()-1));
        }
    }
}


// Cette fonction permet d'initialiser les sélecteurs de mois et d'année en sélectionnant le mois et l'année de la date du curseur
function initialiserSelects(months, years, curseur){
    
    // On sélectionne l'option du select qui contient le mois de la date
    months.children[curseur.getMonth()].selected = true;


    // Pour toute les année de cette année+20 à 1970 
    for(let i=curseur.getFullYear()+20; i>= 1970; i--){
        
        // On créé un noeud de texte contenant le numéro de l'année
        let textOption = document.createTextNode(i);
        // On créer un nouvel élément option (pour le select)
        let option = document.createElement('option');
        // On ajoute le texte de l'année dans l'option
        option.append(textOption);
        // On donne pour valeur le nombre de l'année à l'option (valeur = valeur récupérer lors d'un envoie du formulaire)
        option.value = i;
        
        // Si l'année du curseur est la même que celle de l'option qu'on est en train de créer 
        if(i == curseur.getFullYear()){
            // On sélectionne l'option
            option.selected = true;
        }

        // On ajoute la nouvelle option dans le select
        years.append(option);
    }
}


// Cette fonction permet d'ajouter les événement sur l'ensemble des composants de navigation de la page
function addEvent(){
    
    // On ajoute un événement sur le sélecteur de mois, quand la valeur selectionnée change
    select_month.addEventListener('change', (event) => {
        // On modifie le mois du curseur comme étant celui que l'on vient de sélectionner
        date_curseur.setMonth(event.target.value);
        // On initialise le curseur au lundi de la nouvelle semaine
        initialiserCurseur(date_curseur);
        // On met à jour les données de dates dans le titre du tableau et le titre de ses colonnes
        setInfosJourTableHead(date_curseur, titre_table, titre_colonnes);
        // On ajoute les rendez-vous de la nouvelle semaine dans les colonnes du tableau
        setRendezVousTableBody(date_curseur, table_body);
    });

    // On ajoute un événement sur le sélecteur d'année, quand la valeur sélectionnée change 
    select_years.addEventListener('change', (event) => {
        // On modifie l'année du curseur comme étant celle que l'on vient de sélectionner
        date_curseur.setYear(event.target.value);
        // On initialise le curseur au lundi de la nouvelle semaine
        initialiserCurseur(date_curseur);
        // On met à jour les données de dates dans le titre du tableau et le titre de ses colonnes
        setInfosJourTableHead(date_curseur, titre_table, titre_colonnes);
        // On ajoute les rendez-vous de la nouvelle semaine dans les colonnes du tableau
        setRendezVousTableBody(date_curseur, table_body);
    });

    // On ajoute un événement sur le bouton gauche qui sert à parcourir les dates vers la gauche
    boutonGauche.addEventListener("click", (event) => {
        // On modifie le curseur comme étant le lundi de la semaine d'avant (-7 jours)
        date_curseur.setDate( date_curseur.getDate()-7 );
        // On met à jour les données de date dans le titre du tableau et le titre de ses colonnes
        setInfosJourTableHead(date_curseur, titre_table, titre_colonnes);
        // On ajoute les rendez-vous de la nouvelle semaine dans les colonnes du tableau
        setRendezVousTableBody(date_curseur, table_body);
    });

    // On ajoute un événement sur le bouton droit qui sert à parcourir les dates vers la droite
    boutonDroit.addEventListener("click", (event) => {
        // On modifie le curseur comme étant le lundi de la semaine d'après (+7 jours)
        date_curseur.setDate( date_curseur.getDate()+7 );
        // On met à jour les données de date dans le titre du tableau et le titre de ses colonnes 
        setInfosJourTableHead(date_curseur, titre_table, titre_colonnes);
        // On ajoute les rendez-vous de la nouvelle semaine dans les colonnes du tableau
        setRendezVousTableBody(date_curseur, table_body);
    });

}

// Cette fonction met à jour les données de date dans le titre du tableau et le titre des colonnes, suivant la nouvelle date choisit.
function setInfosJourTableHead(date_curseur, titre, colonnes) {
    
    // On récupère le nom du mois et de l'année concaténé dans un string
    let monthYearString = getStringMonthYear(date_curseur.getMonth(), date_curseur.getFullYear());
    
    // Si le titre du tableau contient déjà des éléments HTML
    if(titre.childNodes.length > 0){
        // On modifie le premier élément qu'il contient (le seul), en lui donnant en texte le nouveau string obtenu
        titre.childNodes[0].textContent = monthYearString;
    } else { // Si le titre ne contient pas d'élément HTML
        // On crée un nouveau noeud de texte dans lequel on ajoute le string obtenu auparavant
        let monthYear = document.createTextNode(monthYearString);
        // On ajoute le nouveau noeud de texte dans le titre du tableau
        titre.append(monthYear);
    }

    // Pour toutes les titres de colonnes du tableau
    for(let i=0; i<titre_colonnes.length; i++){

        // On récupère le texte contenu dans le titre de colonne du tableau
        let textColonne = colonnes[i].childNodes[0].textContent;
        // On récupère le dernier jour du mois en cours
        let dernierJourMois = daysInMonth(date_curseur.getMonth()+1, date_curseur.getYear());
        // On sépare le jour de la semaine du numéro de jour du mois
        textColonne = textColonne.split(" ");
        
        // Si le numéro du jour dépasse le mois en cours
        if(date_curseur.getDate()+i>dernierJourMois){
            // On remplace le numéro de jour en prenant en compte les jours du prochain mois
            textColonne[1] = " "+(date_curseur.getDate()+i-dernierJourMois);
        } else { // Sinon, si le numéro du jour ne dépasse pas le mois en cours
            // On remplace le numéro de jour par le nouveau numéro de jour du mois 
            textColonne[1] = " "+(date_curseur.getDate()+i);
        }

        // On concatène le nom du jour de la semaine avec son numéro de jour du mois
        textColonne = textColonne[0]+textColonne[1];
        // On échange le texte contenu dans le titre de la colonne avec le nouveau que l'on vient de concevoir 
        colonnes[i].childNodes[0].textContent = textColonne;
    }
}

// Cette fonction permet de mettre à jour les rendez-vous contenu dans les colonnes du tableau de rendez-vous
function setRendezVousTableBody(curseur, body){

    // On récupère le numéro de jour du lundi
    let monday = curseur.getDate();
    // On récupère le numéro du mois
    let month = curseur.getMonth()+1;
    // On récupère le numéro de l'année
    let year = curseur.getFullYear();

    // On crée une requète de type GET vers l'adresse "http://localhost:8500/appointements" en founissant en paramètres de l'url les trois données récupérées
    fetch("http://localhost:8500/appointements?monday="+monday+"&month="+month+"&year="+year)
    .then((response) => response.text()) // On récupère le texte de la réponse après avoir eu le retour
    .then((text) => {
        
        // On parse le texte obtenu en JSON
        let responseJSON = JSON.parse(text);
        // On récupère les rendez-vous de la semaine dans la réponse
        let rdvs = responseJSON.rdvs;
        // On initialise un tableau contenant lui-même des tableaux symbolisant les rendez-vous triés par jour de la semaine
        let rdvsParJour = [[], [], [], [], [], [], []];
        // On déclare une variable qui nous servira à retenir le nombre de rendez-vous du jour de la semaine qui à le plus de rendez-vous
        let max = -1;
        // On initialise un booléen de test à false
        let test = false;

        // Tant que le tableau contient des lignes symbolisant les rendez-vous (ou vide si pas de rendez-vous)
        while(body.children.length > 0){
            // On retire la première ligne du tableau
            body.children[0].remove();
        }

        // Pour tous les rendez-vous obtenus en réponse de la requête
        for(let i=0; i<rdvs.length; i++){

            // On récupère le jour de début du rendez-vous
            let jourDebut = parseInt(rdvs[i].dateDebut.split("/")[0]);
            // On récupère le jour de fin du rendez-vous
            let jourFin = parseInt(rdvs[i].dateFin.split("/")[0]);

            // Pour tous les jours entre le début et la fin du rendez-vous (début et fin inclus)
            for(let j=jourDebut; j<=jourFin; j++){
                // On ajoute le rendez-vous dans chacun des jours qu'il concerne
                rdvsParJour[j-curseur.getDate()].push(rdvs[i]);
            }
        }

        // Pour chacun des jours du tableau des rendez-vous triés par jour
        for(let i=0; i<rdvsParJour.length; i++){
            // Si le jour contient plus de rendez-vous que le maximum
            if(rdvsParJour[i].length>max)
                // On modifie le maximum comme étant le nombre de rendez-vous de ce tableau
                max = rdvsParJour[i].length;
        }

        // Si aucun des jours a un rendez-vous
        if(max == 0){
            // On fixe le max à 1 (pour afficher "Vide" partout)
            max = 1;
        }

        // Pour chaque ligne du tableau
        for(let i=0; i<max; i++){
            
            // On crée un nouvel élément tr
            let tr = document.createElement("tr");

            // Pour chaque jour de la semaine
            for(let j=0; j<rdvsParJour.length; j++){

                // Si le nombre de rendez-vous du jour est supérieur au nombre de la ligne -1
                if(rdvsParJour[j].length > i){

                    // On crée un nouvelle élément td
                    let td = document.createElement("td");

                    // On récupère le body de la page HTML
                    let bodyPage = document.getElementById("body");
                    // On crée un nouvelle élement div
                    let contain = document.createElement("div");
                    // On ajoute dans l'élément div le modal de mise à jour du rendez-vous 
                    contain.innerHTML = getModalUpdate(rdvsParJour[j][i]);
                    // Ajoute le nouvelle élément div à la fin du body de la page HTML
                    bodyPage.append(contain);
        
                    // On récupère le jour de début du rendez-vous
                    let jourDebut = parseInt(rdvsParJour[j][i].dateDebut.split("/")[0]);
                    // On récupère le jour de fin du rendez-vous
                    let jourFin = parseInt(rdvsParJour[j][i].dateFin.split("/")[0]);
                    // On récupère l'heure de début du rendez-vous
                    let heureDebut = rdvsParJour[j][i].dateDebut.split(" ")[1];
                    // On récupère l'heure de fin du rendez-vous
                    let heureFin = rdvsParJour[j][i].dateFin.split(" ")[1];

                    // On écrit le début de l'élement td contenant le titre du rendez-vous sous la forme d'un string
                    let contenuTd =
                        "<span>"
                            +"<span class='badge bg-dark mb-2'>"+rdvsParJour[j][i].titre+"</span><br>"
                            +"<u>Horaires:</u> ";
                            
                    // Si le jour de début est égale au jour de fin
                    if(jourDebut == jourFin){
                        // On ajoute à la fin du string les heures de début et de fin
                        contenuTd += heureDebut+"/"+heureFin;
                    } else { // Sinon, si le jour de début est égale au jour de fin
                        // Si le jour de la semaine est égale au jour de début
                        if(curseur.getDate()+j == jourDebut){
                            // On ajoute à la fin du string l'heure de début, et l'heure de fin (la dernière de la journée)
                            contenuTd += heureDebut+"/23h59";
                        // Sinon, si le jour de la semaine est égale au jour de fin
                        } else if(curseur.getDate()+j == jourFin){
                            // On ajoute à la fin du string l'heure de début (première de la journée) et l'heure de fin
                            contenuTd += "00h00/"+heureFin;
                        } else { // Sinon, si le jour de la semaine n'est pas égale au jour de début, ni au jour de fin
                            // On ajoute à la fin du string l'heure de début et de fin comme étant les première et dernières de la journée
                            contenuTd += "00h00/23h59";
                        }
                    }

                    // On ajout à la fin du string la fin du contenu du td, avec notament le lieu du rendez-vous
                    // ainsi que les boutons de supression et de modification
                    contenuTd +=
                            "<br><u>Lieu:</u> "+rdvsParJour[j][i].lieu+"<br>"
                        +"</span>"
                        +"<div class='row'>"
                            +"<div class='col-md-4 offset-md-1 mt-3'>"
                                +"<button data-bs-toggle='modal' data-bs-target='#setModal_"+rdvsParJour[j][i].id+"' class='btn btn-warning'>"
                                    +"<i class='bi bi-pencil-fill'></i>"
                                +"</button>"      
                            +"</div>"
                            +"<div class='col-md-4 offset-md-2 mt-3'>"
                                +"<button data-id='"+rdvsParJour[j][i].id+"' class='btn btn-danger btn-supp'>"
                                    +"<i data-id='"+rdvsParJour[j][i].id+"' class='bi bi-trash-fill '></i>"
                                "</button>"    
                            +"</div>"
                        +"</div>";

                    // On ajoute au sein du td le string précédemment créé
                    td.innerHTML = contenuTd;
                    // On ajoute au td les classes nécessaire
                    td.className = "bg-success rdv_"+rdvsParJour[j][i].id;
                    // On passe le booléen de test à true
                    test = true;
                    
                    //Si le nombre de rendez-vous du jour est inférieur au nombre de rendez-vous du 
                    // jour de la semaine en ayant le plus 
                    if(rdvsParJour[j].length < max){
                        // Si le numéro de la ligne que nous sommes en train de créer est égale au nombre de 
                        // rendez-vous du jour
                        if(rdvsParJour[j].length-1 == j){
                            // Le td doit occupé en nombre de ligne l'espace d'un jour + le reste du tableau
                            td.rowSpan = max/rdvsParJour[j].length + max%rdvsParJour[j].length;
                        } else { // Sinon
                            // Le td doit occupé en nombre de ligne l'espace d'un jour
                            td.rowSpan = max/rdvsParJour[j].length;
                        }
                    }

                    // On ajoute le td conçu à la ligne (l'élément tr)
                    tr.append(td);

                // Sinon, si le nombre de rendez-vous n'est pas supérieur au nombre de la ligne -1
                } else {
                    // Si nous somme à la première ligne du tableau
                    if(i==0){
                        // On crée un nouvel élément td
                        let td = document.createElement("td");
                        // On créer un nouveau noeud de texte qui contient "Vide"
                        let textVide = document.createTextNode("Vide");
                        // On ajoute au td la classe nécessaire
                        td.className = "bg-secondary";
                        // Le td doit occupé toutes les lignes du tableau
                        td.rowSpan = max;
                        // On ajoute le noeud texte au sein du td
                        td.append(textVide);
                        // On ajoute le td au sein du tr
                        tr.append(td);
                    }
                }
            }
            // On ajoute le tr au sein du body du tableau HTML
            body.append(tr);
        }

        // Si la booléen test est à vrai (nous avons donc ajouté des rendez-vous dans le tableau)
        if(test){
            // On récupère tous les boutons qui servent à supprimer un rendez-vous
            let btnsSupp = document.getElementsByClassName('btn-supp');

            // Pour chacun des boutons
            for(let i=0; i<btnsSupp.length; i++){
                // On ajoute l'événement associé au clic sur l'un des boutons
                btnsSupp[i].addEventListener("click", (event) => {
                    clickBtnSupp(event);
                });
            }
        }
    
    });
}

// Cette fonction permet de réaliser l'action de l'événement appelé lorsqu'on clique sur un bouton de suppression
function clickBtnSupp(event){

    // On récupère l'id du rendez-vous concerné
    let id = event.target.dataset.id;

    // On effectue une requête de type DELETE sur le serveur, à l'adresse "http://localhost:8500/appointement",
    // et contenant en paramètre de l'url l'id du rendez-vous
    fetch("http://localhost:8500/appointement?id="+id, {method:"DELETE"})
    .then((response) => response.text()) // On récupère le texte de la réponse
    .then((text) => {
        
        // On converti le texte de la réponse au format JSON
        let responseJSON = JSON.parse(text);

        // Si le code de la réponse est "OK"
        if(responseJSON.code == "OK"){

            // On récupère les éléments td qui concerne ce rendez-vous
            let tds = document.getElementsByClassName("rdv_"+id);
            
            // Pour chacun des éléments td
            for(let i=0; i<tds.length; i++){
                // On modifié son contenu comme étant le noeud de texte "Vide"
                tds[i].innerHTML = "Vide";
                // On modifie les classes du td
                tds[i].className = "bg-secondary "+"rdv_"+id;
            }
        }

        // On récupère le container contenant les éléments HTML (sauf le menu)
        let container = document.getElementById('container');
        // On créer en string le début d'un code HTML pour la notification
        let textHTMLNotif = 
            "<div class='row'>"
                +"<div class='alert ";
        
        // Si le code de la réponse est "OK"
        if(responseJSON.code == "OK") {
            // On ajoute une notification de succès
            textHTMLNotif += "alert-success ";
        } else { // sinon
            // On ajoute une notification d'érreur
            textHTMLNotif += "alert-danger ";
        }
        
        //On ajoute ensuite la suite de la notification jusqu'au texte qu'elle contient (exclut)
        textHTMLNotif += 
                "col-10 offset-1 p-2 alert-dismissible fade show' role='alert'>"
                    +"<div class='row'>"
                        +"<span class='col-11'>";
                        
        // Si le code de la réponse est égale à "OK"
        if(responseJSON.code == "OK"){
            // On ajoute le texte qui informe de la réussite de l'opération
            textHTMLNotif += "Le rendez-vous a bien été supprimé !";
        } else { // Sinon
            // On ajoute le texte qui informe de l'erreur de l'opération
            textHTMLNotif += "Le rendez-vous n'a pas pu être supprimé !";
        }
        
        // On termine ensuite le code HTML de la notification
        textHTMLNotif += 
                        "</span>"
                        +"<button type='button' class='btn-close col-1 pt-1 pe-3' data-bs-dismiss='alert' aria-label='Close'></button>"
                    +"</div>"
                +"</div>"
            +"</div>";
        
        // On ajoute dans le container le texte de la notification, puis l'ancien contenu du container
        container.innerHTML = textHTMLNotif + container.innerHTML;
      
        // On récupère ensuite tous les boutons de supressions de rendez-vous présents sur la page
        let btnsSupp = document.getElementsByClassName('btn-supp');
    
        // Pour chacun des boutons
        for(let i=0; i<btnsSupp.length; i++){
            // On remet l'événement sur le bouton (le changement de contenu du container les supprime)
            btnsSupp[i].addEventListener("click", (event) => {
                clickBtnSupp(event);
            });
        }
        
        // On récupère le sélecteur HTML pour les mois 
        select_month = document.getElementById("select_months");
        // On récupère le sélecteur HTML pour les années 
        select_years = document.getElementById("select_years");
        // On récupère le bouton de navigation vers la gauche
        boutonGauche = document.getElementById("bouton_gauche");
        // On récupère le bouton de navigation vers la droite
        boutonDroit = document.getElementById("bouton_droit");
        // On remets en option selectionnée l'année et le mois de la semaine en cours 
        // (le changement du contenu du container les remettait à zéro)
        initialiserSelects(select_month, select_years, date_curseur);
        // On ajoute les événement sur l'ensemble de la page (le changement du contenu du container les supprimait)
        addEvent();

    });
}

// Fonction qui permet de récupéré le dernier jour d'un mois 
// Month = mois suivant
function daysInMonth(month, year) {
    // on reture le numéro du jour du mois précédent
    return new Date(year, month, 0).getDate();
}

// Fonction qui permet de mettre le mois et l'année d'une date sous la forme d'un string
function getStringMonthYear(month, year){

    // On étudie la valeur de l'index de mois
    switch(month){
        // S'il est égale à 0
        case 0:
            // On retourne le mot "Janvier" concaténé avec l'année de la date
            return "Janvier "+year;
        // S'il est égale à 1
        case 1: 
            // On retourne le mot "Février" concaténé avec l'année de la date
            return "Février "+year;
        // S'il est égale à 2
        case 2: 
            // On retourne le mot "Mars" concaténé avec l'année de la date
            return "Mars "+year;
        // S'il est égale à 3
        case 3: 
            // On retourne le mot "Avril" concaténé avec l'année de la date
            return "Avril "+year;
        // S'il est égale à 4
        case 4: 
            // On retourne le mot "Mai" concaténé avec l'année de la date
            return "Mai "+year;
        // S'il est égale à 5
        case 5:
            // On retourne le mot "Juin" concaténé avec l'année de la date
            return "Juin "+year;
        // S'il est égale à 6
        case 6: 
            // On retourne le mot "Juillet" concaténé avec l'année de la date
            return "Juillet "+year;
        // S'il est égale à 7
        case 7: 
            // On retourne le mot "Aout" concaténé avec l'année de la date
            return "Aout "+year;
        // S'il est égale à 8
        case 8:
            // On retourne le mot "Septembre" concaténé avec l'année de la date
            return "Septembre "+year;
        // S'il est égale à 9
        case 9:
            // On retourne le mot "Octobre" concaténé avec l'année de la date
            return "Octobre "+year;
        // S'il est égale à 10
        case 10:
            // On retourne le mot "Novembre" concaténé avec l'année de la date
            return "Novembre "+year;
        // S'il est égale à 11
        case 11:
            // On retourne le mot "Décembre" concaténé avec l'année de la date
            return "Décembre "+year;
    }
}

// Cette fonction permet de retourner le modal de modification associé à un rendez-vous
function getModalUpdate(rdv){
    
    // On récupère l'année de début du rendez-vous
    let anneeDebut = parseInt(rdv.dateDebut.split(" ")[0].split("/")[2]);
    // On récupère l'année de fin du rendez-vous
    let anneeFin = parseInt(rdv.dateFin.split(" ")[0].split("/")[2]);

    // On récupère le mois de début du rendez-vous
    let moisDebut = parseInt(rdv.dateDebut.split("/")[1]);
    // On récupère le mois de fin du rendez-vous
    let moisFin = parseInt(rdv.dateFin.split("/")[1]);

    // On récupère le jour de début du rendez-vous
    let jourDebut = parseInt(rdv.dateDebut.split("/")[0]);
    // On récupère le jour de fin du rendez-vous
    let jourFin = parseInt(rdv.dateFin.split("/")[0]);

    // On récupère l'heure de début du rendez-vous
    let heureDebut = parseInt(rdv.dateDebut.split(" ")[1].split("h")[0]);
    // On récupère l'heure de fin du rendez-vous
    let heureFin = parseInt(rdv.dateFin.split(" ")[1].split("h")[0]);

    // On récupère la minute de début du rendez-vous
    let minuteDebut = parseInt(rdv.dateDebut.split("h")[1]);
    // On récupère la minute de fin du rendez-vous
    let minuteFin = parseInt(rdv.dateFin.split("h")[1]);

    // On construit l'objet Date représentant la date de début
    let dateDebut = new Date(anneeDebut, moisDebut-1, jourDebut, heureDebut, minuteDebut);
    // On construit l'objet Date représentant la date de fin
    let dateFin = new Date(anneeFin, moisFin-1, jourFin, heureFin, minuteFin);

    // On récupère la date de début (au format ISO)
    let dateDebutInput = dateDebut.toISOString().substring(0,10);
    // On récupère l'heure de début (au format ISO)
    let timeDebutInput = dateDebut.toISOString().substring(11,16);

    // On récupère la date de fin (au format ISO)
    let dateFinInput = dateFin.toISOString().substring(0,10);
    // On récupère l'heure de fin (au format ISO)
    let timeFinInput = dateFin.toISOString().substring(11,16);

    // On sépare l'heure de début en deux avec ":" comme séparateur
    timeDebutInput = timeDebutInput.split(":");
    // On sépare l'heure de fin en deux avec ":" comme séparateur
    timeFinInput = timeFinInput.split(":");

    // On incrémente l'heure de début au format ISO de 1 
    timeDebutInput[0] = ""+(parseInt(timeDebutInput[0])+1);
    // On incrémente l'heure de fin au format ISO de 1
    timeFinInput[0] = ""+(parseInt(timeFinInput[0])+1);

    // On reconstitue les nouvelles heure + minute de début au format ISO 
    timeDebutInput = timeDebutInput[0] + ":" + timeDebutInput[1];
    // On reconstitue les nouvelles heure + minute de fin au format ISO 
    timeFinInput = timeFinInput[0] + ":" + timeFinInput[1];

    // On retourne un string contenant le code HTML du modal associé au rendez-vous (avec les champs pré-rempli)
    return "<div class='modal fade' id='setModal_"+rdv.id+"' tabindex='-1' aria-labelledby='setModalLabel' aria-hidden='true'>"
            +"<div class='modal-dialog modal-lg modal-dialog-centered'>"
                +"<div class='modal-content'>"
                    +"<div class='modal-header bg-warning'>"
                        +"<h1 class='modal-title fs-5' id='ajoutModalLabel'>Modifier un rendez-vous</h1>"
                        +"<button type='button' class='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>"
                    +"</div>"
                    +"<form method='POST' action='/setAppointement'>"
                        +"<input type='hidden' value='"+rdv.id+"' name='id'>"
                        +"<div class='modal-body'>"
                            +"<div class='row'>"
                                +"<div class='col-12'>"
                                    +"<label for='titleNew'>Titre/Description:</label>"
                                    +"<input class='form-control' type='text' id='titleNew' placeholder='Titre ou description..' name='titre' value='"+rdv.titre+"'>"
                                +"</div>"
                            +"</div>"
                            +"<div class='row mt-3'>"
                                +"<div class='col-lg-6 mb-3'>"
                                    +"<label for='dateDebutNew'>Date de début:</label>"
                                    +"<input type='date' class='form-control' placeholder='Date de début..' id='dateDebutNew' name='dateDebut' value='"+dateDebutInput+"'>"
                                +"</div>"
                                +"<div class='col-lg-6 mb-3'>"
                                    +"<label for='timeDebutNew'>Heure de début:</label>"
                                    +"<input type='time' class='form-control' id='timeDebutNew' name='timeDebut' value='"+timeDebutInput+"'>"
                                +"</div>"
                            +"</div>"
                            +"<div class='row'>"
                                +"<div class='col-lg-6 mb-3'>"
                                    +"<label for='dateFinNew'>Date de fin:</label>"
                                    +"<input type='date' class='form-control' id='dateFinNew' name='dateFin' value='"+dateFinInput+"'>"
                                +"</div>"
                                +"<div class='col-lg-6 mb-3'>"
                                    +"<label for='timeFinNew'>Heure de fin:</label>"
                                    +"<input type='time' class='form-control' id='timeFinNew' name='timeFin' value='"+timeFinInput+"'>"
                                +"</div>"
                            +"</div>"
                            +"<div class='row'>"
                                +"<div class='col-12 mb-3'>"
                                    +"<label for='lieuNew'>Lieu:</label>"
                                    +"<input type='text' class='form-control' placeholder='Lieu..' id='lieuNew' name='lieu' value='"+rdv.lieu+"'>"
                                +"</div>"
                            +"</div>"
                        +"</div>"
                        +"<div class='modal-footer'>"
                            +"<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Fermer</button>"
                            +"<button type='submit' class='btn btn-primary'>Enregistrer</button>"
                        +"</div>"
                    +"</form>"
                +"</div>"
            +"</div>"
        +"</div>"
}