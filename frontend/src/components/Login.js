import React, { useState } from 'react'
import axios from 'axios';

// Здесь предварительно проверять нет ли jwt в куках, если нет, то логиниться, иначе считаем что ок
export default function Login () {
    const [register, setRegister] = useState(() => {
        return {
            username: "",
            password: "",
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
		const config = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
		};
		axios.post("http://localhost:8000/auth/users/login", {
			user: {
				username: register.username,
				password: register.password
			}
		}, config).then(res => {
			if (res.data) {
				alert('Login complete!');
				window.location.href = "http://localhost:3000"
			} else {
				alert('Login failed! Perhaps password or username contains error');
				alert("There is already a user with this email")
			}
		}).catch(() => {
			alert("An error occurred on the server")
		})
    };

    return (
        <div className="form">
            <h2>Login user:</h2>
            <form onSubmit={submitChackin}>
                <p>Name: <input
                    type="username"
                    id="username"
                    name="username"
                    value={register.username}
                    onChange={changeInputRegister}
                /></p>
                <p>Password: <input
                    type="password"
                    id="password"
                    name="password"
                    value={register.password}
                    onChange={changeInputRegister}
                    /></p>
                <input type="submit"/>
            </form>
        </div>
    )
}
