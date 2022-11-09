/*function tableau(data){
    let string = data.toString(); 
    let row = string.split('\n'); 
    let colums = row[0].split(','); 
    let tab = new Array(row.length); 
    for(i = 0; i<row.length; i++){
        colums = row[i].split(','); 
        tab[i] = new Array(colums.length); 
        for(j = 0; j<colums.length;j++){
            tab[i][j] = colums[j]; 
        }
    }
    return tab; 
}

function MDP(id,mdp){
    //Vérifier le mot de passe avec l'identifiant avec comptes.csv
    const fs = require('fs')
    let res = true; 

    fs.readFile('bdd/comptes.csv', (err, data) => {
        if (err) throw err;
        let tab = tableau(data); 
        console.log(tab[0][1]); 
        let i = 0; 
        let find = false; 
        res = false; 
        while(i<tab.length && !find){
            if(tab[i][0]==id){
                find = true; 
                if(tab[i][1] == mdp){
                    res = true; 
                }else{
                    res = false; 
                }
            }else{
                i++; 
            }
        }
    }); 
    return res; 
}

function ajoutRDV(titre, auteur, date, lieu, debut,fin){
    //Ajouter Rendez vous dans rdvs.csv
}

console.log(MDP("Martin","1234")); */

