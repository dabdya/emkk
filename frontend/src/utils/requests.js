import { getRefreshToken, setToken } from "./Common";
import axios from "axios";
export default class Requests {
	constructor() {
		this.wrappedAxios = axios.create();
	}

	get(url, config = {}) {
		return this.wrappedAxios.get(url, config)
			.catch(async error => {
				debugger;
				if (error.response.data.detail === "Signature has expired") {
					await this.wrappedAxios.post("http://localhost:8000/auth/users/refresh", { user: { refresh_token: getRefreshToken() } })
						.then(resp => {
							setToken(resp.data.user.access_token);
							return this.wrappedAxios.get(url, config);
						})
				}
			});
	}
}
