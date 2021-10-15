import axios from 'axios';
import React from 'react';
import validator from 'validator';

export default class ApplicationForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
                mail: "",
                groupName: "",
                leaderName: "",
                generalArea: "",
                localArea: "", // уточнение, куда именно пойдут
                routeStartDate: new Date(),
                routeEndDate: new Date(),
                coordinator: "",
                routeBook: null, // file
                routeDifficulty: 0, 
                numberOfParticipants: 0,
                kindOfTourism: "",
                coordinator: "",
                insuranceInfo: ""

        };
        this.onSubmit = this.onSubmit.bind(this);
		this.onRouteBookFileChange = this.onRouteBookFileChange.bind(this);
		this.changeInputRegister = this.changeInputRegister.bind(this);
        
    }

	onRouteBookFileChange(event) {
		this.setState({routeBook: event.target.files[0]})
	}

    onSubmit(event) {
        event.preventDefault();
        // подставить переменные из формы, написать валидации идентичные тем, что на апи 
		const formTrip = new FormData()
		formTrip.append("kind", "ski");
		formTrip.append("group_name", "Лыжи");
		formTrip.append("difficulty_category", 2);
		formTrip.append("district", "Лыжи");
		formTrip.append("start_date", "2001-12-12");
		formTrip.append("end_date", "2001-12-12");
		formTrip.append("coordinator_info", "Лыжи");
		formTrip.append("insurance_info", "Лыжи");
		formTrip.append("leader", 1);
		formTrip.append("participants_count", 5);
		

		axios.post("http://localhost:8000/api/trips",
		formTrip
		).then(respForm => {
			const form = new FormData()
			console.log(respForm)
			form.append("file", this.state.routeBook);
			form.append("trip", parseInt(respForm.data.id))
			axios.post(`http://localhost:8000/api/trips/${respForm.data.id}/documents`,
			form
		)
		})
    }

	changeInputRegister(event) {
        event.persist();
        
        this.setState(prev => {
            return  {
                ...prev,
                [event.target.name]: event.target.value
			}
            
        })
    };

    render() {
        return (
            <div>
                <br />Форма подачи заявки
                <form onSubmit={this.onSubmit}> 
                    <p>Email: <input
                        type="email"
                        id="email"
                        name="mail"
                        value={this.state.mail}
                        onChange={this.changeInputRegister}
                        />
                    </p>
                    <p>Название группы: <input
                        type="text"
                        id="groupName"
                        name="groupName"
                        value={this.state.groupName}
                        onChange={this.changeInputRegister}
                        formNoValidate
                        />
                    </p>
                    <p>ФИО руководителя группы<input
                        type="text"
                        id="leaderName"
                        name="leaderName"
                        value={this.state.leaderName}
                        onChange={this.changeInputRegister}
                        />
                    </p>
                    <p>Общий район<input // комбо-бокс. общий район из справочника выбрать 
                        type="text"
                        id="generalArea"
                        name="generalArea"
                        value={this.state.generalArea}
                        onChange={this.changeInputRegister}
                        />
                    </p>
                    <p>Район <input 
                        type="text"
                        id="localArea"
                        name="localArea"
                        value={this.state.localArea}
                        onChange={this.changeInputRegister}
                        />
                    </p>
                    <p>Дата начала маршрута <input
                        type="date"
                        id="routeStartDate"
                        name="routeStartDate"
                        value={this.state.routeStartDate}
                        onChange={this.changeInputRegister}
                        />
                    </p>
                    <p>Дата выхода с маршрута <input
                        type="date"
                        id="routeEndDate"
                        name="routeEndDate"
                        value={this.state.routeEndDate}
                        onChange={this.changeInputRegister}
                        />
                    </p>
                    <input type="file" name="routeBook" onChange={this.onRouteBookFileChange} />

                    <input type="submit"/>
                </form>
            </div>
        )
    }
}