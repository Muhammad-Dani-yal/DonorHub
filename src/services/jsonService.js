const JSON_API_URL = import.meta.env.VITE_JSON_SERVER_URL || "http://localhost:3001";

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${JSON_API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!response.ok) throw new Error(`Fallback API request failed (${response.status}).`);
  return response.status === 204 ? null : response.json();
};

const asRecord = (items = []) => Object.fromEntries(items.map((item) => [String(item.id), item]));

export const getJsonDonors = async () => asRecord(await requestJson("/donors"));
export const addJsonDonor = async (donor) => requestJson("/donors", {
  method: "POST",
  body: JSON.stringify(donor),
});
export const updateJsonDonor = async (id, donor) => requestJson(`/donors/${id}`, {
  method: "PATCH",
  body: JSON.stringify(donor),
});
export const deleteJsonDonor = async (id) => requestJson(`/donors/${id}`, { method: "DELETE" });

export const getJsonRequests = async () => asRecord(await requestJson("/requests"));
export const addJsonRequest = async (request) => requestJson("/requests", {
  method: "POST",
  body: JSON.stringify(request),
});
export const updateJsonRequest = async (id, request) => requestJson(`/requests/${id}`, {
  method: "PATCH",
  body: JSON.stringify(request),
});
export const deleteJsonRequest = async (id) => requestJson(`/requests/${id}`, { method: "DELETE" });
