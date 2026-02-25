import { memoriesAPI } from "./api";

const memoryService = {
  getAll: (params) => memoriesAPI.getAll(params),
  getById: (id) => memoriesAPI.getById(id),
  create: (data) => memoriesAPI.create(data),
  createWithFile: (formData) => memoriesAPI.createWithFile(formData),
  update: (id, data) => memoriesAPI.update(id, data),
  delete: (id) => memoriesAPI.delete(id),
  like: (id) => memoriesAPI.like(id),
  unlike: (id) => memoriesAPI.unlike(id),
  getLikeSummary: (id) => memoriesAPI.getLikeSummary(id),
  share: (id, data) => memoriesAPI.share(id, data),
  getMapLocations: () => memoriesAPI.getMapLocations(),
  getTimeline: (year) => memoriesAPI.getTimeline(year),
};

export default memoryService;
