import apiClient from "./apiClient";


// Response interceptor
export const predictEEG = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
