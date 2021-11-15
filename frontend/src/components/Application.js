import React from 'react';
import { Grid, Box } from '@mui/material'
import { KINDOFTOURISM, GLOBALAREA } from '../utils/Constants';
import { ScrollContainer } from '@skbkontur/react-ui'
import Requests from '../utils/requests';
import { getToken } from '../utils/Common';


export default class Application extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentApplication: {
                groupName: "",
                leaderName: "",
                generalArea: "",
                localArea: "",
                participantsNumber: "",
                routeDifficulty: "",
                tourismKind: "",
                routeStartDate: new Date(),
                routeEndDate: new Date(),
                coordinatorName: "",
                coordinatorPhoneNumber: ""
            },
        };
    }

    async componentDidMount() {
        const config = getToken() ? {
            headers: {
                Authorization: 'Token ' + getToken()
            }
        } : {};
        const request = new Requests();
        await request.get(`http://localhost:8000/api/trips/${this.props.location.state}`, config)
            .then(response => {
                this.setState({
                    groupName: response.group_name,
                    leaderName: response.leader,
                    generalArea: response.global_region,
                    localArea: response.local_region,
                    // participantsNumber:
                    routeDifficulty: response.difficulty_category,
                    tourismKind: response.kind,
                    routeStartDate: response.start_date,
                    routeEndDate: response.end_date,
                    // coordinatorName: "",
                    // coordinatorPhoneNumber: ""
                })
            })

    }


    render() {
        return (
            <div>
                <ScrollContainer>
                    <h1 style={{ fontSize: 40 }}>Заявка {this.state.groupName}</h1>
                    <div style={{ marginLeft: 15, height: "300px", width: "700px" }}>
                        <h2 style={{ fontWeight: "normal" }}>Имя руководителя: {this.state.leaderName}</h2>
                        <h2 style={{ fontWeight: "normal" }}>Общий район: {this.state.generalArea}</h2>
                        <h2 style={{ fontWeight: "normal" }}>Локальный район: {this.state.localArea}</h2>
                        <h2 style={{ fontWeight: "normal" }}>Число участников: 4</h2>
                        <h2 style={{ fontWeight: "normal" }}>Сложность маршрута: {this.state.routeDifficulty}</h2>
                        <h2 style={{ fontWeight: "normal" }}>Вид туризма: {KINDOFTOURISM[this.state.tourismKind]}</h2>
                        <h2 style={{ fontWeight: "normal" }}>Дата начала маршрута: {this.state.leaderName}</h2>
                        <h2 style={{ fontWeight: "normal" }}>Дата окончания маршрута: {this.state.leaderName}</h2>
                    </div>
                    <div>
                        <hr />
                    </div>
                    <div style={{ marginTop: 15, height: "300px" }}>
                        Документы
                    </div>
                    <div>
                        <hr />
                    </div>
                    <div style={{ marginTop: 15, height: "500px" }}>
                        Рецензии
                    </div>
                </ScrollContainer>
            </div>
        )
    }
}