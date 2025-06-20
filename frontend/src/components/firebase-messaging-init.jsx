import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app as firebaseApp, db } from '../firebase/firebase'; // Your firebase.js file
import { doc, setDoc, collection } from "firebase/firestore";

export const initializeFCM = async (user) => {
  if (!user || !user.uid) {
    console.log("FCM Init: User not available.");
    return;
  }

  try {
    const messaging = getMessaging(firebaseApp);

    // --- Step 1: Request permission ---
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted.");
      // Optionally, show a message to the user explaining why notifications are useful
      return;
    }

    // --- Step 2: Get the device token ---
    const currentToken = await getToken(messaging, {
      //
      // IMPORTANT: Paste your VAPID key from the Firebase Console here!
      //
      vapidKey: "YOUR_VAPID_KEY_HERE",
    });

    if (!currentToken) {
      console.log('No registration token available. Request permission to generate one.');
      return;
    }

    // --- Step 3: Save the unique token to Firestore for this user ---
    // This allows our backend to know where to send notifications.
    console.log('FCM Token:', currentToken);
    const tokensRef = collection(db, 'users', user.uid, 'fcmTokens');
    const tokenDocRef = doc(tokensRef, currentToken); // Use the token itself as the document ID
    await setDoc(tokenDocRef, { createdAt: new Date() });

    // Optional: Handle messages that arrive while the app is in the foreground
    onMessage(messaging, (payload) => {
      console.log('Message received while app is in foreground: ', payload);
      // You can show a custom in-app notification here
      alert(`Reminder: ${payload.notification.title}`);
    });

  } catch (error) {
    console.error('An error occurred while initializing Firebase Messaging. ', error);
  }
};