import React from 'react';
import axios from 'axios';
import { setUserSession } from '../utils/Common';
import OkIcon from '@skbkontur/react-icons/Ok';
import WarningSign from '@skbkontur/react-icons/Warning'
import { Redirect } from 'react-router-dom';
import { Button, Center, Input, Gapped, Link } from '@skbkontur/react-ui';

export default class Login extends React.Component {

	constructor(props) {
		super(props);

		this.state = { login: '', password: '', error: null };
		this.onSubmit = this.onSubmit.bind(this);
		this.renderInput = this.renderInput.bind(this);
		this.changeInputRegister = this.changeInputRegister.bind(this);
	}

	onSubmit(e) {
		e.preventDefault();
		axios.post('http://localhost:8000/auth/users/login', { user: { username: this.state.login, password: this.state.password } })
			.then(response => {
				setUserSession(response.data.user.access_token, response.data.user.refresh_token, response.data.user.username);
				
				this.props.history.push('/'); // не убирает кнопки login и registration после входа. пофиксить.
			}).catch(err => {
				if (err.response.data.user) this.setState({ error: `Неправильный логин или пароль` });
			});
	}

	changeInputRegister(event) {
		event.persist();
		this.setState(prev => {
			return {
				...prev,
				[event.target.name]: event.target.value
			}

		})
	};

	renderInput(text, type, className, id, name, value, onChange){
		return (
			<div style={{marginTop: "15px"}}>
				<label htmlFor={name}>{text}</label><br/>
				<input autoComplete="new-password" type={type} className={className} id={id} name={name} value={value} onChange={onChange} required/>
			</div>
		);
	}

	render() {
		return (
			<Center style={{ height: '80vh' }}>
				<div style={{height: "40vh", width:"45vh", border:"0.5px solid gray", borderRadius: 15}}>
					<Center>
						<form onSubmit={this.onSubmit}>
							<Gapped gap={0}>
							{this.renderInput("Логин", "text", "inputField",
								"login", "login", this.state.login, this.changeInputRegister)}
								{this.state.error && <><small style={{ color: 'red', position:"absolute"}}><WarningSign /></small><br /></>}<br />
							</Gapped>
							<Gapped gap={0}>
								{this.renderInput("Пароль", "password", "inputField",
									"password", "password", this.state.password, this.changeInputRegister)}
								{this.state.error && <><small style={{ color: 'red', position:"absolute"}}><WarningSign /></small><br /></>}<br />
							</Gapped>
							<Button use='link'>Забыли пароль?</Button>
							<Center>
								<div style={{marginTop: 80}}>
									<Gapped gap={20}>
										<Link href="/signup">Зарегистрироваться</Link>
										<Button style={{marginTop:20}} width="10vw" size="medium" type="submit">
											Войти
										</Button>
									</Gapped>
								</div>
							</Center>
						</form>
					</Center>
				</div>
			</Center>
		);
	}
}