import { getRefreshToken, getToken, setAccessToken } from "./Common";
import axios from "axios";

const request = new axios.create({
	baseURL: process.env.REACT_APP_URL
});

request.interceptors.request.use(
	config => {
		if (getToken() !== null) {
			config.headers = {
				'Authorization': `Token ${getToken()}`
			}
		}
		return config;
	},
	error => {
		Promise.reject(error)
	});

request.interceptors.response.use((response) => {
	return response
}, function (error) {
	const originalRequest = error.config;
	// if (error.status !== 403) {
	// 	return Promise.reject(error);
	// }
	if (error.response.status === 403 && !originalRequest._retry) {
		originalRequest._retry = true;
		return request.post(`${process.env.REACT_APP_URL}/auth/users/refresh`, { refresh_token: getRefreshToken() })
			.then(res => {
				if (res.status === 200) {
					setAccessToken(res.data.access_token);
					request.defaults.headers.common['Authorization'] = 'Token ' + getToken();
					request.defaults.headers['Authorization'] = 'Token ' + getToken();
					originalRequest.headers['Authorization'] = 'Token ' + getToken();
					return request(originalRequest);
				}
			})
	}
});

export default request;