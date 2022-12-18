# RDVCarnet

Projet application web avec architecture client-serveur réalisé dans le cadre du module Design Patterns.

Notre équipe est composée de trois personnes, à savoir: NGUYEN Tanguy / GURTNER Martin / RACOILLET Maxime

L'architecture du serveur web est réalisé à l'aide de nodeJS.

-----------------------------------------PRE-REQUIS--------------------------------------------

Il vous faudra vous munir d'un serveur dont le terminal a accès aux commandes suivante:

-> node version 16.17.1

-> npm version 8.15.0

------------------------------DEPLOIEMENT DE L'APPLICATION--------------------------------------

- Ouvrez un terminal et positionnez-vous dans le dossier où vous souhaitez exposer l'application 

- Tapez la commande git clone https://github.com/martin0699/RDVCarnet

-> Le fichier .env

    Vous devez fournir à l'application un fichier .env contenant les variables d'environnements. Un fichier d'exemple
    pré-fait est déjà disponible à la racine du projet. Il doit contenir une clé pour les Json Web Token que nous 
    utilions pour l'authentification sur tout le serveur. On doit aussi fournir le port sur lequel on souhaite exécuter
    l'application ainsi que le nom du serveur.

    Au niveau de la clé, l'idéal est de choisir une phrase assez longue et de la chiffrer en base64 par exemple afin
    de rendre le chiffrement vraiment robuste et donc la sécurité du serveur assez élevée.

    Si vous ne souhaitez pas changer les variables d'environnement par défaut, vous pouvez vous contenter de renommer
    le fichier ".example.env" en ".env". Néanmoins, lors d'un vrai déploiement sur le WEB, il faudrait absoluement
    changer la clé utilisé pour les jetons JWT.

-> Installez les dépendances javascripts de l'application

    Entrez dans le terminal la commande "npm install".

    Cette commande devrait vous charger dans le dossier node_modules à la racine l'ensemble des dépendences de l'application.

-> Compilez les assets à exposer pour les clients

    Entrez maintenant dans le terminal la commande "npm run build".

    Cette commande devrait vous charger dans le dossier public à la racine l'ensemble des assets dont les clients 
    auront besoin pour l'affichage et la réactivité de l'application. Les fichiers qui sont générés sont essentiellement des fichiers CSS et JavaScript. 
    
    Nous avons choisi d'utiliser Parcel afin de construire nos assets. Nous étions obligé d'utiliser un outil de construction à cause de notre choix d'utiliser BootStrap. BootStrap utilise du code SCSS qui n'est pas interprêté
    par les navigateurs. Parcel nous permet donc de convertir le SCSS de BootStrap en code CSS, globalement.

-> Démarrez le serveur 

    Pour finir, tapez la commande "node serveur.js" à la racine du projet.

    Vous devriez voir appraître le message "Serveur lancé." dans le terminale.

    Cette commande aura pour effet de rendre le serveur accessible à l'adresse Web que vous utilisez, sur le port
    d'écoute qui est mentionné dans le fichier ".env". 

-> Accédez à l'adresse "http://{URL}:{PORT}"

    Cela vous permettra d'accédez au client WEB de l'application et ainsi la découvrir, puis vous en servir par 
    la suite !

-------------------------------------------DOCUMENTATION API--------------------------------------------------

Une API est fournise avec le serveur WEB. Nous allons revenir avec vous sur chacun des services rendus
par celle-ci. Globalement, il s'agit d'une API de type REST sur les calendriers d'un utilisateur. Elle comprend
donc aussi la gestion de la connexion et de l'inscription.

Nous avons réalisé nos tests avec le logiciel gratuit POSTMAN. Nous ne pouvons donc pas vous donnez d'exemple de
commandes à taper. Nous ne jugeons pas non plus nécessaire de vous faire un point sur l'utilisation de POSTMAN.
Ce logiciel est vraiment très simple d'utilisation.

-> La création d'un utilisateur

    - URL: "/API/register"
    - METHOD: POST
    - DATA (JSON) à fournir dans le corps de la requête: 
        {
            "id": "le nom d'utilisateur",
            "mdp": "le mot de passe", 
            "retape_mdp": "le même mot de passe que le précédent"
        }
    
    L'application retournera une réponse de type application/json. Cette réponse contiendra systématiquement un champ code. Ce code permet de savoir si l'action s'est correctement passé ou non (OK ou Erreur). Il y a également un champ
    de description sur l'action ou l'erreur qui s'est réalisée.

    Dans le cas où la création d'utilisateur réussi, l'API fournit un jeton JWT. Ce jeton nous permettra d'utiliser les
    requêtes de l'API qui concerne les rendez-vous de notre compte utilisateur fraîchement créé. Il faut donc garder
    ce jeton qui sera valable pendant 2h.

