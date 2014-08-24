(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var inputGame = document.getElementById('game');
    var inputNotifIsActivated = document.getElementById('notifIsActivated');
    var inputNotifFrequency = document.getElementById('notifFrequency');
    var successMessage = document.getElementById('success_message');
    var successTimeout = null;

    // Laod settings
    function loadSettings() {
      // game
      if (localStorage.getItem('game') === null) {
        inputGame.value = 'bf4';
      }
      else {
        inputGame.value = localStorage.getItem('game');
      }
      // notifIsActivated
      if (localStorage.getItem('notifIsActivated') === null) {
        inputNotifIsActivated.value = '0';
      }
      else {
        inputNotifIsActivated.value = localStorage.getItem('notifIsActivated');
      }
      // notifFrequency
      if (localStorage.getItem('notifFrequency') === null) {
        inputNotifFrequency.value = '1';
      }
      else {
        inputNotifFrequency.value = localStorage.getItem('notifFrequency');
      }
    }
    loadSettings();

    // Save
    document.getElementById('save').addEventListener('click', function () {
      localStorage.setItem('game', inputGame.value);
      localStorage.setItem('notifIsActivated', inputNotifIsActivated.value);
      localStorage.setItem('notifFrequency', inputNotifFrequency.value);
      chrome.runtime.sendMessage('updatebadge');
      clearTimeout(successTimeout);
      successMessage.classList.add('visible');
      successTimeout = setTimeout(function() {
        successMessage.classList.remove('visible');
      }, 2000);
    });

    // Reset
    document.getElementById('reset').addEventListener('click', function () {
      inputGame.value = 'bf4';
      inputNotifIsActivated.value = '0';
    });
  });
})();