// 'use strict';

// Conectarse a la app
function signIn() {
  // Nos conectamos a Firebase usando el popup de autenticación de Google como proveedor.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}
// Salir de la app
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}
// Iniciar autenticación
function initFirebaseAuth() {
  // Escuchamos si el estado de la antutenticación cambia.
  firebase.auth().onAuthStateChanged(authStateObserver);
}
// Devuelve la url del avatar del usuario
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}
// Devuelve el nombre de usuario
function getUserName() {
  return firebase.auth().currentUser.displayName;
}
// Devuelve si el usuario está logueado
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}
// Guarda un lugar en la base de datos
function saveMessage(messageText) {
  // Add a new message entry to the Firebase database.
  return firebase.database().ref('/lugares/').push({
    name: getUserName(),
    text: messageText,
    profilePicUrl: getProfilePicUrl()
  }).catch(function (error) {
    console.error('Error al escribir el post en la base de datos', error);
  });
}
// Saves the messaging device token to the datastore.
function saveMessagingDeviceToken() {
  firebase.messaging().getToken().then(function (currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
        .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      requestNotificationsPermissions();
    }
  }).catch(function (error) {
    console.error('Unable to get messaging token.', error);
  });
}

// Requests permissions to show notifications.
function requestNotificationsPermissions() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function () {
    // Notification permission granted.
    saveMessagingDeviceToken();
  }).catch(function (error) {
    console.error('Unable to get permission to notify.', error);
  });
}
// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // El usuario está logueado
    // Obtenemos el nombre y el avatar del usuario
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();
    // agregamos el nombre y el avatar del usuario en nuestra interfase
    $('.user-avatar').css('background-image', 'url(' + profilePicUrl + ')');
    $('.user-name').text('Bienvenido, '+userName);
    // Muestro y oculto los botons de sign in y sign out.
    $('.signin-btn').hide();
    $('.signout-btn').show();
    console.log('Entró '+ userName);

    // We save the Firebase Messaging Device token and enable notifications.
    saveMessagingDeviceToken();
  } else { // El usuario salió!
    $('.user-avatar').css('background-image', '');
    $('.user-name').text('');

    $('.signin-btn').show();
    $('.signout-btn').hide();
    console.log('El usuario salió');
  }
}

// Chequeamos que el SDK de Firebase se haya seteado y configurado bien.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    console.log('No importaste ni configuraste el SDK de Firebase.');
  }
}

// Chequeamos que Firebase haya sido importado.
checkSetup();
// inicializamos Firebase
initFirebaseAuth();

$('.signin-btn').on('click', function(e) {
  signIn();
});
$('.signout-btn').on('click', function (e) {
  signOut();
});
$('#savePlace').on('submit', function(e) {
  e.preventDefault();
  var text = $(this).find('#place-name').val();
  if (text !== '') {
    saveMessage(text);
  }
});
