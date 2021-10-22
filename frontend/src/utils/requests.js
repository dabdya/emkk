import { getRefreshToken, getToken, setToken } from "./Common";
import axios from "axios";
export default class Requests {
	constructor() {
		this.wrappedAxios = axios.create();
	}

	get(url, config = {headers:{}}) {
		return this.wrappedAxios.get(url, config)
			.catch(async error => {
				if (error.response.data.detail === "Signature has expired") {
					return await this.wrappedAxios.post("http://localhost:8000/auth/users/refresh", { refresh_token: getRefreshToken() })
						.then(resp => {
							setToken(resp.data.user.access_token);
							config.headers["Authorization"] = "Token "+ getToken();
							return this.wrappedAxios.get(url, config);
						})
				}
			});
	}

	post(url, config = {headers:{}}) {
		return this.wrappedAxios.post(url, config)
			.catch(async error => {
				if (error.response.data.detail === "Signature has expired") {
					return await this.wrappedAxios.post("http://localhost:8000/auth/users/refresh", { refresh_token: getRefreshToken()  })
						.then(resp => {
							setToken(resp.data.user.access_token);
							config.headers["Authorization"] = "Token "+ getToken();
							return this.wrappedAxios.post(url, config);
						})
				}
			});
	}
}
