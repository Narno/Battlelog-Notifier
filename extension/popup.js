(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    $('.action').click(function() {
      window.open('http://narno.com');
    });
    $('#options').click(function() {
      window.open(chrome.extension.getURL('options.html'));
    });
  });
})();