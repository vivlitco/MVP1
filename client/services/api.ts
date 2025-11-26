const API_BASE_URL = 'http://localhost:8000/api';

export const API = {
    AUTH: {
        SIGNUP: `${API_BASE_URL}/auth/signup`,
        LOGIN: `${API_BASE_URL}/auth/login`,
    },
    JARS: {
        BASE: `${API_BASE_URL}/jars`,
        SHARED: (id: string) => `${API_BASE_URL}/jars/shared/${id}`,
    }
};