-> L'identification d'un utilisateur

    - URL: "/API/login"
    - METHOD: POST
    - DATA (JSON) à fournir dans le corps de la requête: 
        {
            "id": "le nom d'utilisateur",
            "mdp": "le mot de passe"
        }
    
    L'application retournera une réponse de type application/json. Cette réponse contiendra systématiquement un champ code. Ce code permet de savoir si l'action s'est correctement passé ou non (OK ou Erreur). Il y a également un champ
    de description sur l'action ou l'erreur qui s'est réalisée.

    Dans le cas où la création d'utilisateur réussi, l'API fournit un jeton JWT. Ce jeton nous permettra d'utiliser les
    requêtes de l'API qui concerne les rendez-vous de notre compte utilisateur retrouvé. Il faut donc garder
    ce jeton qui sera valable pendant 2h.
    
-> La récupération d'un rendez-vous en particulier

    - URL: "/API/appointement?id={id_du_rendez-vous}"
    - METHOD: GET
    - HEADER: authorization: Bearer {token_JWT_valide}
    
    L'application retournera une réponse de type application/json. Cette réponse contiendra systématiquement un champ code. Ce code permet de savoir si l'action s'est correctement passé ou non (OK ou Erreur). Il y a également un champ
    de description sur l'action ou l'erreur qui s'est réalisée.

    On remarque que l'application a besoin de s'assurer de l'authenticité de l'utilisateur qui effectue cette requête
    puisqu'il s'agit des rendez-vous d'un seul utilisateur. Vous devez donc mettre dans le champ authorization du header
    de la requête le mot "Bearer" suivi d'un espace puis du token JWT que vous aurez au préalable récupéré via les
    routes qui servent à s'inscrire ou se connecter. Le mot "Bearer" signifie simplement que nous utilisons des jetons 
    de type "Bearer Token".

    Dans le cas où la récupération du rendez-vous réussi l'API fournira dans le champ "rendezVous" le rendez-vous en question sous la forme d'un objet JSON.

-> La suppression d'un rendez-vous en particulier

    - URL: "/API/appointement"
    - METHOD: DELETE
    - HEADER: authorization: Bearer {token_JWT_valide}
    - DATA (JSON) à fournir dans le corps de la requête
        {
            "id": X
        }

        Avec X = l'id du rendez-vous à supprimer (obtenu via la requête de récupération, par exemple).
    
    L'application retournera une réponse de type application/json. Cette réponse contiendra systématiquement un champ code. Ce code permet de savoir si l'action s'est correctement passé ou non (OK ou Erreur). Il y a également un champ
    de description sur l'action ou l'erreur qui s'est réalisée.

    On remarque que l'application a besoin de s'assurer de l'authenticité de l'utilisateur qui effectue cette requête
    puisqu'il s'agit des rendez-vous d'un seul utilisateur. Vous devez donc mettre dans le champ authorization du header
    de la requête le mot "Bearer" suivi d'un espace puis du token JWT que vous aurez au préalable récupéré via les
    routes qui servent à s'inscrire ou se connecter. Le mot "Bearer" signifie simplement que nous utilisons des jetons 
    de type "Bearer Token".

-> L'ajout d'un rendez-vous en particulier

    - URL: "/API/appointement"
    - METHOD: POST
    - HEADER: authorization: Bearer {token_JWT_valide}
    - DATA (JSON) à fournir dans le corps de la requête:
        {
            "titre": "le titre du rendez-vous",
            "dateDebut": "AAAA/MM/JJ"
            "timeDebut": "HH:MM",
            "dateFin": "AAAA/MM/JJ",
            "timeFin": "HH:MM,
            "lieu": "le lieu du rendez-vous"
        }
    
    L'application retournera une réponse de type application/json. Cette réponse contiendra systématiquement un champ code. Ce code permet de savoir si l'action s'est correctement passé ou non (OK ou Erreur). Il y a également un champ
    de description sur l'action ou l'erreur qui s'est réalisée.

    On remarque que l'application a besoin de s'assurer de l'authenticité de l'utilisateur qui effectue cette requête
    puisqu'il s'agit des rendez-vous d'un seul utilisateur. Vous devez donc mettre dans le champ authorization du header
    de la requête le mot "Bearer" suivi d'un espace ainsi que du token JWT que vous aurez au préalable récupéré via les
    routes qui servent à s'inscrire ou se connecter. Le mot "Bearer" signifie simplement que nous utilisons des jetons 
    de type "Bearer Token".

