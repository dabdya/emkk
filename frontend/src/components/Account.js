import React from "react";
import {withRouter} from "react-router-dom";
import {getToken, getUser, setTokens} from "../utils/Common";
import Requests from "../utils/requests";
import {Button} from "@skbkontur/react-ui";

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.requests = new Requests();
        this.state = {
            email: "",
            first_name: "",
            last_name: "",
            patronymic: "",
            username: "",
            old_password: "",
            password: "",

            isEditing: false,
            repeatedPasswordError: ""

        }
        this.changeEditing = this.changeEditing.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.changeProfile = this.changeProfile.bind(this)
        this.config = this.config.bind(this)
        this.handleConfirmPassword = this.handleConfirmPassword.bind(this)
    }

    config() {
        return {
            headers: {
                Authorization: "Token " + getToken()
            }
        }
    };

    changeEditing() {
        this.setState({ isEditing: !this.state.isEditing })
    }


    async onSubmit(event) {
        event.preventDefault();
        const { isEditing, old_password, repeatedPasswordError, ...user } = this.state;
        const data = {
            user,
            old_password: this.state.old_password

        }
        await this.requests.patch(`${process.env.REACT_APP_URL}/auth/user`, data, this.config())
            .then(resp => {
                this.changeEditing()
                this.setState({repeatedPasswordError: ""});
                setTokens(resp.data.user.access_token, resp.data.user.refresh_token)
            })
            .catch( err => {
                this.setState({repeatedPasswordError: "Новый пароль повторен неправильно"})
                //#TODO Посмотреть на респонс и поставить соответствующую ошибку
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
           this.setState({repeatedPasswordError: "Повторный пароль введен неправильно"})
        } else {
            this.setState({repeatedPasswordError: ""})
        }
    }

    componentDidMount() {
        this.requests.get(`${process.env.REACT_APP_URL}/auth/user`, this.config())
            .then(response => {
                this.setState({
                    email: response.data.user.email,
                    first_name: response.data.user.first_name,
                    last_name:  response.data.user.last_name,
                    patronymic:  response.data.user.patronymic,
                    username: response.data.user.username
                })
                console.log(response)
                console.log(this.state)
            })
    }


    /*#TODO
    Сейчас что-то неладное с валидацией старого пароля. На бэке вроде все норм, но по прежнему на рандомный пароль приходит 200 ОК.
    Нет нормальной валидации на фронте. Можно ввести новый пароль, не вводя старый, можно ввести старый, не вводя новый. Доработать.
    Расположение полей на смену пароля -- говно. Надо сделать красиво.
     */

    render () {
        const {username, repeatedPasswordError}= this.state
        return (
            <div className="profile-parent-box">
                <div className="profile-header">
                    Профиль пользователя {username}
                </div>
                <form onSubmit={this.onSubmit}>
                    <div className="profile-box">
                        <div className="profile-cell">
                            <div>Логин:</div>
                            <div>
                                {this.state.username}
                            </div>
                        </div>
                        <div className="profile-cell">
                            <div>Адрес email:</div>
                            <div>
                                {this.state.isEditing ?
                                    <input defaultValue={this.state.email} name="email" onChange={this.changeProfile}/> :
                                    this.state.email}
                            </div>
                        </div>
                        <div className="profile-cell">
                            <div>Имя:</div>
                            {this.state.isEditing ?
                                <input defaultValue={this.state.first_name} name="first_name" onChange={this.changeProfile}/> :
                                this.state.first_name}
                        </div>
                        <div className="profile-cell">
                            <div>Фамилия:</div>
                            {this.state.isEditing ?
                                <input defaultValue={this.state.last_name} name="last_name" onChange={this.changeProfile}/> :
                                this.state.last_name}
                        </div>
                        <div className="profile-cell">
                            <div>Отчество:</div>
                            {this.state.isEditing ?
                                <input defaultValue={this.state.patronymic} name="patronymic" onChange={this.changeProfile}/> :
                                this.state.patronymic}
                        </div>
                        {this.state.isEditing &&
                        <>
                            <div className="profile-cell">
                                <div>Старый пароль</div>
                                <input name="old_password" onChange={this.changeProfile}/>
                            </div>
                            <div className="profile-cell">
                                <div>Новый пароль</div>
                                <input name="password" onChange={this.changeProfile}/>
                            </div>
                            <div className="profile-cell">
                                <div>Повторите пароль</div>
                                <input onChange={this.handleConfirmPassword}/>
                                {this.state.repeatedPasswordError &&
                                <label style={{color:"red"}} htmlFor="new_password">
                                    {repeatedPasswordError}
                                </label>}
                            </div>
                        </>
                        }
                    </div>
                {this.state.isEditing && <Button type="submit">Сохранить</Button>}
                </form>
                {!this.state.isEditing && getUser() === this.state.username && <Button onClick={this.changeEditing}>Редактировать</Button>}
            </div>
        )
    }
}

export default withRouter(Account);