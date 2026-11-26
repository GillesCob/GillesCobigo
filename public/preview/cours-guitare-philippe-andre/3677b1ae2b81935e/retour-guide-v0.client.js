/* DONNÉES CLIENT de la page de retour guidée V0 (S-569).
   Tout ce qui varie d'un client à l'autre vit ici et nulle part ailleurs : prénom, tu ou vous, échéance,
   propositions (captures, pages, sections, photos, palettes, menu).
   En production : un objet de ce type par client, dans src/data/previewProjects.ts du Portfolio.
   La structure (écrans, composants, état, enregistrement) est dans retour-guide-v0.html et ne change pas.

   Photos : chaque photo porte soit `s` (numéro de la section qui la contient), soit `after` (numéro de la
   section après laquelle elle apparaît en bande décorative). Aucun texte d'emplacement n'est écrit à la main.
   Capture d'une page : `capture` = { f: fichier, iw/ih: pixels de l'image, h: hauteur de la page dans l'espace de mesure des zones, zones: [[haut, hauteur] par section],
   photoZones: { numéro de photo (0 = première) : [haut, hauteur, option] } }.
   Une page sans `capture` s'affiche avec un plan de page généré depuis ses sections (même composant de numéro). */
window.CLIENT = {
  slug: 'cours-guitare-philippe-andre',
  projet: 'Cours de guitare de Philippe André',
  prenom: 'Philippe',
  sousTitre: 'Cours de guitare à Rezé',
  vouvoiement: false,
  round: { v: 'V0', date: '26 novembre 2026' },
  deadline: 'vendredi 28 novembre',
  /* Formulaire Formspree qui reçoit les retours (même que la page d'échanges du projet). */
  formId: 'xgoggnej',
  /* Adresse mail où le client envoie les photos à modifier (rappel affiché à l'envoi). Vide : le texte renvoie au mail qui accompagne le lien. */
  adresseEnvoiPhotos: '',
  props: {
    p1: {
      label: 'Proposition 1', shot: 'proposition-1.webp',
      /* Polices réelles du site de la proposition (relevées dans son CSS : titres puis texte). */
      police: 'Fraunces et DM Sans',
      /* Adresse du vrai site de cette proposition. Mockup local : chemin servi par localhost:8420. En production : adresse de la preview du Portfolio, à renseigner. */
      url: '/preview/cours-guitare-philippe-andre/8d720daaa28e052a/',
      menu: 'Le menu du haut (Accueil, Cours, Tarifs, Le prof, Témoignages, Liens, Contact)',
      palettes: [['Bleu et cuivre', '#10262f', '#d98f3f'], ['Océan', '#11283b', '#66b2f5'], ['Sauge', '#192e20', '#5ae28c'], ['Prune', '#2e1736', '#d3a0e3'], ['Ambre', '#2d2416', '#ffad33'], ['Graphite', '#212327', '#c8cbd0']],
      pages: [
        { id: 'accueil', name: 'Accueil',
          sections: ['« Un accompagnement sur-mesure »', '« Un site consacré à mes propositions pédagogiques »', '« Ce que je vous propose »', '« Trois niveaux pour progresser »', 'Témoignage de Jean-Yves, élève', '« Parlons de votre projet »'],
          photos: [
            { f: 'p1-hero.webp', t: 'Ampli du bandeau', s: 1 },
            { f: 'p1-philippe.webp', t: 'Portrait en noir et blanc', s: 2 },
            { f: 'p1-rosace.webp', t: 'Bande décorative en forme de rosace', after: 4 },
            { f: 'p1-manches-fond.webp', t: 'Fond de la bande « Parlons de votre projet »', s: 6 }
          ] },
        { id: 'cours', name: 'Cours',
          sections: ['« Des cours de guitare sur-mesure »', '« Un accompagnement musical global »', 'Niveau 1', 'Niveau 2', 'Niveau 3', 'Coaching', '« Un projet de cours ou de coaching ? »'],
          photos: [
            { f: 'p1-frettes-1.webp', t: 'Photo du bandeau', s: 1 },
            { f: 'p1-tete-classique.webp', t: 'Tête de guitare classique', s: 3 },
            { f: 'p1-manche-folk.webp', t: 'Manche de guitare folk', s: 4 },
            { f: 'p1-telecaster-ampli.webp', t: 'Guitare électrique devant un ampli', s: 5 },
            { f: 'p1-trois-manches.webp', t: 'Trois têtes de guitares alignées', s: 6 }
          ] },
        { id: 'prof', name: 'Le prof',
          sections: ['« Mon parcours de musicien »', '« Une vie de musique »', 'Photo de concert', '« Mes projets musicaux »', '« Philippe André partage sa passion pour la guitare au plus grand nombre »', '« Envie de jouer avec moi ? »'],
          photos: [
            { f: 'p1-philippe.webp', t: 'Portrait en noir et blanc', s: 1 },
            { f: 'p1-concert.webp', t: 'Photo de concert', s: 3 },
            { f: 'p1-manches-fond.webp', t: 'Fond de la bande « Envie de jouer avec moi ? »', s: 6 }
          ] },
        { id: 'tarifs', name: 'Tarifs',
          sections: ['« Tarifs, agenda et conditions »', '« Forfaits mensuels »', '« Agenda annuel »', '« Conditions générales des cours »', '« Conditions d\'annulation des cours »', '« Une question sur les formules ? »'],
          photos: [{ f: 'p1-mecanique.webp', t: 'Photo du bandeau', s: 1 }] },
        { id: 'temoignages', name: 'Témoignages',
          sections: ['« Témoignages »', 'Mot de Philippe en introduction', '« Témoignages d\'élèves »', '« Témoignages de groupes »', '« À votre tour de jouer »'],
          photos: [{ f: 'p1-bois-oeillets.webp', t: 'Photo du bandeau', s: 1 }] },
        { id: 'liens', name: 'Liens',
          sections: ['« Liens utiles et conseils »', '« Entretien, réparation et santé du musicien »', '« Ressources sur le Web »', '« Trouver des musiciens pour former un groupe »', '« Téléchargements de supports vierges »', '« Une question avant de vous lancer ? »'],
          photos: [{ f: 'p1-frettes-2.webp', t: 'Photo du bandeau', s: 1 }] },
        { id: 'contact', name: 'Contact',
          sections: ['« Me contacter »', '« Les coordonnées » et « M\'écrire »'],
          photos: [{ f: 'p1-ouie.webp', t: 'Photo du bandeau', s: 1 }] }
      ]
    },
    p2: {
      label: 'Proposition 2', shot: 'proposition-2.webp',
      police: 'Bricolage Grotesque et Figtree',
      url: '/preview/cours-guitare-philippe-andre/3677b1ae2b81935e/V1/P2/',
      menu: 'Le menu du haut (bouton « Menu » et bouton « Me contacter »)',
      palettes: [['Bordeaux', '#9e253f', '#d4eae6'], ['Océan', '#1d5aaf', '#d3e3ee'], ['Sauge', '#2b643e', '#ddead7'], ['Prune', '#8d389f', '#ead7ea'], ['Ambre', '#9d4307', '#f6e6cb'], ['Graphite', '#4f5a69', '#dee0e3']],
      pages: [
        { id: 'accueil', name: 'Accueil',
          sections: ['« Un accompagnement sur-mesure »', '« Où en êtes-vous ? »', '« Un site consacré à mes propositions pédagogiques »', '« Ce que je vous propose »', 'Témoignage de Jean-Yves, élève', '« Parlons de votre projet »'],
          photos: [{ f: 'p2-philippe.webp', t: 'Portrait', s: 3 }] },
        { id: 'apprendre', name: 'Apprendre avec moi',
          sections: ['« Apprendre avec moi »', '« Un accompagnement musical global »', 'Niveau 1', 'Niveau 2', 'Niveau 3', 'Coaching', '« Forfaits mensuels »', '« Agenda annuel »', '« Conditions générales des cours »', '« Un projet de cours ou de coaching ? »'],
          photos: [
            { f: 'p2-tete-classique.webp', t: 'Tête de guitare classique', s: 3 },
            { f: 'p2-manche-folk.webp', t: 'Manche de guitare folk', s: 4 },
            { f: 'p2-telecaster-ampli.webp', t: 'Guitare électrique devant un ampli', s: 5 },
            { f: 'p2-trois-manches.webp', t: 'Trois têtes de guitares alignées', s: 6 }
          ] },
        { id: 'parcours', name: 'Mon parcours',
          sections: ['« Mon parcours de musicien »', '« Une vie de musique »', 'Photo de concert', '« Mes projets musicaux »', '« Philippe André partage sa passion pour la guitare au plus grand nombre »', '« Envie de jouer avec moi ? »'],
          photos: [{ f: 'p2-concert.webp', t: 'Photo de concert', s: 3 }] },
        { id: 'temoignages', name: 'Témoignages',
          sections: ['« Témoignages »', 'Mot de Philippe en introduction', '« Témoignages d\'élèves »', '« Témoignages de groupes »', '« À votre tour de jouer »'],
          photos: [] },
        { id: 'contact', name: 'Contact',
          sections: ['« Me contacter »', '« Les coordonnées » et « M\'écrire »', '« Entretien, réparation et santé du musicien »', '« Ressources sur le Web »', '« Trouver des musiciens pour former un groupe »', '« Téléchargements de supports vierges »'],
          photos: [] }
      ]
    }
  }
};

