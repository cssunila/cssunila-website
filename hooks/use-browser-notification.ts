import { useCallback, useEffect, useRef } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useBrowserNotification(enabled: boolean) {
  const permissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    const registerAndSubscribe = async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          console.warn("Web Push is not supported in this browser.");
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        await navigator.serviceWorker.ready;

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.warn("VAPID Public Key not set.");
          return;
        }

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription }),
        });
      } catch (err) {
        console.error("Failed to register/subscribe web push:", err);
      }
    };

    permissionRef.current = Notification.permission;

    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        permissionRef.current = perm;
        if (perm === "granted") {
          registerAndSubscribe();
        }
      });
    } else if (Notification.permission === "granted") {
      registerAndSubscribe();
    }
  }, [enabled]);
}


