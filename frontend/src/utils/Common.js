const getUser = () => {
	const userStr = localStorage.getItem('user');
	return userStr ? JSON.parse(userStr) : null;

}

const getToken = () => {
	return localStorage.getItem('token');
}

const removeUserSession = () => {
	localStorage.removeItem('token');
	localStorage.removeItem('user');
}

const setUserSession = (token, user) => {
	localStorage.setItem('token', token);
	localStorage.setItem('user', JSON.stringify(user));
}

export {getUser, getToken, removeUserSession, setUserSession};