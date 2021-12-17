import React from "react";
import {withRouter} from "react-router-dom";
import {getToken, getUser} from "../utils/Common";
import Requests from "../utils/requests";
import {Button} from "@skbkontur/react-ui";

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.requests = new Requests();
        this.state = {
            isEditing: false,
            email: "",
            first_name: "",
            last_name: "",
            patronymic: "",
            username: ""
        }
        this.changeEditing = this.changeEditing.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.changeProfile = this.changeProfile.bind(this)
        this.config = this.config.bind(this)
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
        const { isEditing, ...data } = this.state;
        await this.requests.patch(`${process.env.REACT_APP_URL}/auth/user`, data, this.config())
            .then(resp => {
                this.changeEditing();
            })
    }

    changeProfile(event) {
        this.setState(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value
            }
        })
        console.log(this.state)
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
                console.log(this.state)
            })
    }



    render () {
        const login = this.state.username
        return (
            <div className="profile-parent-box">
                <div className="profile-header">
                    Профиль пользователя {login}
                </div>
                <form onSubmit={this.onSubmit}>
                    <div className="profile-box">
                        <div className="profile-cell">
                            <div>Логин:</div>
                            <div>
                                {/*{this.state.isEditing ?*/}
                                {/*    <input defaultValue={this.state.username} name="username" onChange={this.changeProfile}/> :*/}
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
                    </div>
                {this.state.isEditing && <Button type="submit">Сохранить</Button>}
                </form>
                {!this.state.isEditing && getUser() === this.state.username && <Button onClick={this.changeEditing}>Редактировать</Button>}
            </div>
        )
    }
}

export default withRouter(Account);