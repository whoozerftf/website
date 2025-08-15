// firebase-config.js?v=4" (untuk penggunaan tanpa module/import/export)
// Pastikan sudah load CDN Firebase di HTML sebelum file ini

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDS4D7G4jnB9icUGyb8NM97L6sN1i9kLp0",
  authDomain: "whoozer-jayaselalu.firebaseapp.com",
  projectId: "whoozer-jayaselalu",
  storageBucket: "whoozer-xyz.appspot.com",
  messagingSenderId: "271080513658",
  appId: "1:271080513658:web:ca868123253f3745ad1bc3",
};

// Inisialisasi Firebase
window.firebaseApp = firebase.initializeApp(firebaseConfig);
window.auth = firebase.auth();
window.db = firebase.firestore();
window.GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
window.PhoneAuthProvider = firebase.auth.PhoneAuthProvider;
window.signInWithEmailAndPassword = firebase.auth().signInWithEmailAndPassword;
window.collection = (col) => window.db.collection(col);
window.getDocs = (ref) => ref.get();
// Untuk query dan where, gunakan ref.where() langsung di web klasik
