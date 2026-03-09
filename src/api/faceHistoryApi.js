import apiClient from "./apiClient";

export const saveFaceEmotionSession = async (payload) => {
  const res = await apiClient.post("/face-history/session", payload);
  return res.data;
};

export const getMyFaceEmotionHistory = async () => {
  const res = await apiClient.get("/face-history/my");
  return res.data;
};