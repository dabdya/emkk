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
}
const setToken = (accessToken) =>{
	localStorage.setItem('access_token', accessToken);
}


const setUserSession = (accessToken, refreshToken, user) => {
	localStorage.setItem('refresh_token', refreshToken);
	localStorage.setItem('access_token', accessToken);
	localStorage.setItem('user', JSON.stringify(user));
}

export {getUser, getToken, removeUserSession, setUserSession, getRefreshToken, setToken};