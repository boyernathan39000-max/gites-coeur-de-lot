/* ============================================================
   GÎTES CŒUR DE LOT : le film de la section « Le domaine »
   Il se lance seul, sans le son et en boucle, dès qu'il arrive à l'écran,
   sans aucun clic, et s'arrête quand on le quitte. Le bouton « Activer le
   son » est facultatif. Le fichier n'est chargé qu'à l'approche de la
   section (preload="none" dans le HTML) ; il démarre à 1,5 s (#t=1.5), après
   le fondu au noir du début, pour ne jamais montrer d'écran noir.
   Animations réduites demandées : rien ne démarre seul, l'image d'attente
   reste et le visiteur garde le bouton pour lancer le film avec le son.
   ============================================================ */
(function (window, document) {
  'use strict';

  /* Hero : boucle drone muette en fond. Animations réduites ou vidéo illisible :
     elle est retirée et les photos du diaporama, posées dessous, prennent le relais.
     Le navigateur diffère la lecture d'un onglet caché : on relance au retour sur
     l'onglet et au départ du rideau de chargement. */
  var hero = document.querySelector('.hero__video');
  if (hero) {
    var retirer = function () { if (hero.parentNode) hero.parentNode.removeChild(hero); };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.pause();
      retirer();
    } else {
      hero.addEventListener('error', retirer, true);
      var lancer = function () {
        if (!hero.parentNode || !hero.paused || document.visibilityState === 'hidden') return;
        var essai = hero.play();
        if (essai && essai.catch) essai.catch(function () { /* lecture bloquée : l'image d'attente reste */ });
      };
      lancer();
      document.addEventListener('visibilitychange', lancer);
      document.addEventListener('tn:rideau-parti', lancer);
    }
  }

  var film = document.querySelector('[data-film-auto]');
  if (!film) return;
  var son = document.querySelector('[data-film-son]');
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var visible = false;

  function lire() {
    if (!visible || document.visibilityState === 'hidden') return;
    var essai = film.play();
    if (essai && essai.catch) essai.catch(function () { /* lecture bloquée : l'image d'attente reste */ });
  }

  if (son) {
    son.addEventListener('click', function () {
      var actif = film.muted;            // muet aujourd'hui : on active le son
      film.muted = !actif;
      son.setAttribute('aria-pressed', actif ? 'true' : 'false');
      son.querySelector('span').textContent = actif ? 'Couper le son' : 'Activer le son';
      if (actif && film.paused) { film.preload = 'auto'; var e = film.play(); if (e && e.catch) e.catch(function () {}); }
    });
  }

  if (reduit || !('IntersectionObserver' in window)) return;

  // À l'approche de la section, on commence à charger le fichier.
  new IntersectionObserver(function (entrees, obs) {
    if (entrees[0].isIntersecting) { film.preload = 'auto'; obs.disconnect(); }
  }, { rootMargin: '600px 0px' }).observe(film);

  // À l'écran (au moins à moitié) : lecture ; hors de l'écran : pause.
  new IntersectionObserver(function (entrees) {
    visible = entrees[0].isIntersecting;
    if (visible) lire(); else film.pause();
  }, { threshold: 0.5 }).observe(film);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') film.pause(); else lire();
  });
})(window, document);
