import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore'

const config = {
    apiKey: "AIzaSyDVz9lcP6Ix39ulxvXQXtZ2LJeZXy6LFyc",
    authDomain: "gestion-attribution-ordinateur.firebaseapp.com",
    databaseURL: "https://gestion-attribution-ordinateur.firebaseio.com",
    projectId: "gestion-attribution-ordinateur",
    storageBucket: "gestion-attribution-ordinateur.appspot.com",
    messagingSenderId: "962096431560",
    appId: "1:962096431560:web:3009040d2a77e2af6880fd"
  };


class Firebase{

    constructor(){
        app.initializeApp(config)
        this.auth = app.auth();
        this.db = app.firestore();
    }

    // Connexion
    loginUser = (email, password) => this.auth.signInWithEmailAndPassword(email, password);
    // Déconnexion
    signoutuser = () => this.auth.signOut();

}

export default Firebase;