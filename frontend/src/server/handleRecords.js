import axios from "axios";
const baseUrl = '/api/persons';

const getAll = async () => {
  const request = axios.get(baseUrl);
  const response = await request;
  return response.data;
};

const create = async (newRecord) => {
  const request = axios.post(baseUrl, newRecord);
  const response = await request;
  return response.data;
};

const updateRecord = async (id, updatedRecord) => {
  const url = `${baseUrl}/${id}`;
  const request = axios.put(url, updatedRecord);
  const response = await request;
  return response.data;
}

const deleteRecord = async (id) => {
  const url = `${baseUrl}/${id}`;
  const request = axios.delete(url);
  const response = await request;
  return response.data;
};

export default { getAll, create, updateRecord, deleteRecord };
