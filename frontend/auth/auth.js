// Lightweight Firebase Auth wrapper using CDN modules
// Usage: include firebase-config.js first, then this file.

;(function(){
    async function loadFirebase() {
        if (!window.firebaseApp) {
            const appModule = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
            const authModule = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
            const app = appModule.initializeApp(window.FIREBASE_CONFIG);
            const auth = authModule.getAuth(app);
            auth.languageCode = 'en';
            const db = firestoreModule.getFirestore(app);
            window.firebaseApp = app;
            window.firebaseAuth = auth;
            window.firebaseAuthModule = authModule;
            window.firebaseDb = db;
            window.firebaseFirestoreModule = firestoreModule;
            // Firestore collection helpers
            window.ChatStore = {
                debug: true,
                async createConversation(uid, title) {
                    const { collection, addDoc, serverTimestamp } = firestoreModule;
                    const ref = collection(db, 'users', uid, 'conversations');
                    const payload = { 
                        title: title || 'New chat',
                        ownerUid: uid,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        lastMessage: ''
                    };
                    const docRef = await addDoc(ref, payload);
                    if (window.ChatStore.debug) console.log('[ChatStore] createConversation', docRef.id, payload);
                    return docRef.id;
                },
                async addMessage(uid, conversationId, role, content, metadata) {
                    try {
                        const { collection, addDoc, serverTimestamp, doc, setDoc } = firestoreModule;
                        const msgs = collection(db, 'users', uid, 'conversations', conversationId, 'messages');
                        const payload = Object.assign({ role, content, createdAt: serverTimestamp() }, (metadata || {}));
                        const added = await addDoc(msgs, payload);
                        const convRef = doc(db, 'users', uid, 'conversations', conversationId);
                        await setDoc(convRef, { updatedAt: serverTimestamp(), lastMessage: content.slice(0, 200) }, { merge: true });
                        if (window.ChatStore.debug) console.log('[ChatStore] addMessage', conversationId, payload);
                        return added.id;
                    } catch (err) {
                        console.error('[ChatStore] addMessage error', err);
                        throw err;
                    }
                },
                async listConversations(uid, limitCount = 20) {
                    const { collection, query, orderBy, limit, getDocs } = firestoreModule;
                    const ref = collection(db, 'users', uid, 'conversations');
                    const q = query(ref, orderBy('updatedAt', 'desc'), limit(limitCount));
                    const snap = await getDocs(q);
                    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
                },
                subscribeConversations(uid, cb, limitCount = 50) {
                    const { collection, query, orderBy, limit, onSnapshot } = firestoreModule;
                    const ref = collection(db, 'users', uid, 'conversations');
                    const q = query(ref, orderBy('updatedAt', 'desc'), limit(limitCount));
                    return onSnapshot(q, (snap) => {
                        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        if (typeof cb === 'function') cb(items);
                    });
                },
                async getMessages(uid, conversationId, limitCount = 100) {
                    const { collection, query, orderBy, limit, getDocs } = firestoreModule;
                    const msgs = collection(db, 'users', uid, 'conversations', conversationId, 'messages');
                    const q = query(msgs, orderBy('createdAt', 'asc'), limit(limitCount));
                    const snap = await getDocs(q);
                    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
                },
                subscribeMessages(uid, conversationId, cb, limitCount = 500) {
                    const { collection, query, orderBy, limit, onSnapshot } = firestoreModule;
                    const msgs = collection(db, 'users', uid, 'conversations', conversationId, 'messages');
                    const q = query(msgs, orderBy('createdAt', 'asc'), limit(limitCount));
                    return onSnapshot(q, (snap) => {
                        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        if (typeof cb === 'function') cb(items);
                    });
                },
                async setTitle(uid, conversationId, title) {
                    const { doc, setDoc, serverTimestamp } = firestoreModule;
                    const convRef = doc(db, 'users', uid, 'conversations', conversationId);
                    await setDoc(convRef, { title: title, updatedAt: serverTimestamp() }, { merge: true });
                },
                async deleteConversation(uid, conversationId) {
                    const { doc, deleteDoc, collection, getDocs } = firestoreModule;
                    // Delete all messages under the conversation
                    const msgsCol = collection(db, 'users', uid, 'conversations', conversationId, 'messages');
                    const msgsSnap = await getDocs(msgsCol);
                    const deletions = [];
                    msgsSnap.forEach(d => deletions.push(deleteDoc(d.ref)));
                    await Promise.allSettled(deletions);
                    // Delete the conversation document
                    const convRef = doc(db, 'users', uid, 'conversations', conversationId);
                    await deleteDoc(convRef);
                }
            };
        }
    }

    async function ensureFirebaseReady() {
        if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey) {
            throw new Error('Firebase config missing. Edit frontend/auth/firebase-config.js');
        }
        await loadFirebase();
    }

    window.AuthAPI = {
        async ensureReady() {
            await ensureFirebaseReady();
            return { app: window.firebaseApp, auth: window.firebaseAuth };
        },
        async signupEmail(email, password) {
            await ensureFirebaseReady();
            const { createUserWithEmailAndPassword, updateProfile } = window.firebaseAuthModule;
            const cred = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
            return cred.user;
        },
        async setDisplayName(user, displayName) {
            await ensureFirebaseReady();
            const { updateProfile } = window.firebaseAuthModule;
            await updateProfile(user, { displayName });
        },
        async saveUserProfile(uid, profile) {
            await ensureFirebaseReady();
            const { doc, setDoc, serverTimestamp } = window.firebaseFirestoreModule;
            const ref = doc(window.firebaseDb, 'users', uid);
            const data = Object.assign({}, profile, { createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
            await setDoc(ref, data, { merge: true });
        },
        async getUserProfile(uid) {
            await ensureFirebaseReady();
            const { doc, getDoc } = window.firebaseFirestoreModule;
            const ref = doc(window.firebaseDb, 'users', uid);
            const snap = await getDoc(ref);
            return snap.exists() ? snap.data() : null;
        },
        async updateUserProfile(uid, updates) {
            await ensureFirebaseReady();
            const { doc, setDoc, serverTimestamp } = window.firebaseFirestoreModule;
            const ref = doc(window.firebaseDb, 'users', uid);
            const data = Object.assign({}, updates, { updatedAt: serverTimestamp() });
            await setDoc(ref, data, { merge: true });
        },
        async loginEmail(email, password) {
            await ensureFirebaseReady();
            const { signInWithEmailAndPassword } = window.firebaseAuthModule;
            const cred = await signInWithEmailAndPassword(window.firebaseAuth, email, password);
            return cred.user;
        },
        async sendReset(email) {
            await ensureFirebaseReady();
            const { sendPasswordResetEmail } = window.firebaseAuthModule;
            await sendPasswordResetEmail(window.firebaseAuth, email);
        },
        async signOut() {
            await ensureFirebaseReady();
            const { signOut } = window.firebaseAuthModule;
            await signOut(window.firebaseAuth);
        },
        onAuth(callback) {
            // optional observer for future use
            if (!window.firebaseAuth) return () => {};
            const { onAuthStateChanged } = window.firebaseAuthModule;
            return onAuthStateChanged(window.firebaseAuth, callback);
        }
    };
})();


