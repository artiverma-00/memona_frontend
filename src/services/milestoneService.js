import { milestonesAPI } from "./api";

const milestoneService = {
  getAll: (params) => milestonesAPI.getAll(params),
  getById: (id) => milestonesAPI.getById(id),
  create: (data) => milestonesAPI.create(data),
  update: (id, data) => milestonesAPI.update(id, data),
  delete: (id) => milestonesAPI.delete(id),
  getTodayReminders: () => milestonesAPI.getTodayReminders(),
};

export default milestoneService;
