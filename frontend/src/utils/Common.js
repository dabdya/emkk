const getUser = () => {
	const userStr = localStorage.getItem('user');
	return userStr ? JSON.parse(userStr) : null;

}

const getToken = () => {
	return localStorage.getItem('access_token');
}

const removeUserSession = () => {
	localStorage.removeItem('access_token');
	localStorage.removeItem('user');
}

const setUserSession = (token, user) => {
	localStorage.setItem('access_token', token);
	localStorage.setItem('user', JSON.stringify(user));
}

export {getUser, getToken, removeUserSession, setUserSession};