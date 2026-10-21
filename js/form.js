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

  // Messages dans la langue de la page (<html lang="…">), versions du 21/10/2026.
  var LANGUE = (document.documentElement.lang || 'fr').slice(0, 2);
  var TEXTES = {
    fr: { champs: { 'f-nom': 'votre nom et prénom', 'f-email': 'votre adresse email', 'f-tel': 'votre numéro de téléphone', 'f-message': 'votre question' },
          requis: function (l) { return 'Merci d’indiquer ' + l + '.'; }, champ: 'ce champ',
          email: 'Cette adresse email ne semble pas valide.',
          incomplet: 'Le formulaire est incomplet : les champs signalés demandent une correction.',
          ouvert: 'Votre logiciel de messagerie s’ouvre avec votre question préremplie. Si rien ne se passe, écrivez-nous directement à tipgip@hotmail.fr ou appelez le 06 80 42 17 52.',
          sujet: 'Question : Gîtes Cœur de Lot', nom: 'Nom', tel: 'Téléphone', demande: 'Question', gite: 'Gîte souhaité' },
    en: { champs: { 'f-nom': 'your full name', 'f-email': 'your email address', 'f-tel': 'your phone number', 'f-message': 'your question' },
          requis: function (l) { return 'Please enter ' + l + '.'; }, champ: 'this field',
          email: 'This email address does not seem to be valid.',
          incomplet: 'The form is incomplete: please correct the highlighted fields.',
          ouvert: 'Your email application is opening with your question already filled in. If nothing happens, write to us directly at tipgip@hotmail.fr or call +33 6 80 42 17 52.',
          sujet: 'Question: Gîtes Cœur de Lot', nom: 'Name', tel: 'Phone', demande: 'Question', gite: 'Preferred gîte' },
    es: { champs: { 'f-nom': 'su nombre y apellidos', 'f-email': 'su correo electrónico', 'f-tel': 'su número de teléfono', 'f-message': 'su pregunta' },
          requis: function (l) { return 'Indique ' + l + ', por favor.'; }, champ: 'este campo',
          email: 'Esta dirección de correo electrónico no parece válida.',
          incomplet: 'El formulario está incompleto: corrija los campos señalados.',
          ouvert: 'Su programa de correo se abre con su pregunta ya escrita. Si no ocurre nada, escríbanos directamente a tipgip@hotmail.fr o llame al +33 6 80 42 17 52.',
          sujet: 'Pregunta: Gîtes Cœur de Lot', nom: 'Nombre', tel: 'Teléfono', demande: 'Pregunta', gite: 'Alojamiento deseado' },
    nl: { champs: { 'f-nom': 'uw voor- en achternaam', 'f-email': 'uw e-mailadres', 'f-tel': 'uw telefoonnummer', 'f-message': 'uw vraag' },
          requis: function (l) { return 'Vul ' + l + ' in.'; }, champ: 'dit veld',
          email: 'Dit e-mailadres lijkt niet geldig.',
          incomplet: 'Het formulier is niet volledig: verbeter de aangeduide velden.',
          ouvert: 'Uw e-mailprogramma opent met uw vraag al ingevuld. Gebeurt er niets, schrijf ons dan rechtstreeks op tipgip@hotmail.fr of bel +33 6 80 42 17 52.',
          sujet: 'Vraag: Gîtes Cœur de Lot', nom: 'Naam', tel: 'Telefoon', demande: 'Vraag', gite: 'Gewenste gîte' }
  };
  var T = TEXTES[LANGUE] || TEXTES.fr;
  var LIBELLES = T.champs;

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
      poserErreur(champ, T.requis(LIBELLES[champ.id] || T.champ));
      return false;
    }
    if (champ.type === 'email' && v !== '' && !valideEmail(v)) {
      poserErreur(champ, T.email);
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
      T.nom + ' : ' + (d.nom || ''),
      'Email : ' + (d.email || ''),
      T.tel + ' : ' + (d.telephone || ''),
      '',
      T.demande + ' :',
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
      messageInline('erreur', T.incomplet);
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
        + '?subject=' + encodeURIComponent(T.sujet)
        + '&body=' + encodeURIComponent(corpsMail(d));
      messageInline('succes', T.ouvert);
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
      if (demande && formule) demande.value = T.gite + ' : ' + formule + '\n';
    }
  };
})(window, document);
