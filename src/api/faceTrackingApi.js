// src/api/faceTrackingApi.js
import apiClient from "./apiClient";

export const createFaceSession = async (payload) => {
  const res = await apiClient.post("/face/sessions", payload);
  return res.data;
};

export const fetchFaceWeekly = async (days = 28) => {
  const res = await apiClient.get("/face/weekly", { params: { days } });
  return res.data;
};

export const deleteFaceSession = async (id) => {
  const res = await apiClient.delete(`/face/sessions/${id}`);
  return res.data;
};
