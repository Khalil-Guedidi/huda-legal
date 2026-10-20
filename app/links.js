// Lien universel de Huda (Produit 10) : /app?c=<campagne> envoie vers le bon
// store en transmettant la campagne (convention de reste-07).
// Utilisé par app/index.html ; testé par tool/test_app_links.mjs.
(function (root) {
  var APP_STORE_ID = '6798269586';
  var PROVIDER_TOKEN = '129265356';
  var PLAY_PACKAGE = 'com.hudhudis.huda';

  // Huda n'est pas encore sur le Play Store (reste-06) : passer à true le jour
  // de la sortie Android, sans mise à jour de l'app.
  var PLAY_AVAILABLE = false;

  // <canal>-<détail>, minuscules, chiffres et tirets, 40 caractères (limite
  // Apple pour ct).
  var CAMPAIGN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  function campaignFrom(search) {
    var match = /[?&]c=([^&#]*)/.exec(search || '');
    if (!match) return null;
    var c;
    try {
      c = decodeURIComponent(match[1]).toLowerCase();
    } catch (e) {
      return null;
    }
    return c.length <= 40 && CAMPAIGN.test(c) ? c : null;
  }

  function appStoreUrl(campaign) {
    var url = 'https://apps.apple.com/app/apple-store/id' + APP_STORE_ID;
    if (!campaign) return url;
    return url + '?pt=' + PROVIDER_TOKEN + '&ct=' + campaign + '&mt=8';
  }

  function playStoreUrl(campaign) {
    var url = 'https://play.google.com/store/apps/details?id=' + PLAY_PACKAGE;
    if (!campaign) return url;
    var referrer = 'utm_source=huda&utm_medium=' + campaign.split('-')[0] +
      '&utm_campaign=' + campaign;
    return url + '&referrer=' + encodeURIComponent(referrer);
  }

  // 'ios', 'android' ou 'other'. iPadOS se présente comme un Mac : on le
  // reconnaît à son écran tactile.
  function platformOf(userAgent, maxTouchPoints) {
    var ua = userAgent || '';
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    if (/macintosh/i.test(ua) && (maxTouchPoints || 0) > 1) return 'ios';
    return 'other';
  }

  // Où rediriger tout de suite, ou null pour afficher la page.
  function redirectFor(platform, campaign) {
    if (platform === 'ios') return appStoreUrl(campaign);
    if (platform === 'android' && PLAY_AVAILABLE) return playStoreUrl(campaign);
    return null;
  }

  var api = {
    PLAY_AVAILABLE: PLAY_AVAILABLE,
    campaignFrom: campaignFrom,
    appStoreUrl: appStoreUrl,
    playStoreUrl: playStoreUrl,
    platformOf: platformOf,
    redirectFor: redirectFor,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HudaLinks = api;
})(this);
