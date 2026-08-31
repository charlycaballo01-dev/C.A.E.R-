import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQgPyTugCCDfTU2QnYJLiOeJyNszXz4NE",
  authDomain: "caer-plataforma.firebaseapp.com",
  projectId: "caer-plataforma",
  storageBucket: "caer-plataforma.firebasestorage.app",
  messagingSenderId: "862576745883",
  appId: "1:862576745883:web:ba0ada497918325654153e"
};
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);
signInAnonymously(auth).catch(err => console.error('Error auth anónima (avisos):', err));

window.__avisarNuevoMensaje = function(nombre, modalidad){
  addDoc(collection(db, 'avisos'), {
    tipo: 'formulario',
    titulo: 'Nuevo mensaje del formulario',
    detalle: `${nombre} — ${modalidad}`,
    createdAt: serverTimestamp()
  }).catch(err => console.error('No se pudo registrar el aviso:', err));
};
