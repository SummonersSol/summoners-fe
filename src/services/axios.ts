import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL!;
export default axios.create({
    baseURL: BACKEND_URL,
    timeout: 0, // no timeout
    headers: {
        'Accept': 'application/json',
    },
    responseType: 'json',
});