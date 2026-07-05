export const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(date));
};

export const formatDatetime = (date: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(date));
};

export const dateActive = (date: string) => {
  const now = new Date();
  const target = new Date(date);
  return now.getTime() >= target.getTime();
};
