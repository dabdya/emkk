import React, { useState } from 'react'
import axios from 'axios';
import validator from 'validator';

// Здесь после успешной регистрации отадется jwt пользователя, нужно его сохранить в куки
export default function Register () {
    const [register, setRegister] = useState(() => {
        return {
            username: "",
            email: "",
            password: "",
            password2: "",
            first_name: "",
            second_name: ""
        }
    });

    const changeInputRegister = event => {
        event.persist();
        setRegister(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value,
            }
        })
    };

    const submitChackin = event => {
        event.preventDefault();
        if(!validator.isEmail(register.email)) {
            alert("You did not enter email")
        } else if(register.password !== register.password2) {
            alert("Repeated password incorrectly")
        } else if(!validator.isStrongPassword(register.password, {minSymbols: 0})) {
            alert("Password must consist of one lowercase, uppercase letter and number, at least 8 characters")
        } else {
            const config = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
            };
            axios.post("http://localhost:8000/auth/users", {
                user: {
                    username: register.username,
                    email: register.email,
                    password: register.password,
                    first_name: register.first_name,
                    second_name: register.second_name
                }
            }, config).then(res => {
                if (res.data) {
                    alert('Registration complete!')
                    window.location.href = "http://localhost:3000"
                } else {
                    alert("There is already a user with this email")
                }
            }).catch(() => {
                alert("An error occurred on the server")
            })
        }
    };

    return (
        <div className="form">
            <h2>Register user:</h2>
            <form onSubmit={submitChackin}>
                <p>Name: <input
                    type="username"
                    id="username"
                    name="username"
                    value={register.username}
                    onChange={changeInputRegister}
                /></p>
                <p>Email: <input
                    type="email"
                    id="email"
                    name="email"
                    value={register.email}
                    onChange={changeInputRegister}
                    formNoValidate
                /></p>
                <p>First name: <input
                    type="first_name"
                    id="first_name"
                    name="first_name"
                    value={register.first_name}
                    onChange={changeInputRegister}
                /></p>
                <p>Second name: <input
                    type="second_name"
                    id="second_name"
                    name="second_name"
                    value={register.second_name}
                    onChange={changeInputRegister}
                /></p>
                <p>Password: <input
                    type="password"
                    id="password"
                    name="password"
                    value={register.password}
                    onChange={changeInputRegister}
                    /></p>
                <p>Repeat password: <input
                    type="password"
                    id="password2"
                    name="password2"
                    value={register.password2}
                    onChange={changeInputRegister}
                /></p>
                <input type="submit"/>
            </form>
        </div>
    )
}
