import axios from 'axios';
import { MLAB_API_URL } from './secrets';

const instance = axios.create({});

instance.defaults.baseURL = MLAB_API_URL;
instance.defaults.headers.post['Content-Type'] = 'application/json';
instance.defaults.headers.common['Authorization'] = 'AUTH TOKEN FROM INSTANCE';

export default instance;