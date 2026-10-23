/* ============================================================
   GÎTES CŒUR DE LOT : comportements de la version mobile
   (retours de Nathan du 23/10/2026)

   1. Bandes qui défilent : toute liste marquée `data-defile` est enveloppée
      dans un cadre et sa série est écrite une seconde fois (copies muettes).
      Sur téléphone, le CSS fait glisser la liste de la moitié de sa largeur,
      de droite à gauche, sans fin : quand la copie arrive à la place de
      l'original, l'animation reboucle et le raccord ne se voit pas. Sur grand
      écran, le CSS masque les copies et rien ne bouge.
      Les copies sont faites ici plutôt que dans le HTML : elles reprennent
      ainsi le texte de la page, quelle que soit sa langue.
   2. Galerie : cinq photos sur téléphone, puis « Voir plus » ouvre le reste
      et devient « Voir moins ».
   ============================================================ */
(function (window, document) {
  'use strict';

  // Vitesse de défilement, en pixels par seconde (la durée suit la longueur de la bande).
  var VITESSE = 32;

  function bande(liste) {
    var cadre = document.createElement('div');
    cadre.className = 'defile';
    liste.parentNode.insertBefore(cadre, liste);
    cadre.appendChild(liste);
    liste.classList.add('defile__piste');
    Array.prototype.slice.call(liste.children).forEach(function (item) {
      var copie = item.cloneNode(true);
      copie.classList.add('defile__copie');
      // La bande des chiffres attend son entrée à l'écran (compteurs.js) : la
      // copie, elle, arrive directement dans son état final.
      copie.classList.remove('points__item--attente');
      copie.classList.add('points__item--entre');
      Array.prototype.slice.call(copie.querySelectorAll('[data-cible]')).forEach(function (c) {
        c.textContent = c.getAttribute('data-cible');
        c.removeAttribute('data-cible');
      });
      copie.setAttribute('aria-hidden', 'true');
      Array.prototype.slice.call(copie.querySelectorAll('a, button')).forEach(function (el) {
        el.setAttribute('tabindex', '-1');
      });
      liste.appendChild(copie);
    });
    function duree() {
      var largeur = liste.scrollWidth / 2;
      if (largeur > 0) liste.style.setProperty('--defile-duree', Math.round(largeur / VITESSE) + 's');
    }
    duree();
    window.addEventListener('resize', duree);
    window.addEventListener('load', duree);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-defile]')).forEach(bande);

  var voir = document.querySelector('[data-galerie-voir]');
  var grille = document.getElementById('galerie-grille');
  if (voir && grille) {
    voir.addEventListener('click', function () {
      var ouvrir = voir.getAttribute('aria-expanded') !== 'true';
      voir.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
      grille.classList.toggle('galerie__grille--ouverte', ouvrir);
      // En refermant, on revient en haut de la galerie plutôt que de rester
      // perdu plus bas, là où la galerie ouverte s'arrêtait.
      if (!ouvrir) {
        var section = document.getElementById('galerie');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
})(window, document);
