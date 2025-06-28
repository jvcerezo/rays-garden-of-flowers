import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app as firebaseApp, db } from '../firebase/firebase';
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from 'react-hot-toast';

const getTokenAndSave = async (messaging, user) => {
    try {
        const currentToken = await getToken(messaging, {
            vapidKey: process.env.REACT_APP_FIREBASE_KEY_PAIR,
        });

        if (currentToken) {
            console.log('FCM Token retrieved:', currentToken);
            const tokensRef = collection(db, 'users', user.uid, 'fcmTokens');
            const tokenDocRef = doc(tokensRef, currentToken);
            await setDoc(tokenDocRef, { createdAt: serverTimestamp() });

            onMessage(messaging, (payload) => {
                console.log('Foreground message received:', payload);
                toast.success(
                    (t) => (
                        <span>
                            <b>{payload.notification.title}:</b> {payload.notification.body}
                        </span>
                    ), { icon: '🔔' }
                );
            });
        } else {
            console.log('No registration token available. Request permission to generate one.');
            toast.error("Could not get notification token. Please allow notifications.");
        }
    } catch (error) {
        console.error("An error occurred while retrieving token:", error);
        toast.error("Error getting notification token.");
    }
};

export const initializeFCM = async (user) => {
    if (!user || !user.uid) {
        console.log("FCM Init: User not available.");
        return;
    }

    try {
        const messaging = getMessaging(firebaseApp);

        if (Notification.permission === 'granted') {
            console.log("FCM Init: Permission already granted. Getting token silently.");
            await getTokenAndSave(messaging, user);
            return; 
        }

        if (Notification.permission === 'denied') {
            console.log("FCM Init: Permission has been explicitly denied.");
            return; 
        }

        console.log("FCM Init: Requesting user permission.");
        const permissionPromise = Notification.requestPermission();

        await toast.promise(permissionPromise, {
            loading: 'Waiting for notification permission...',
            success: <b>Permission granted! You'll now receive reminders.</b>,
            error: <b>Permission denied. Reminders will not be sent.</b>,
        });

        if (await permissionPromise === 'granted') {
            await getTokenAndSave(messaging, user);
        }

    } catch (error) {
        console.error('An error occurred while initializing Firebase Messaging.', error);
        toast.error("Could not initialize notifications.");
    }
};