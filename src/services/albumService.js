import { albumsAPI } from "./api";

const albumService = {
  getAll: (params) => albumsAPI.getAll(params),
  getById: (id) => albumsAPI.getById(id),
  create: (data) => albumsAPI.create(data),
  createWithFile: (formData) => albumsAPI.createWithFile(formData),
  update: (id, data) => albumsAPI.update(id, data),
  updateWithFile: (id, formData) => albumsAPI.updateWithFile(id, formData),
  delete: (id) => albumsAPI.delete(id),
  addMemory: (id, memoryId) => albumsAPI.addMemory(id, memoryId),
  removeMemory: (id, memoryId) => albumsAPI.removeMemory(id, memoryId),
  share: (id, data) => albumsAPI.share(id, data),
};

export default albumService;
