(function () {
  'use strict';

  // DOM / CSS handling with zeptojs
  $(function() {
    $('.menu a').click(function(ev) {
      ev.preventDefault();
      var selected = 'selected';
      $('.mainview > *').removeClass(selected);
      $('.menu li').removeClass(selected);
      setTimeout(function() {
        $('.mainview > *:not(.selected)').css('display', 'none');
      }, 100);
      $(ev.currentTarget).parent().addClass(selected);
      var currentView = $($(ev.currentTarget).attr('href'));
      currentView.css('display', 'block');
      setTimeout(function() {
        currentView.addClass(selected);
      }, 0);
      setTimeout(function() {
        $('body')[0].scrollTop = 0;
      }, 200);
    });
    $('.mainview > *:not(.selected)').css('display', 'none');
  });

  document.addEventListener('DOMContentLoaded', function () {
    var inputGame = document.getElementById('game');
    var inputNotifIsActivated = document.getElementById('notifIsActivated');
    var inputNotifFrequency = document.getElementById('notifFrequency');
    var successMessage = document.getElementById('success_message');
    var successTimeout = null;
    var inputIconShowOffline = document.getElementById('iconShowOffline');

    // Apply translations
    function applyTranslations() {
      var objects = document.getElementsByTagName('*'), i;
      for (i = 0; i < objects.length; i++) {
        if (objects[i].dataset && objects[i].dataset.message) {
          objects[i].innerHTML = chrome.i18n.getMessage(objects[i].dataset.message);
        }
      }
    }
    applyTranslations();

    // Laod options
    function loadOptions() {
      // game
      if (localStorage.getItem('game') === null) {
        inputGame.value = 'bf4';
      } else {
        inputGame.value = localStorage.getItem('game');
      }
      // notifIsActivated
      if (localStorage.getItem('notifIsActivated') === null) {
        inputNotifIsActivated.checked = false;
      } else {
        inputNotifIsActivated.checked = (localStorage.getItem('notifIsActivated') === 'true');
      }
      // notifFrequency
      if (localStorage.getItem('notifFrequency') === null) {
        inputNotifFrequency.value = '1';
      } else {
        inputNotifFrequency.value = localStorage.getItem('notifFrequency');
      }
    }
    loadOptions();

    // Save options
    function saveOptions() {
      localStorage.setItem('game', inputGame.value);
      localStorage.setItem('notifIsActivated', inputNotifIsActivated.checked);
      localStorage.setItem('notifFrequency', inputNotifFrequency.value);
      localStorage.setItem('iconShowOffline', inputIconShowOffline.checked);
      chrome.runtime.sendMessage({do: 'updatebadge'});
      // success message
      clearTimeout(successTimeout);
      successMessage.classList.add('visible');
      successTimeout = setTimeout(function() {
        successMessage.classList.remove('visible');
      }, 2000);
    }
    document.getElementById('game').addEventListener('change', function () {
      saveOptions();
    });
    document.getElementById('notifIsActivated').addEventListener('change', function () {
      saveOptions();
    });
    document.getElementById('notifFrequency').addEventListener('change', function () {
      saveOptions();
    });
    document.getElementById('iconShowOffline').addEventListener('change', function () {
      saveOptions();
    });

    // Notification test
    document.getElementById('notifTest').addEventListener('click', function () {
      if (chrome.notifications) {
        chrome.runtime.sendMessage({do: 'shownotification_test'});
        return;
      }
    });

    // Hide notifications options if not available
    if (!chrome.notifications) {
      $(function() {
        $('#li_notifications').css('display', 'none');
      });
    }
  });
})();