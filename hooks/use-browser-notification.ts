import { useCallback, useEffect, useRef, useState } from "react";

function getStorageKey(userId: string) {
  return `cssunila_notif_asked_${userId}`;
}

function getEndpointStorageKey(userId: string) {
  return `cssunila_push_endpoint_${userId}`;
}

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

async function registerAndSubscribe(userId: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Web Push is not supported in this browser.");
    return;
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.warn("VAPID Public Key not set.");
    return;
  }

  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });

  await navigator.serviceWorker.ready;

  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  }

  const endpointKey = getEndpointStorageKey(userId);
  const savedEndpoint = sessionStorage.getItem(endpointKey);

  if (subscription && subscription.endpoint === savedEndpoint) {
    return; 
  }

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription }),
  });

  if (res.ok) {
    if (subscription) {
      sessionStorage.setItem(endpointKey, subscription.endpoint);
    }
  } else {
    const body = await res.json().catch(() => ({}));
    console.error("Failed to save push subscription:", body);
  }
}

export function useBrowserNotification(enabled: boolean, userId?: string) {
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const registeredRef = useRef(false);
  const lastUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !userId) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    const perm = Notification.permission;
    const storageKey = getStorageKey(userId);

    if (lastUserIdRef.current !== userId) {
      registeredRef.current = false;
      lastUserIdRef.current = userId;
    }

    if (perm === "granted") {
      if (!registeredRef.current) {
        registeredRef.current = true;
        registerAndSubscribe(userId).catch(console.error);
      }
    } else if (perm === "default") {
      const alreadyAsked = sessionStorage.getItem(storageKey);
      if (!alreadyAsked) {
        const timer = setTimeout(() => setShouldShowModal(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [enabled, userId]);

  const requestPermission = useCallback(async () => {
    setShouldShowModal(false);
    if (!userId) return;
    sessionStorage.setItem(getStorageKey(userId), "true");

    if (!("Notification" in window)) return;

    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        await registerAndSubscribe(userId);
      }
    } catch (err) {
      console.error("Failed to request notification permission:", err);
    }
  }, [userId]);

  const dismissModal = useCallback(() => {
    setShouldShowModal(false);
    if (!userId) return;
    sessionStorage.setItem(getStorageKey(userId), "true");
  }, [userId]);

  return { shouldShowModal, requestPermission, dismissModal };
}
