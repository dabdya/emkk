// return the user data from the session storage
export const getUser = () => {
	const userStr = localStorage.getItem('user');
	return userStr ? JSON.parse(userStr) : null;

}

// return the token from the session storage
export const getToken = () => {
	return localStorage.getItem('token');
}

// remove the token and user from the session storage
export const removeUserSession = () => {
	localStorage.removeItem('token');
	localStorage.removeItem('user');
}

// set the token and user from the session storage
export const setUserSession = (token, user) => {
	localStorage.setItem('token', token);
	localStorage.setItem('user', JSON.stringify(user));
}