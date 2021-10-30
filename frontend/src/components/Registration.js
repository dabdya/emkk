import React from 'react'
import axios from 'axios';
import validator from 'validator';
import { Button, Center, Input, Gapped, Link } from '@skbkontur/react-ui';

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
                <div className="form" style={{ width: '500px', height: '550px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '0.5px solid gray', borderRadius: '15px'}}>
                    <Center style={{ height: '91vh' }}>
                        <div style={{height:145, width: 300, marginLeft: '40px'}}>
                            <h1 style={{marginLeft:'80px', fontSize: 25, color:"#0a77ac"}}>EMKK</h1>
                            <span style={{fontSize: 18, color:"#0a77ac"}}>Электронная маршрутно-квалификационная комиссия</span>
						</div>
                        <div style={{marginTop: "-60px"}}>
                            <form style={{marginLeft: "25px"}} onSubmit={this.onSubmit}>
                                {this.renderInput("Логин", "username", "inputField", "username", "username", this.state.register.username, this.changeInputRegister)}
                                {this.renderInput("Email", "email", "inputField", "email", "email", this.state.register.email, this.changeInputRegister)}
                                {this.renderInput("Имя", "firstName", "inputField", "firstName", "firstName", this.state.register.firstName, this.changeInputRegister)}
                                {this.renderInput("Фамилия", "secondName", "inputField", "secondName", "secondName", this.state.register.secondName, this.changeInputRegister)}
                                {this.renderInput("Пароль", "password", "inputField", "password", "password", this.state.register.password, this.changeInputRegister)}
                                {this.renderInput("Повторите пароль", "password", "inputField", "password2", "password2", this.state.register.password2, this.changeInputRegister)}
                                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <Button style={{height: "100px", width: "200px", marginTop:"20px", marginRight:"30px"}} type="submit">Зарегистрироваться</Button>
                                </div>
                            </form>
                        </div>
                    </Center>
                </div>
            </Center>
        )
}
}
