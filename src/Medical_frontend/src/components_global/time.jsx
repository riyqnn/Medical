export const getRemainingTime = (expiredAt) => {
  if (expiredAt === null) {
    return "Lifetime";
  }
  
  const nowInSec = Math.floor(Date.now() / 1000);
  const diffSec = expiredAt - nowInSec;

  if (diffSec <= 0) {
    return "Expired";
  }

  const months = Math.floor(diffSec / 86400 / 30);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);

  return months;
};

export const formatDate = (timestamp) => {
  const date = new Date(Number(timestamp) *1000);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
