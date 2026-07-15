import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "cssunila_notif_asked";

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

async function registerAndSubscribe() {
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

  const existing = await registration.pushManager.getSubscription();
  if (existing) return;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription }),
  });
}

export function useBrowserNotification(enabled: boolean) {
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    const perm = Notification.permission;

    if (perm === "granted") {
      if (!registeredRef.current) {
        registeredRef.current = true;
        registerAndSubscribe().catch(console.error);
      }
    } else if (perm === "default") {
      const alreadyAsked = sessionStorage.getItem(STORAGE_KEY);
      if (!alreadyAsked) {
        const timer = setTimeout(() => setShouldShowModal(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [enabled]);

  const requestPermission = useCallback(async () => {
    setShouldShowModal(false);
    sessionStorage.setItem(STORAGE_KEY, "true");

    if (!("Notification" in window)) return;

    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        await registerAndSubscribe();
      }
    } catch (err) {
      console.error("Failed to request notification permission:", err);
    }
  }, []);

  const dismissModal = useCallback(() => {
    setShouldShowModal(false);
    sessionStorage.setItem(STORAGE_KEY, "true");
  }, []);

  return { shouldShowModal, requestPermission, dismissModal };
}



