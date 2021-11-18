import { getRefreshToken, getToken, setToken } from "./Common";
import axios from "axios";
export default class Requests {
	constructor() {
		this.wrappedAxios = axios.create();
	}

	async get(url, config = { headers: {} }) {
		return this.wrappedAxios.get(url, config)
			.catch(async error => {
				if (error.response.data.detail === "Signature has expired") {
					return await this.wrappedAxios.post(`${process.env.REACT_APP_URL}/auth/users/refresh`, { refresh_token: getRefreshToken() })
						.then(async resp => {
							setToken(resp.data.access_token);
							config.headers["Authorization"] = "Token " + getToken();
							return this.wrappedAxios.get(url, config);
						})
				}
				return Promise.reject(error)
			});
	}

	async post(url, data, config = { headers: {} }) {
		return this.wrappedAxios.post(url, data, config)
			.catch(async error => {
				if (error.response.data.detail === "Signature has expired") {
					return await this.wrappedAxios.post(`${process.env.REACT_APP_URL}/auth/users/refresh`, { refresh_token: getRefreshToken() })
						.then(resp => {
							setToken(resp.data.access_token);
							config.headers["Authorization"] = "Token " + getToken();
							return this.wrappedAxios.post(url, data, config);
						})
				}
				return Promise.reject(error)
			});
	}

	async patch(url, data, config = { headers: {} }) {
		return this.wrappedAxios.patch(url, data, config)
			.catch(async error => {
				if (error.response.data.detail === "Signature has expired") {
					return await this.wrappedAxios.post(`${process.env.REACT_APP_URL}/auth/users/refresh`, { refresh_token: getRefreshToken() })
						.then(resp => {
							setToken(resp.data.access_token);
							config.headers["Authorization"] = "Token " + getToken();
							return this.wrappedAxios.patch(url, data, config);
						})
				}
				return Promise.reject(error)
			});
	}

	async delete(url, config = { headers: {} }) {
		return this.wrappedAxios.delete(url, config)
			.catch(async error => {
				if (error.response.data.detail === "Signature has expired") {
					return await this.wrappedAxios.post(`${process.env.REACT_APP_URL}/auth/users/refresh`, { refresh_token: getRefreshToken() })
						.then(resp => {
							setToken(resp.data.access_token);
							config.headers["Authorization"] = "Token " + getToken();
							return this.wrappedAxios.delete(url, config);
						})
				}
				return Promise.reject(error)
			});
	}
}
