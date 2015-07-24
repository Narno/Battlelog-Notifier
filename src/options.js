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
    var inputBgPermission = document.getElementById('bgPermission');
    var inputIconShowOffline = document.getElementById('iconShowOffline');
    var inputIconShowOnline = document.getElementById('iconShowOnline');
    var inputIconShowIngame = document.getElementById('iconShowIngame');
    var inputNotifIsActivated = document.getElementById('notifIsActivated');
    var inputNotifFrequency = document.getElementById('notifFrequency');
    var inputNotifIsSound = document.getElementById('notifIsSound');
    var successMessage = document.getElementById('success_message');
    var successTimeout = null;

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
      // bgPermission
      if (localStorage.getItem('bgPermission') === null) {
        inputBgPermission.checked = false;
      } else {
        inputBgPermission.checked = (localStorage.getItem('bgPermission') === 'true');
      }
      // iconShowOffline
      if (localStorage.getItem('iconShowOffline') === null) {
        inputIconShowOffline.checked = false;
      } else {
        inputIconShowOffline.checked = (localStorage.getItem('iconShowOffline') === 'true');
      }
      // iconShowOnline
      if (localStorage.getItem('iconShowOnline') === null) {
        inputIconShowOnline.checked = true;
      } else {
        inputIconShowOnline.checked = (localStorage.getItem('iconShowOnline') === 'true');
      }
      // iconShowIngame
      if (localStorage.getItem('iconShowIngame') === null) {
        inputIconShowIngame.checked = true;
      } else {
        inputIconShowIngame.checked = (localStorage.getItem('iconShowIngame') === 'true');
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
      // notifIsSound
      if (localStorage.getItem('notifIsSound') === null) {
        inputNotifIsSound.checked = true;
      } else {
        inputNotifIsSound.checked = (localStorage.getItem('notifIsSound') === 'true');
      }
    }
    loadOptions();

    // Save options
    function saveOptions() {
      localStorage.setItem('game', inputGame.value);
      localStorage.setItem('bgPermission', inputBgPermission.checked);
      localStorage.setItem('iconShowOffline', inputIconShowOffline.checked);
      localStorage.setItem('iconShowOnline', inputIconShowOnline.checked);
      localStorage.setItem('iconShowIngame', inputIconShowIngame.checked);
      localStorage.setItem('notifIsActivated', inputNotifIsActivated.checked);
      localStorage.setItem('notifFrequency', inputNotifFrequency.value);
      localStorage.setItem('notifIsSound', inputNotifIsSound.checked);
      // success message
      clearTimeout(successTimeout);
      successMessage.classList.add('visible');
      successTimeout = setTimeout(function() {
        successMessage.classList.remove('visible');
      }, 2000);
    }
    document.getElementById('game').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'updatebadge'});
    });
    document.getElementById('bgPermission').addEventListener('change', function () {
      var permission = {'permissions': ['background']};
      /*
      chrome.permissions.contains(permission, function(result) {
        if (result) {
          alert('granted');
        } else {
          alert('not granted');
        }
      });
      */
      if (inputBgPermission.checked) {
        chrome.permissions.request(permission, function(granted) {
          /*
          if (granted) {
            alert('granted');
          } else {
            alert('not granted');
          }
          */
        });
      } else {
        chrome.permissions.remove(permission, function(removed) {
          /*
          if (removed) {
            alert('removed');
          } else {
            alert('not removed');
          }
          */
        });
      }
      saveOptions();
    });
    document.getElementById('iconShowOffline').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'updatebadge'});
    });
    document.getElementById('iconShowOnline').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'updatebadge'});
    });
    document.getElementById('iconShowIngame').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'updatebadge'});
    });
    document.getElementById('notifIsActivated').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'shownotification'});
    });
    document.getElementById('notifFrequency').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'shownotification'});
    });
    document.getElementById('notifIsSound').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'shownotification'});
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

    // Extension version in about page
    var manifest = chrome.runtime.getManifest();
    //console.log(manifest.version);
    $(function() {
      $('#version').html(manifest.version);
    });
  });
})();