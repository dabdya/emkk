import React from 'react'
import axios from 'axios';
import validator from 'validator';
import { TextField, Button } from '@mui/material'

export default class Registration extends React.Component {

	constructor(props) {
		super(props);

		this.state =
		{
			register:
			{
				username: "",
				email: "",
				password: "",
				password2: "",
				firstName: "",
				secondName: "",
				patronymic: "",
			},
			errors:
			{
				email: "",
				login: "",
				passwordValidity: "",
				serverIssue: "",
			}
		};
		this.onSubmit = this.onSubmit.bind(this);
		this.changeInputRegister = this.changeInputRegister.bind(this);
		this.changeEmail = this.changeEmail.bind(this);
		this.close = this.close.bind(this);
	}
	changeEmail(event) {
		event.persist();
		if (validator.isEmail(event.target.value)) {
			this.setState(prev => {
				return {
					register: {
						...prev.register,
						[event.target.name]: event.target.value
					}
				}
			})
			this.setState(prev => {
				return {
					errors: {
						...prev.errors,
						[event.target.name]: ""
					}
				}
			})
		} else {
			this.setState(prev => {
				return {
					errors: {
						...prev.errors,
						[event.target.name]: "Введите валидный Email"
					}
				}
			})
		}
	}

	changeInputRegister(event) {
		event.persist();
		this.setState(prev => {
			return {
				register: {
					...prev.register,
					[event.target.name]: event.target.value
				}
			}
		})
	};

	close() {
		this.setState(() => ({ buttonIsPressed: false }))
		window.location.href = '/signup';
	}

	async onSubmit(event) {
		event.preventDefault();
		if (this.state.register.password !== this.state.register.password2) {
			this.setState(prev => {
				return {
					errors: {
						...prev.errors,
						passwordValidity: "Пароли не совпадают"
					}
				}
			})
		} else if (!validator.isStrongPassword(this.state.register.password, { minLength: 6, minSymbols: 0, minNumbers: 0, minUppercase: 0 })) {
			this.setState(prev => {
				return {
					errors: {
						...prev.errors,
						passwordValidity: "Пароль должен состоять из шести маленьких латинских букв"
					}
				}
			})
		} else {
			const config = {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
			};
			console.log('0000000000000000000')
			await axios.post(`${process.env.REACT_APP_URL}/auth/users`, {
				user: {
					username: this.state.register.username,
					email: this.state.register.email,
					password: this.state.register.password,
					first_name: this.state.register.firstName,
					last_name: this.state.register.secondName,
					patronymic: this.state.register.patronymic,
				}
			}, config).then(res => {
				if (res.data) {
					console.log('0000000000000000000')
					alert('Registration complete!'); // делать не аллертами
					this.props.history.push("/login"); // можно автоматически задать поля в логин-форме после регистрации.
				} else {
					console.log('------------------------------')
					this.setState(prev => {
						return {
							errors: {
								...prev.errors,
								email: "Такой Email уже зарегестрирован"
							}
						}
					})
				}
			}).catch(err => {
				console.log(err)
				console.log("######################")
				this.setState(prev => {
					return {
						errors: {
							...prev.errors,
							serverIssue: "Возникли проблемы на сервере :("
						}
					}
				})
			})
		}
	};

	render() {
		return (
			<div className="box" style={{
				padding: "3rem 2rem 1rem 2rem",
				display: "flex",
				width: "35%",
				border: "0.1rem outset gray",
				borderRadius: 15,
				position: "fixed",
				top: "55%",
				left: "50%", transform: "translate(-50%, -50%)",
				justifyContent: "center",
				maxHeight: "75%",
			}}>
				<form style={{
					width: "80%",
					display: "inline-block"
					 }} onSubmit={this.onSubmit}>
					<TextField fullWidth id="outlined-required" size="small" name="username" required
							   margin="normal" label="Логин"
							   variant="outlined" onChange={this.changeInputRegister} />
					<TextField error={this.state.errors.email} helperText={this.state.errors.email} fullWidth id="outlined-required" size="small" name="email" required
							   margin="normal" label="Email"
							   variant="outlined" onChange={this.changeEmail} />
					<div style={{ display:"flex", justifyContent:"space-between"}}>
					   <TextField id="outlined-required" size="small" name="firstName" required
								  margin="normal" label="Имя"
								  variant="outlined" onChange={this.changeInputRegister} />
					   <TextField id="outlined-required" size="small" name="secondName" required
								  margin="normal" label="Фамилия"
								  variant="outlined" onChange={this.changeInputRegister} />
				   </div>
					<TextField fullWidth id="outlined" size="small" name="patronymic"
							   margin="normal" label="Отчество"
							   variant="outlined" onChange={this.changeInputRegister} />
					<TextField error={this.state.errors.passwordValidity} helperText={this.state.errors.passwordValidity}
							   fullWidth id="outlined-required" size="small" type="password" name="password" required
							   margin="normal" label="Пароль"
							   variant="outlined" onChange={this.changeInputRegister} />
					<TextField error={this.state.errors.passwordValidity} fullWidth id="outlined-required" size="small" type="password" name="password2" required
							   margin="normal" label="Повторите пароль"
							   variant="outlined" onChange={this.changeInputRegister} />
					<Button fullWidth size="medium" variant="contained"
							type="submit"
							style={{
								marginTop: 20
							}}>
						Зарегестрироваться
					</Button>
					<div style={{display:"flex", justifyContent:"center"}}>
						<span style={{ marginTop:5, color:"gray" }}>ЭМКК</span>
					</div>
					{this.state.errors.serverIssue &&
					<><div style={{display:"flex", justifyContent:"center"}}>
						<span style={{color:"darkred"}}>
							Сервер упаль :(
						</span>
					</div>
					<div style={{display:"flex", justifyContent:"center"}}>
						<span style={{color:"darkred"}}>
							Попробуйте через некоторое время!
						</span>
					</div></>}

				</form>
			</div>
		)
	}
}
