import API_URL from "./api";

export const analyzeImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/ai/image`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};
