import API from 'services/api';

export default class SawmillsService {

  saveSawmill({ id, body }) {
    if (id) {
      return API.patch(`sawmills/${id}`, { body });
    }
    return API.post('sawmills', { body });
  }

  deleteSawmill(id) {
    return API.delete(`sawmills/${id}`);
  }
}
