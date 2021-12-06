import jwt_decode from "jwt-decode";

const getUser = () => {
	const userStr = localStorage.getItem('user');
	return userStr ? JSON.parse(userStr) : null;

}

const getToken = () => {
	return localStorage.getItem('access_token');
}

const getRefreshToken = () => {
	return localStorage.getItem('refresh_token');
}

const removeUserSession = () => {
	localStorage.removeItem('access_token');
	localStorage.removeItem('refresh_token');
	localStorage.removeItem('user');
	localStorage.removeItem('emkk_member');
	localStorage.removeItem('issuer');
	localStorage.removeItem('secretary');
	localStorage.removeItem('reviewer')
}
const setToken = (accessToken) => {
	localStorage.setItem('access_token', accessToken);
}


const setUserSession = (accessToken, refreshToken, user) => {
	localStorage.setItem('refresh_token', refreshToken);
	localStorage.setItem('access_token', accessToken);
	localStorage.setItem('user', JSON.stringify(user));
}

const getRoles = (accessToken) => {
	const decoded = jwt_decode(accessToken);
	return {
		issuer: JSON.parse(decoded['issuer']),
		emkkMember: JSON.parse(decoded['emkk_member']),
		reviewer: JSON.parse(decoded['reviewer']),
		secretary: JSON.parse(decoded['secretary'])
	}
}

const caseInsensitiveSort = (rowA, rowB) => {
	const fname = rowA.leader.first_name + rowA.leader.last_name[0] + rowA.leader.patronymic;
	const sname = rowB.leader.first_name + rowB.leader.last_name[0] + rowB.leader.patronymic;

	if (fname > sname) {
		return 1;
	}

	if (sname > fname) {
		return -1;
	}

	return 0;
};

export { getUser, getToken, removeUserSession, setUserSession, getRefreshToken, setToken, caseInsensitiveSort, getRoles };