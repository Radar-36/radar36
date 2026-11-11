/* Radar 36 — "Join Waitlist" side tab (Formester)
 *
 * To turn it off everywhere: set ENABLED to false below.
 * To remove it completely: delete this file and the
 * <script src="assets/js/waitlist.js" defer></script> line in each page.
 */
(function () {
  'use strict';
  var ENABLED = true;

  var FORM_ID = 'gZsGuDXrk';
  var FORM_URL = 'https://imefcgjl.formester.com/f/gZsGuDXrk';
  var BUTTON_TEXT = 'Join Waitlist';
  var BUTTON_COLOR = '#0d0c0d';
  var BUTTON_TEXT_COLOR = '#FFFFFF';

  if (!ENABLED || document.querySelector('formester-sidetab')) return;

  var s = document.createElement('script');
  s.type = 'module';
  s.src = 'https://assets.formester.com/widget/sidetab.js';
  document.head.appendChild(s);

  var tab = document.createElement('formester-sidetab');
  tab.setAttribute('id', FORM_ID);
  tab.setAttribute('url', FORM_URL);
  tab.setAttribute('button-color', BUTTON_COLOR);
  tab.setAttribute('button-text', BUTTON_TEXT);
  tab.setAttribute('button-text-color', BUTTON_TEXT_COLOR);
  document.body.appendChild(tab);
})();
