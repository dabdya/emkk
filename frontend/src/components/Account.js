import React from "react";
import { getUser, setTokens } from "../utils/Common";
import request from "../utils/requests";
import Button from "@mui/material/Button"
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { red, green } from "@material-ui/core/colors";

export default class Account extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: "",
			first_name: "",
			last_name: "",
			patronymic: "",
			username: "",
			old_password: "",
			password: "",

			editingMainInfo: false,
			editingPassword: false,
			repeatedPasswordError: ""

		}
		this.changeEditingMain = this.changeEditingMain.bind(this)
		this.changeEditingPass = this.changeEditingPass.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
		this.changeProfile = this.changeProfile.bind(this)
		this.handleConfirmPassword = this.handleConfirmPassword.bind(this)
	}

	changeEditingMain() {
		this.setState({ editingMainInfo: !this.state.editingMainInfo })
	}

	changeEditingPass() {
		this.setState({ editingPassword: !this.state.editingPassword })
	}

	async onSubmit(event) {
		event.preventDefault();
		const { editingMainInfo, editingPassword, old_password, password, passwordChanged, repeatedPasswordError, ...user } = this.state;

		let data
		if (editingMainInfo) {
			data = {
				user
			};
		} else {
			data = {
				user: {
					password,
					...user
				},
				old_password: this.state.old_password
			};
		}

		await request.patch("/auth/user", data)
			.then(resp => {
				if (editingMainInfo) { this.changeEditingMain() }
				if (editingPassword) {
					this.changeEditingPass()
					this.setState({ passwordChanged: true })
				}
				this.setState({ repeatedPasswordError: "" });
				setTokens(resp.data.user.access_token, resp.data.user.refresh_token)
			})
			.catch(err => {
				console.log(err.response)
				if (err.response.data.user === "Old password is invalid") {
					this.setState({ repeatedPasswordError: "Старый пароль введен неверно!" })
				} else if (err.response.data.user === "Old password not provided or invalid") {
					this.setState({ repeatedPasswordError: "Старый пароль не введен или введен неправильно." })
				} else if (err.response.data.user?.password[0] === "This field may not be blank.") {
					this.setState({ repeatedPasswordError: "Введите новый пароль." })
				} else if (err.response.data.user?.password[0] === "Ensure this field has at least 8 characters.") {
					this.setState({ repeatedPasswordError: "Новый пароль должен быть минимум 8 символов." })
				}
			})
	}

	changeProfile(event) {
		this.setState(prev => {
			return {
				...prev,
				[event.target.name]: event.target.value
			}
		})
	}

	handleConfirmPassword(event) {
		if (event.target.value !== this.state.password) {
			this.setState({ repeatedPasswordError: "Повторный пароль введен неправильно" })

		} else {
			this.setState({ repeatedPasswordError: "" })
		}
	}

	componentDidMount() {
		request.get("/auth/user")
			.then(response => {
				this.setState({
					email: response.data.user.email,
					first_name: response.data.user.first_name,
					last_name: response.data.user.last_name,
					patronymic: response.data.user.patronymic,
					username: response.data.user.username
				})
			})
	}


	/*#TODO
	Перенести одинаковые inline-styling'и в цсс файл
	 */

	render() {
		const { username, repeatedPasswordError, editingMainInfo, editingPassword } = this.state;
		return (
			<div className="profile-parent-box">
				<div className="profile-header">
					<h1 style={{ fontSize: "26px" }}>Профиль пользователя {username}</h1>
				</div>
				<form onSubmit={this.onSubmit}>
					<div>
						<h2 style={{ paddingLeft: "0.5rem", fontSize: "20px" }}>Основная информация</h2>
					</div>
					<div className="profile-box">
						<div className="profile-cell">
							<div>Адрес email:</div>
							<div>
								{editingMainInfo ?
									<input defaultValue={this.state.email} name="email" onChange={this.changeProfile} /> :
									this.state.email}
							</div>
						</div>
						<div className="profile-cell">
							<div>Имя:</div>
							{editingMainInfo ?
								<input defaultValue={this.state.first_name} name="first_name" onChange={this.changeProfile} /> :
								this.state.first_name}
						</div>
						<div className="profile-cell">
							<div>Фамилия:</div>
							{editingMainInfo ?
								<input defaultValue={this.state.last_name} name="last_name" onChange={this.changeProfile} /> :
								this.state.last_name}
						</div>
						<div className="profile-cell">
							<div>Отчество:</div>
							{editingMainInfo ?
								<input defaultValue={this.state.patronymic} name="patronymic" onChange={this.changeProfile} /> :
								this.state.patronymic}
						</div>
					</div>
					{editingMainInfo && <Button style={{ marginTop: "1rem", marginLeft: "1rem" }} variant="outlined" type="submit">Сохранить</Button>}
					{editingMainInfo && <Button style={{ marginTop: "1rem", marginLeft: "1rem" }} variant="outlined" type="submit" onClick={this.changeEditingMain}>Отмена</Button>}
				</form>
				{!editingMainInfo && getUser() === this.state.username &&
					<Button style={{ marginTop: "1rem", marginLeft: "1rem" }} variant="outlined" onClick={this.changeEditingMain}>Редактировать</Button>}

				<div><hr width={"98%"} /></div>

				<form onSubmit={this.onSubmit}>
					<div>
						<h2 style={{ paddingLeft: "0.5rem", fontSize: "20px" }}>Пароль</h2>
						{this.state.passwordChanged &&
							<div style={{ marginLeft: "1rem", borderRadius: "5px", height: "fit-content", display: "flex", width: "25%", backgroundColor: "#DAFFD4" }}>
								<CheckCircleOutlineIcon style={{ padding: "0.3rem" }} fontSize="medium" sx={{ color: green["400"] }} />
								<span style={{ padding: "0.5rem, 0.2rem", display: "flex" }}>
									Пароль был успешно изменен!
								</span>
							</div>}
						{this.state.repeatedPasswordError &&
							<div style={{ marginLeft: "1rem", borderRadius: "5px", height: "fit-content", display: "flex", width: "25%", backgroundColor: "#FAEBEB" }}>
								{<WarningAmberIcon style={{ padding: "0.3rem" }} fontSize="medium" sx={{ color: red["400"] }} />}
								<span style={{ padding: "0.5rem 0.2rem", display: "flex" }}>
									{repeatedPasswordError}
								</span>
							</div>}
					</div>
					<div className="profile-box">
						{editingPassword &&
							<>
								<div className="profile-cell">
									<div>Старый пароль:</div>
									<input type="password" name="old_password" onChange={this.changeProfile} />
								</div>
								<div className="profile-cell">
									<div>Новый пароль:</div>
									<input type="password" name="password" onChange={this.changeProfile} />
								</div>
								<div className="profile-cell">
									<div>Повторите пароль:</div>
									<input type="password" onChange={this.handleConfirmPassword} />
								</div>
							</>}
					</div>
					{editingPassword && <Button disabled={repeatedPasswordError.length > 1} style={{ marginBottom: "10px", marginTop: "1rem", marginLeft: "1rem" }} variant="outlined" type="submit">Сохранить</Button>}
					{editingPassword && <Button style={{ marginBottom: "10px", marginTop: "1rem", marginLeft: "1rem" }} variant="outlined" type="submit" onClick={this.changeEditingPass}>Отмена</Button>}
				</form>
				{!editingPassword && getUser() === this.state.username &&
					<Button style={{ marginBottom: "10px", marginTop: "1rem", marginLeft: "1rem" }} variant="outlined" onClick={this.changeEditingPass}>Изменить пароль</Button>}
			</div>
		)
	}
}