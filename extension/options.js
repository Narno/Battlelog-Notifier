(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var formGame = document.getElementById('game');
    var successMessage = document.getElementById('success_message');
    var successTimeout = null;

    function loadSettings() {
      if (localStorage.getItem('game') === null) {
        formGame.value = 'bf4';
      }
      else {
        formGame.value = localStorage.getItem('game');
      }
    }

    loadSettings();

    document.getElementById('save').addEventListener('click', function () {
      localStorage.setItem('game', formGame.value);
      chrome.runtime.sendMessage('updatebadge');
      clearTimeout(successTimeout);
      successMessage.classList.add('visible');
      successTimeout = setTimeout(function() {
        successMessage.classList.remove('visible');
      }, 2000);
    });

    document.getElementById('reset').addEventListener('click', function () {
      formGame.value = 'bf4';
      //loadSettings();
    });
  });
})();