/* ── MODULE: FIREBASE-CONFIG ── */

// CONFIG DO FIREBASE (SUBSTITUA PELO SEU)
const firebaseConfig = {
  apiKey: "AIzaSyCJsY6RdplE7vbBrK09tsrgjHTpWZZaFDM",
  authDomain: "mentoria-b510d.firebaseapp.com",
  projectId: "mentoria-b510d",
  storageBucket: "mentoria-b510d.firebasestorage.app",
  messagingSenderId: "915208966066",
  appId: "1:915208966066:web:dd7ff331e32c3573e39eab",
  measurementId: "G-HW45SZ0ZSV"
};

firebase.initializeApp(firebaseConfig);

try {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => { });
} catch (_) { }

var auth = firebase.auth();
var db = firebase.firestore();
var storage = firebase.storage ? firebase.storage() : null;

// Expose on window so research.js and others can use window.db
window.db = db;
window.auth = auth;
window.storage = storage;

// PDF.js worker setup
try {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
} catch (_) { }
