import { getRefreshToken, setToken } from "./Common";
import axios from "axios";
export default class myaxios {
	constructor(config) {
		this.axioss = axios.create(config);
	}

	get(url) {
		return this.axioss.get(url)
			.catch(async error => {
				if (error.response.data.detail === "Signature has expired") {
					this.axioss= axios.create();
					await this.axioss.post("http://localhost:8000/auth/users/refresh",{user:{refresh_token: getRefreshToken()}})
						.then(resp => {
							setToken(resp.data.user.access_token)
						})
				}
			});
	}
}
