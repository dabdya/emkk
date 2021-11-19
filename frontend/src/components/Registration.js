import React from 'react'
import axios from 'axios';
import validator from 'validator';
import { Button, Center } from '@skbkontur/react-ui';

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
                secondName: ""
            }
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.changeInputRegister = this.changeInputRegister.bind(this);
        this.renderInput = this.renderInput.bind(this);
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

    async onSubmit(event) {
        event.preventDefault();
        if (!validator.isEmail(this.state.register.email)) {
            alert("You did not enter email") // делать не аллертами
        } else if (this.state.register.password !== this.state.register.password2) {
            alert("Repeated password incorrectly") // делать не аллертами
        } else if (!validator.isStrongPassword(this.state.register.password, { minLength: 6, minSymbols: 0, minNumbers: 0, minUppercase: 0 })) {
            alert("Password must consist of one lowercase letter, at least 6 characters") // делать не аллертами
        } else {
            const config = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
            };
            await axios.post(`${process.env.REACT_APP_URL}/auth/users`, {
                user: {
                    username: this.state.register.username,
                    email: this.state.register.email,
                    password: this.state.register.password,
                    first_name: this.state.register.firstName,
                    last_name: this.state.register.secondName
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
                <div style={{ height: "65vh", width: "60vh", border: "0.5px solid gray", borderRadius: 15 }}>
                    <Center>
                        <form onSubmit={this.onSubmit}>
                            {this.renderInput("Логин", "username", "inputField",
                                "username", "username", this.state.register.username, this.changeInputRegister)}
                            {this.renderInput("Email", "email", "inputField",
                                "email", "email", this.state.register.email, this.changeInputRegister)}
                            {this.renderInput("Имя", "firstName", "inputField",
                                "firstName", "firstName", this.state.register.firstName, this.changeInputRegister)}
                            {this.renderInput("Фамилия", "secondName", "inputField",
                                "secondName", "secondName", this.state.register.secondName, this.changeInputRegister)}
                            {this.renderInput("Пароль", "password", "inputField",
                                "password", "password", this.state.register.password, this.changeInputRegister)}
                            {this.renderInput("Повторите пароль", "password", "inputField",
                                "password2", "password2", this.state.register.password2, this.changeInputRegister)}
                            <Center>
                                <Button style={{ marginTop: 20 }} size="large" type="submit">
                                    Зарегистрироваться
                                </Button>
                            </Center>
                        </form>
                        <Center>
                            <h1 style={{ fontSize: 20, color: "gray" }}>ЭМКК</h1>
                        </Center>
                        <Center>
                            <h1 style={{ fontSize: 13, color: "gray" }}>©Электронная Маршрутно-Квалификационная комиссия</h1>
                        </Center>
                    </Center>
                </div>
            </Center>
        )
    }
}
