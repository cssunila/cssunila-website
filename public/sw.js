self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Notifikasi CSS UNILA";
    const options = {
      body: data.body || "",
      icon: data.icon || "/css-logo.png",
      badge: "/css-logo.png",
      data: {
        url: data.url || "/history",
      },
      tag: "cssunila-push-notif",
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Notifikasi Baru", {
        body: text,
        icon: "/css-logo.png",
        badge: "/css-logo.png",
        data: { url: "/history" },
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/history";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