/* Captures de page entière (1440 px de large, rendu réel des propositions), une par page : mesurées dans le DOM de la page source.
   zones = [haut, hauteur] de chaque section, photoZones = zone de chaque photo, dans l'espace de mesure h (hauteur de la page). */
window.CLIENT_CAPTURES = {
  'p1-accueil': {"f":"cap-p1-accueil.webp","iw":1440,"ih":4008,"h":4008,"zones":[[69,644],[713,695],[1407,550],[1957,636],[2737,444],[3181,354]],"photoZones":{"0":[69,644,"tr"],"1":[802,516,"x",12.22,35.83],"2":[2593,144],"3":[3181,354,"tr"]}},
  'p1-cours': {"f":"cap-p1-cours.webp","iw":1440,"ih":5069,"h":5069,"zones":[[69,592],[661,319],[980,800],[1780,800],[2580,881],[3461,781],[4242,354]],"photoZones":{"0":[141,400,"x",65.55,22.22],"1":[1130,387,"x",51.94,35.83],"2":[1930,387,"x",51.94,35.83],"3":[2770,387,"x",51.94,35.83],"4":[3631,387,"x",51.94,35.83]}},
  'p1-prof': {"f":"cap-p1-prof.webp","iw":1440,"ih":5197,"h":5197,"zones":[[69,592],[661,480],[1141,2021],[3162,586],[3748,622],[4370,354]],"photoZones":{"0":[141,400,"x",65.55,22.22],"1":[1743,760,"x",51.94,35.83],"2":[4370,354,"tr"]}},
  'p1-tarifs': {"f":"cap-p1-tarifs.webp","iw":1440,"ih":5348,"h":5348,"zones":[[69,592],[661,995],[1656,956],[2612,988],[3600,920],[4521,354]],"photoZones":{"0":[141,400,"x",65.55,22.22]}},
  'p1-temoignages': {"f":"cap-p1-temoignages.webp","iw":1440,"ih":7556,"h":7556,"zones":[[69,592],[661,362],[1023,3486],[4509,2219],[6729,354]],"photoZones":{"0":[141,400,"x",65.55,22.22]}},
  'p1-liens': {"f":"cap-p1-liens.webp","iw":1440,"ih":5306,"h":5306,"zones":[[69,592],[661,1240],[1901,1148],[3049,757],[3806,672],[4478,354]],"photoZones":{"0":[141,400,"x",65.55,22.22]}},
  'p1-contact': {"f":"cap-p1-contact.webp","iw":1440,"ih":2111,"h":2111,"zones":[[69,592],[661,977]],"photoZones":{"0":[141,400,"x",65.55,22.22]}},
  'p2-accueil': {"f":"cap-p2-accueil.webp","iw":1440,"ih":5470,"h":5470,"zones":[[66,968],[1034,937],[1970,993],[2964,814],[3777,611],[4389,511]],"photoZones":{"0":[2068,451,"x",56.31,31.33]}},
  'p2-apprendre': {"f":"cap-p2-apprendre.webp","iw":1440,"ih":9820,"h":9820,"zones":[[66,398],[510,375],[885,895],[1781,1063],[2844,1005],[3849,927],[4776,1129],[5905,682],[6587,2058],[8644,605]],"photoZones":{"0":[1173,301,"x",55.59,32.05],"1":[2068,470,"x",12.36,32.05],"2":[3132,319,"x",55.59,32.05],"3":[4137,377,"x",12.36,32.05]}},
  'p2-parcours': {"f":"cap-p2-parcours.webp","iw":1440,"ih":6091,"h":6091,"zones":[[66,513],[579,624],[1203,2229],[3432,682],[4114,802],[4916,605]],"photoZones":{"0":[1301,542,"x",62.06,25.58]}},
  'p2-temoignages': {"f":"cap-p2-temoignages.webp","iw":1440,"ih":4492,"h":4492,"zones":[[66,430],[496,534],[1030,964],[1994,1417],[3411,511]],"photoZones":{}},
  'p2-contact': {"f":"cap-p2-contact.webp","iw":1440,"ih":6081,"h":6081,"zones":[[66,398],[510,1140],[1650,1420],[3070,1020],[4090,606],[4695,815]],"photoZones":{}}
};

