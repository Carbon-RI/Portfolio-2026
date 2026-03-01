export const createSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-");
};

export const extractYouTubeId = (input: string): string => {
  if (!input) return "";

  if (input.length === 11 && !input.includes("/")) return input;

  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = input.match(regExp);

  return match ? match[1] : input;
};
