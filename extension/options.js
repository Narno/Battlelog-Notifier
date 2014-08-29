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

    // Laod options
    function loadOptions() {
      // game
      if (localStorage.getItem('game') === null) {
        inputGame.value = 'bf4';
      }
      else {
        inputGame.value = localStorage.getItem('game');
      }
      // notifIsActivated
      if (localStorage.getItem('notifIsActivated') === null) {
        inputNotifIsActivated.checked = false;
      }
      else {
        inputNotifIsActivated.checked = (localStorage.getItem('notifIsActivated') === 'true');
      }
      // notifFrequency
      if (localStorage.getItem('notifFrequency') === null) {
        inputNotifFrequency.value = '1';
      }
      else {
        inputNotifFrequency.value = localStorage.getItem('notifFrequency');
      }
    }
    loadOptions();

    // Save
    document.getElementById('game').addEventListener('change', function () {
      saveOptions();
    });
    document.getElementById('notifIsActivated').addEventListener('change', function () {
      saveOptions();
    });
    document.getElementById('notifFrequency').addEventListener('change', function () {
      saveOptions();
    });

    function saveOptions() {
      localStorage.setItem('game', inputGame.value);
      //console.log('inputNotifIsActivated.checked:' + inputNotifIsActivated.checked); // debug
      localStorage.setItem('notifIsActivated', inputNotifIsActivated.checked);
      localStorage.setItem('notifFrequency', inputNotifFrequency.value);
      chrome.runtime.sendMessage('updatebadge');
      clearTimeout(successTimeout);
      successMessage.classList.add('visible');
      successTimeout = setTimeout(function() {
        successMessage.classList.remove('visible');
      }, 2000);
    }

    // Notification test
    document.getElementById('notifTest').addEventListener('click', function () {
      if (chrome.notifications) {
        //console.log('chrome.notifications'); // debug
        var opt = {
          type: "basic",
          title: chrome.i18n.getMessage('notificationTitle'),
          message: chrome.i18n.getMessage('notificationMessage', [7]),
          iconUrl: "icon-48.png",
          buttons: [
            { title: chrome.i18n.getMessage('notificationButton2Title') },
          ]
        };
        var optOpera = {
          type: "basic",
          title: chrome.i18n.getMessage('notificationTitle'),
          message: chrome.i18n.getMessage('notificationMessage', [7]),
          iconUrl: "icon-48.png"
        };
        var notification = chrome.notifications.create('showNotification', opt, function() {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            if (chrome.runtime.lastError.message == "Adding buttons to notifications is not supported.") {
              var notification = chrome.notifications.create('showNotification', optOpera, function() {});
            }
            return;
          }
        });
      }
    });
  });
})();