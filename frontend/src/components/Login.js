import React from 'react';
import axios from 'axios';
import { setUserSession } from '../utils/Common';
import WarningSign from '@skbkontur/react-icons/Warning'
import { Button, Center, Gapped, Link } from '@skbkontur/react-ui';
import { GoogleLogin } from 'react-google-login';



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

				window.location.href = "/";
			}).catch(err => {
				if (err.response?.data?.user) this.setState({ error: 'Неправильный логин или пароль' });
				else this.setState({ error: 'Ошибка. Попробуйте позже' });
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

	renderInput(text, type, className, id, name, value, onChange) {
		return (
			<div style={{ marginTop: "15px" }}>
				<label htmlFor={name}>{text}</label><br />
				<input autoComplete="new-password" type={type} className={className} id={id} name={name} value={value} onChange={onChange} required />
			</div>
		);
	}

	render() {
		return (
			<Center style={{ height: '80vh' }}>
				<div style={{ height: "40vh", width: "45vh", border: "0.5px solid gray", borderRadius: 15 }}>
					<Center>
						<form onSubmit={this.onSubmit}>
							<Gapped gap={0}>
								{this.renderInput("Логин", "text", "inputField",
									"login", "login", this.state.login, this.changeInputRegister)}
								{this.state.error && <><small style={{ color: 'red', position: "absolute" }}><WarningSign /></small><br /></>}<br />
							</Gapped>
							<Gapped gap={0}>
								{this.renderInput("Пароль", "password", "inputField",
									"password", "password", this.state.password, this.changeInputRegister)}
								{this.state.error && <><small style={{ color: 'red', position: "absolute" }}><WarningSign /></small><br /></>}<br />
							</Gapped>
							<Button use='link'>Забыли пароль?</Button>
							<Center>
								<div style={{ marginTop: 80 }}>
									<Gapped gap={20}>
										<Link href="/signup">Зарегистрироваться</Link>
										<Button style={{ marginTop: 20 }} width="10vw" size="medium" type="submit">
											Войти
										</Button>
									</Gapped>
									<GoogleLogin
										clientId="608021595332-nse82l1q2o8t0j7g4s0bu9815fp0l4dn.apps.googleusercontent.com"
										buttonText=""
										onSuccess={(response) => {
											console.log(response);
										}}
										onFailure={(response) => {
											console.log(response);
										}}

									/>
								</div>
							</Center>
						</form>
					</Center>
				</div>
			</Center>

		);
	}
}