import React from 'react';
import axios from 'axios';
import { setUserSession } from '../utils/Common';

export default class Login extends React.Component {

	constructor(props) {
		super(props);

		this.state = {login: '', password: ''};
		this.onSubmit = this.onSubmit.bind(this);
	}

	onSubmit(e) {
		e.preventDefault();
		axios.post('http://localhost:8000/auth/users/login', { user: {username: this.state.login, password: this.state.password }})
		.then(response => {
			setUserSession(response.data.user.token, response.data.user.username);
			this.props.history.push('/dashboard'); // не убирает кнопки login и registration после входа. пофиксить.
		});
		
	}

	render() {
		return (
			<form onSubmit={this.onSubmit}>
				<div>
				Username<br/>
				<input type="text" name="login" value={this.state.login} onChange={(e) => this.setState({login: e.target.value})}/>
				</div>
				<div style={{ marginTop: 10 }}>
				Password<br />
				<input type="password" name="password" value={this.state.password} onChange={ (e) => this.setState({password: e.target.value})} />
				</div>
				{/* {error && <><small style={{ color: 'red' }}>{error}</small><br /></>}<br /> */}
				<input type="submit" value={'Login'} /><br />
			</form>
		);
	}
}	