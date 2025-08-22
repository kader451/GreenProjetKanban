// ----------------------------Structure de données-----------------------------------------
let tableauKanban = [];

// ----------------------------Encadrement général-----------------------------------------
const encadrement = document.createElement('div');
encadrement.className = 'encadrement';
document.body.appendChild(encadrement);

// ----------------------------Démarrage quand DOM est prêt--------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const data = localStorage.getItem("tableauKanban");
    tableauKanban = data ? JSON.parse(data) : [];

    if (tableauKanban.length === 0) {
        tableauKanban = [{ nomListe: "À faire", taches: ["Tache1", "Tache 2"] }];
        localStorage.setItem("tableauKanban", JSON.stringify(tableauKanban));
    }

    // -------------------------------HEADER---------------------------------------------- 
    const headerBlue = document.createElement('div');
    headerBlue.className = 'headerBlue';
    encadrement.appendChild(headerBlue);


    const titreKanbanBoard = document.createElement('h1');
    titreKanbanBoard.textContent = 'Kanban Board';
    headerBlue.appendChild(titreKanbanBoard);

    const monBoutonAddList = document.createElement('button');
    monBoutonAddList.textContent = 'Add List';
    monBoutonAddList.type = 'button';
    monBoutonAddList.className = 'monBoutonAddList';
    headerBlue.appendChild(monBoutonAddList);

    // -------------------------------boiteDesListes---------------------------------------------- 
    const boiteDesListes = document.createElement('main');
    boiteDesListes.id = 'boiteDesListes';
    encadrement.appendChild(boiteDesListes);

    // Reconstruire l’UI depuis le localStorage
    tableauKanban.forEach(liste => {
        creerListe(liste.nomListe, liste.taches);
    });

    // ------------------------------ Fonction pour créer une liste -------------------
    function creerListe(nom, taches = []) {
        const list = document.createElement('section');
        list.className = 'list';

        // Conteneur titre + bouton X
        const headerList = document.createElement('div');
        headerList.className = 'list-header';

        // bouton suppression liste
        const boutonSupprimerListe = document.createElement('button');
        boutonSupprimerListe.type = 'button';
        boutonSupprimerListe.textContent = '×';
        boutonSupprimerListe.className = 'btn-supprimer-liste';
        headerList.appendChild(boutonSupprimerListe);

        const h2 = document.createElement('h2');
        h2.textContent = nom;
        headerList.appendChild(h2);

        boutonSupprimerListe.addEventListener('click', () => {
            if (confirm("Supprimer cette liste ?")) {
                list.remove();
                tableauKanban = tableauKanban.filter(l => l.nomListe !== nom);
                localStorage.setItem("tableauKanban", JSON.stringify(tableauKanban));
            }
        });

        list.appendChild(headerList);

        // --- zone de dépôt --
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'tasks';

        // --- DRAGOVER & DROP ---
        tasksContainer.ondragover = (ev) => {
            ev.preventDefault();
            ev.dataTransfer.dropEffect = "move";
        };
        tasksContainer.ondrop = (ev) => {
            ev.preventDefault();
            const idTache = ev.dataTransfer.getData("text/plain");
            const tache = document.getElementById(idTache);
            if (tache) {
                tasksContainer.appendChild(tache);
                sauvegarderDepuisUI();
            }
        };

        list.appendChild(tasksContainer);

        // Bouton ajouter tâche
        const boutonAddTask = document.createElement('button');
        boutonAddTask.type = 'button';
        boutonAddTask.textContent = 'Add Task';
        list.appendChild(boutonAddTask);

        boutonAddTask.addEventListener('click', () => {
            const nouvelleTache = prompt("Nom de la tâche ?");
            if (!nouvelleTache || !nouvelleTache.trim()) return;
            ajouterCarteDans(tasksContainer, nouvelleTache);
            sauvegarderDepuisUI();
        });

        // Générer les tâches existantes
        taches.forEach(function (t) {
            ajouterCarteDans(tasksContainer, t);
        });

        boiteDesListes.appendChild(list);
    }

    // ------------------------------ Fonction pour ajouter une carte -------------------
    function ajouterCarteDans(tasksContainer, titreTache = "") {
        const card = document.createElement('div');
        card.className = 'task';
        card.id = "task-" + Date.now();
        card.draggable = true;

        // --- DRAGSTART ---
        card.ondragstart = (ev) => {
            ev.dataTransfer.setData("text/plain", ev.target.id);
            ev.dataTransfer.dropEffect = "move";
        };

        const contenuCarte = document.createElement('div');
        contenuCarte.className = 'contenuCarte';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = titreTache;
        input.placeholder = 'Titre de la tâche';
        input.setAttribute('aria-label', 'Titre de la tâche'); 
        contenuCarte.appendChild(input);

        // bouton suppression tâche
        const boutonX = document.createElement('button');
        boutonX.type = 'button';
        boutonX.textContent = '×';
        contenuCarte.appendChild(boutonX);

        boutonX.addEventListener('click', () => {
            card.remove();
            sauvegarderDepuisUI();
        });

        card.appendChild(contenuCarte);
        tasksContainer.appendChild(card);
    }

    // ------------------------------ Bouton Add List -------------------
    monBoutonAddList.addEventListener('click', () => {
        const name = prompt('Nom de la liste ?');
        if (!name || !name.trim()) return;
        creerListe(name.trim(), []);
        sauvegarderDepuisUI();
    });

    // ------------------------------ Sauvegarde depuis l’UI -------------------
    function sauvegarderDepuisUI() {
        const nouvellesDonnees = [];
        document.querySelectorAll(".list").forEach(list => {
            const nomListe = list.querySelector("h2").textContent;
            const taches = [...list.querySelectorAll(".task input")].map(inp => inp.value);
            nouvellesDonnees.push({ nomListe, taches });
        });
        tableauKanban = nouvellesDonnees;
        localStorage.setItem("tableauKanban", JSON.stringify(tableauKanban));
    }
});
