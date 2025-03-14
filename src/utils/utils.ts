export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getLanguageName = (code: string): string => {
  const languages: {
    [key: string]: string;
  } = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
  };
  return languages[code] || "Unknown";
};

export const truncateText = (text: string, length: number) => {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
};

export const getStatusBadgeClass = (status: number) => {
  switch (status) {
    case 1:
      return "bg-green-100 text-green-800";
    case 0:
      return "bg-yellow-100 text-yellow-800";
    case 2:
      return "bg-blue-100 text-blue-800";
    case 3:
      return "bg-purple-100 text-purple-800";
    case 4:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const orderResults = (results: any[]) => {
  return results.sort((a, b) => b.fileId - a.fileId);
};

export const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "Starting";
    case 1:
      return "Uploading";
    case 2:
      return "Processing";
    case 3:
      return "Processed";
    case 4:
      return "Error";
    default:
      return "Unknown";
  }
};