-> La modification d'un rendez-vous en particulier

    - URL: "/API/appointement"
    - METHOD: PATCH
    - HEADER: authorization: Bearer {token_JWT_valide}
    - DATA (JSON) à fournir dans le corps de la requête:
        {
            "id": X,
            "titre": "le titre du rendez-vous",
            "dateDebut": "AAAA/MM/JJ"
            "timeDebut": "HH:MM",
            "dateFin": "AAAA/MM/JJ",
            "timeFin": "HH:MM,
            "lieu": "le lieu du rendez-vous"
        }

        Avec X = l'id du rendez-vous à supprimer (obtenu via la route de récupération, par exemple)
    
    L'application retournera une réponse de type application/json. Cette réponse contiendra systématiquement un champ code. Ce code permet de savoir si l'action s'est correctement passé ou non (OK ou Erreur). Il y a également un champ
    de description sur l'action ou l'erreur qui s'est réalisée.

    On remarque que l'application a besoin de s'assurer de l'authenticité de l'utilisateur qui effectue cette requête
    puisqu'il s'agit des rendez-vous d'un seul utilisateur. Vous devez donc mettre dans le champ authorization du header
    de la requête le mot "Bearer" suivi d'un espace ainsi que du token JWT que vous aurez au préalable récupéré via les
    routes qui servent à s'inscrire ou se connecter. Le mot "Bearer" signifie simplement que nous utilisons des jetons 
    de type "Bearer Token".

-> La récupération de tous les rendez-vous d'une journéee en particulière

    - URL: "/API/appointements?day={JJ}&month={MM}&year={AAAA}"
    - METHOD: GET
    - HEADER: authorization: Bearer {token_JWT_valide}
    
    L'application retournera une réponse de type application/json. Cette réponse contiendra systématiquement un champ code. Ce code permet de savoir si l'action s'est correctement passé ou non (OK ou Erreur). Il y a également un champ
    de description sur l'action ou l'erreur qui s'est réalisée.

    On remarque que l'application a besoin de s'assurer de l'authenticité de l'utilisateur qui effectue cette requête
    puisqu'il s'agit des rendez-vous d'un seul utilisateur. Vous devez donc mettre dans le champ authorization du header
    de la requête le mot "Bearer" suivi d'un espace ainsi que du token JWT que vous aurez au préalable récupéré via les
    routes qui servent à s'inscrire ou se connecter. Le mot "Bearer" signifie simplement que nous utilisons des jetons 
    de type "Bearer Token".

    Dans le cas où la récupération réussie, l'application fournira également un tableau JSON contenant les rendez-vous
    de la journée représenté sous la forme d'objet eux-aussi JSON. On pourra retrouver ce tableau dans le champ "rendezVous". Nous ferons remarqué ici que les rendez-vous sont trié par ordre croissant.

-> La récupération de tous les rendez-vous d'une semaine en particulière

    - URL: "/API/appointements?monday={JJ}&month={MM}&year={AAAA}"
    - METHOD: GET
    - HEADER: authorization: Bearer {token_JWT_valide}
    
    L'application retournera une réponse de type application/json. Cette réponse contiendra systématiquement un champ code. Ce code permet de savoir si l'action s'est correctement passé ou non (OK ou Erreur). Il y a également un champ
    de description sur l'action ou l'erreur qui s'est réalisée.

    On remarque que l'application a besoin de s'assurer de l'authenticité de l'utilisateur qui effectue cette requête
    puisqu'il s'agit des rendez-vous d'un seul utilisateur. Vous devez donc mettre dans le champ authorization du header
    de la requête le mot "Bearer" suivi d'un espace ainsi que du token JWT que vous aurez au préalable récupéré via les
    routes qui servent à s'inscrire ou se connecter. Le mot "Bearer" signifie simplement que nous utilisons des jetons 
    de type "Bearer Token".

    Dans le cas où la récupération réussie, l'application fournira également un tableau JSON contenant les rendez-vous
    de la semaine représenté sous la forme d'objet eux-aussi JSON. On pourra retrouver ce tableau dans le champ "rendezVous". Nous ferons remarqué ici que les rendez-vous sont trié par ordre croissant.


-> La récupération de tous les rendez-vous d'un mois en particulière

    - URL: "/API/appointements?month={MM}&year={AAAA}"
    - METHOD: GET
    - HEADER: authorization: Bearer {token_JWT_valide}
    
    L'application retournera une réponse de type application/json. Cette réponse contiendra systématiquement un champ code. Ce code permet de savoir si l'action s'est correctement passé ou non (OK ou Erreur). Il y a également un champ
    de description sur l'action ou l'erreur qui s'est réalisée.

    On remarque que l'application a besoin de s'assurer de l'authenticité de l'utilisateur qui effectue cette requête
    puisqu'il s'agit des rendez-vous d'un seul utilisateur. Vous devez donc mettre dans le champ authorization du header
    de la requête le mot "Bearer" suivi d'un espace ainsi que du token JWT que vous aurez au préalable récupéré via les
    routes qui servent à s'inscrire ou se connecter. Le mot "Bearer" signifie simplement que nous utilisons des jetons 
    de type "Bearer Token".

    Dans le cas où la récupération réussie, l'application fournira également un tableau JSON contenant les rendez-vous
    du mois représenté sous la forme d'objet eux-aussi JSON. On pourra retrouver ce tableau dans le champ "rendezVous".
    Nous ferons remarqué ici que les rendez-vous sont trié par ordre croissant.





