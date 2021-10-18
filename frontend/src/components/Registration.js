import React, { useState } from 'react'
import axios from 'axios';
import validator from 'validator';

// Здесь после успешной регистрации отадется jwt пользователя, нужно его сохранить в куки
export default class Registration extends React.Component {

    constructor(props){
        super(props);

        this.state = 
            {register: 
                {
                    username: "",
                    email: "",
                    password: "",
                    password2: "",
                    first_name: "",
                    last_name: ""
                }
            };
        this.onSubmit = this.onSubmit.bind(this);
        this.changeInputRegister = this.changeInputRegister.bind(this);
    }

    changeInputRegister(event) {
        event.persist();
        
        this.setState(prev => {
            return { register:{
                ...prev.register,
                [event.target.name]: event.target.value}
            }
        })
    };

    onSubmit (event){
        event.preventDefault();
        if(!validator.isEmail(this.state.register.email)) {
            alert("You did not enter email") // делать не аллертами
        } else if(this.state.register.password !== this.state.register.password2) {
            alert("Repeated password incorrectly") // делать не аллертами
        } else if(!validator.isStrongPassword(this.state.register.password, {minSymbols: 0})) {
            alert("Password must consist of one lowercase, uppercase letter and number, at least 8 characters") // делать не аллертами
        } else {
            const config = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
            };
            axios.post("http://localhost:8000/auth/users", {
                user: {
                    username: this.state.register.username,
                    email: this.state.register.email,
                    password: this.state.register.password,
                    first_name: this.state.register.first_name,
                    last_name: this.state.register.last_name
                }
            }, config).then(res => {
                if (res.data) {
                    alert('Registration complete!'); // делать не аллертами
                    this.props.history.push("/login"); // можно автоматически задать поля в логин-форме после регистрации.
                } else {
                    alert("There is already a user with this email") // делать не аллертами
                }
            }).catch(() => {
                alert("An error occurred on the server") // делать не аллертами
            })
        }
    };

    render() {
        return (
        <div className="form">
            <h1>Registration:</h1>
            <form onSubmit={this.onSubmit}>
                <p>Name: <input
                    type="username"
                    id="username"
                    name="username"
                    value={this.state.register.username}
                    onChange={this.changeInputRegister}
                /></p>
                <p>Email: <input
                    type="email"
                    id="email"
                    name="email"
                    value={this.state.register.email}
                    onChange={this.changeInputRegister}
                    formNoValidate
                /></p>
                <p>First name: <input
                    type="first_name"
                    id="first_name"
                    name="first_name"
                    value={this.state.register.first_name}
                    onChange={this.changeInputRegister}
                /></p>
                <p>Last name: <input
                    type="last_name"
                    id="last_name"
                    name="last_name"
                    value={this.state.register.last_name}
                    onChange={this.changeInputRegister}
                /></p>
                <p>Password: <input
                    type="password"
                    id="password"
                    name="password"
                    value={this.state.register.password}
                    onChange={this.changeInputRegister}
                    /></p>
                <p>Repeat password: <input
                    type="password"
                    id="password2"
                    name="password2"
                    value={this.state.register.password2}
                    onChange={this.changeInputRegister}
                /></p>
                <input type="submit"/>
            </form>
        </div>
    )
}
}