/* Types d'éléments réellement présents dans chaque section (relevé dans le DOM des propositions le 26/11) :
   t = titres, x = textes, b = boutons, d = menus déroulants. La mise en page et les photos sont toujours proposées (photos : depuis les données des pages). */
window.CLIENT_TYPES = {
  'p1-accueil': ['txb', 'txb', 'tx', 'tx', 'xb', 'txb'],
  'p1-cours': ['tx', 'tx', 'txd', 'txd', 'txd', 'txbd', 'txb'],
  'p1-prof': ['tx', 'tx', 'x', 'tx', 'txb', 'txb'],
  'p1-tarifs': ['tx', 'tx', 'tx', 'tx', 'tx', 'txb'],
  'p1-temoignages': ['tx', 'x', 'tx', 'tx', 'txb'],
  'p1-liens': ['tx', 'tx', 'tx', 'tx', 'tx', 'txb'],
  'p1-contact': ['tx', 'txb'],
  'p2-accueil': ['txb', 'tx', 'txb', 'tx', 'xb', 'txb'],
  'p2-apprendre': ['tx', 'tx', 'txd', 'txd', 'txd', 'txbd', 'tx', 'tx', 'tx', 'txb'],
  'p2-parcours': ['tx', 'tx', 'x', 'tx', 'txb', 'txb'],
  'p2-temoignages': ['tx', 'x', 'txb', 'txb', 'txb'],
  'p2-contact': ['tx', 'txb', 'tx', 'tx', 'tx', 'tx']
};
/* Contenus à valider à la section concernée (indice de section, à partir de 0) : tarifs, dates, conditions, coord (coordonnées) : un élément de plus dans la liste de la section.
   Le pied de page (coordonnées) se valide à la dernière section de l'accueil. */
window.CLIENT_CONTENTS = {
  'p1-tarifs': { 1: 'tarifs', 2: 'dates', 3: 'conditions', 4: 'conditions' },
  'p1-contact': { 1: 'coord' },
  'p2-apprendre': { 6: 'tarifs', 7: 'dates', 8: 'conditions' },
  'p2-contact': { 1: 'coord' }
};
Object.keys(window.CLIENT.props).forEach(function (p) {
  window.CLIENT.props[p].pages.forEach(function (pg) {
    var k = p + '-' + pg.id;
    pg.capture = window.CLIENT_CAPTURES[k];
    pg.types = window.CLIENT_TYPES[k] || [];
    pg.contents = window.CLIENT_CONTENTS[k] || {};
  });
});
