/* ============================================================
   GÎTES CŒUR DE LOT : Formulaire de contact
   Quatre champs : nom et prénom, email, téléphone, demande.
   Validation en français, messages inline (jamais d'alert()),
   piège à robots (honeypot), et repli mailto: tant qu'aucun service
   n'est branché.

   BRANCHEMENT : la cliente a un logiciel de gestion (Amenitiz) auquel le
   site sera connecté. Pour envoyer les demandes à un service, renseigner
   l'attribut `action` du <form> dans index.html et mettre
   `data-envoi="service"`. Sans cela, le repli mailto: prend le relais.
   ============================================================ */
(function (window, document) {
  'use strict';
  var TN = window.TN = window.TN || {};

  var form = document.getElementById('form-contact');
  if (!form) return;

  var zoneMessage = document.getElementById('form-message');
  var appat = form.querySelector('[name="_appat"]');
  var demande = document.getElementById('f-message');

  var LIBELLES = {
    'f-nom': 'votre nom et prénom',
    'f-email': 'votre adresse email',
    'f-tel': 'votre numéro de téléphone',
    'f-message': 'votre demande'
  };

  function erreurDe(champ) { return document.getElementById(champ.id + '-erreur'); }

  function poserErreur(champ, texte) {
    champ.setAttribute('aria-invalid', 'true');
    var zone = erreurDe(champ);
    if (zone) zone.textContent = texte;
  }

  function nettoyerErreur(champ) {
    champ.removeAttribute('aria-invalid');
    var zone = erreurDe(champ);
    if (zone) zone.textContent = '';
  }

  function valideEmail(v) {
    // Volontairement permissif : on refuse l'évidemment faux, pas plus.
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function validerChamp(champ) {
    var v = (champ.value || '').trim();
    if (champ.hasAttribute('required') && v === '') {
      poserErreur(champ, 'Merci d’indiquer ' + (LIBELLES[champ.id] || 'ce champ') + '.');
      return false;
    }
    if (champ.type === 'email' && v !== '' && !valideEmail(v)) {
      poserErreur(champ, 'Cette adresse email ne semble pas valide.');
      return false;
    }
    nettoyerErreur(champ);
    return true;
  }

  var champs = Array.prototype.slice.call(form.querySelectorAll('input, textarea'))
    .filter(function (c) { return c.name !== '_appat'; });

  champs.forEach(function (champ) {
    champ.addEventListener('blur', function () { validerChamp(champ); });
    champ.addEventListener('input', function () {
      if (champ.getAttribute('aria-invalid') === 'true') validerChamp(champ);
    });
  });

  function messageInline(type, texte) {
    if (!zoneMessage) return;
    zoneMessage.setAttribute('data-type', type);
    zoneMessage.textContent = texte;
  }

  function corpsMail(d) {
    return [
      'Nom : ' + (d.nom || ''),
      'Email : ' + (d.email || ''),
      'Téléphone : ' + (d.telephone || ''),
      '',
      'Demande :',
      d.message || ''
    ].join('\n');
  }

  form.addEventListener('submit', function (e) {
    // Piège à robots : rempli = on ignore silencieusement.
    if (appat && appat.value !== '') { e.preventDefault(); return; }

    var ok = true;
    champs.forEach(function (champ) { if (!validerChamp(champ)) ok = false; });
    if (!ok) {
      e.preventDefault();
      messageInline('erreur', 'Le formulaire est incomplet : les champs signalés demandent une correction.');
      var premier = form.querySelector('[aria-invalid="true"]');
      if (premier) premier.focus();
      return;
    }
    messageInline('', '');

    // Aucun service branché : on passe par le client mail.
    if (form.getAttribute('data-envoi') !== 'service') {
      e.preventDefault();
      var d = {};
      champs.forEach(function (c) { d[c.name] = (c.value || '').trim(); });
      window.location.href = 'mailto:tipgip@hotmail.fr'
        + '?subject=' + encodeURIComponent('Demande : Gîtes Cœur de Lot')
        + '&body=' + encodeURIComponent(corpsMail(d));
      messageInline('succes',
        'Votre logiciel de messagerie s’ouvre avec votre demande préremplie. '
        + 'Si rien ne se passe, écrivez-nous directement à tipgip@hotmail.fr '
        + 'ou appelez le 06 80 42 17 52.');
    }
    // data-envoi="service" : on laisse le navigateur poster vers `action`.
  });

  /* Depuis la fiche d'un gîte : le formulaire repart propre, et le gîte
     choisi est inscrit en tête de la demande. */
  TN.form = {
    reinitialiser: function () {
      form.reset();
      champs.forEach(nettoyerErreur);
      messageInline('', '');
    },
    prefill: function (formule) {
      if (demande && formule) demande.value = 'Gîte souhaité : ' + formule + '\n';
    }
  };
})(window, document);
