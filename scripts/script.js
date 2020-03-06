window.addEventListener('load', () => { // Au chargement de la page
    console.log("Chargement de la carte...");
    window.chemins = []; // variable globale pour stocker les chemins
    window.mymap = L.map('map') // On initialise la <div> en tant que carte Leaflet
        .setView([48.8534, 2.3488], 13); // On paramètre la vue de la carte, d'abord latitude, puis longitude, puis le zoom
    //On importe l'image de fond de openstreetmap
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        {attribution: 'Open Street Map'} // Légende en bas à droite
    ).addTo(mymap); // Ajoute l'image à la carte

});

async function fetchNavitiaData() {
    // Données
    let latitudeDepart = document.querySelector("#latdepart").value;
    let longitudeDepart = document.querySelector("#longdepart").value;
    let latitudeArrivee = document.querySelector("#latarrivee").value;
    let longitudeArrivee = document.querySelector("#longarrivee").value;

    let response = await fetch("https://api.navitia.io/v1/coverage/fr-idf/journeys?from=" + longitudeDepart + "%3B" + latitudeDepart + "&to=" + longitudeArrivee + "%3B" + latitudeArrivee + "&key=3b036afe-0110-4202-b9ed-99718476c2e0",
        {
            method: 'GET',
            headers: {
                Authorization: 'logement-social-idf ' + btoa('04f316f2-d3b4-4203-b395-2550565c7e49')
            }
        });

    return await response.json();

}


async function handleClickSearch() {
    fetchNavitiaData().then(result => {
            console.log(result);
            // On enlève l'ancien chemin
            for(const chemin of window.chemins){
                window.mymap.removeLayer(chemin);
            }
            window.chemins = [];
            const itineraire = document.querySelector("#itineraire");
            itineraire.innerHTML = "";
            for (const section of result.journeys[0].sections) {
                let couleur;
                try { // On essaye de recup la couleur
                    couleur = "#" + section.display_informations.color;
                } catch (erreur) { // Si ya pas de couleur (trajet à pied) on met un joli bleu
                    couleur = "#0066CC";
                }
                let styleLigne = {"color": couleur, "weight": 10}; // Création du style de la layer avec la couleur du trajet

                // On recup les infos textuelles pour écrire les instructions
                if (section.from && section.display_informations && section.to && section.from.stop_point && section.to.stop_point) {
                    itineraire.innerHTML += `${section.from.stop_point.name}`;
                    itineraire.innerHTML += `==(${section.display_informations.network} ${section.display_informations.code})`;
                    itineraire.innerHTML += `==> ${section.to.stop_point.name}|`;
                }
                let portionChemin = section.geojson;
                let geojson = L.geoJSON(portionChemin, {style: styleLigne}); // On envoie le GeoJSON à Leaflet pour créer la layer de dessins
                window.chemins.push(geojson); // On met la layer dans le tableau pour pouvoir l'effacer ensuite
                geojson.addTo(window.mymap); // On ajoute la layer à leaflet
            }
        }
    );
}
