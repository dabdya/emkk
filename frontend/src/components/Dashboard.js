import React from 'react';
import { getUser, removeUserSession } from '../utils/Common';


export default class Dashboard extends React.Component {

	constructor(props){
		super(props);
		this.user = getUser();
		this.state = {
			error: null,
			isLoaded: false,
			trips: [],
			redirect: false
		  };
    	this.handleLogout = this.handleLogout.bind(this);
	}

	async componentDidMount() {
		await fetch("http://localhost:8000/api/trips")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            trips: result
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        })
	}


  // handle click event of logout button
	handleLogout() {
		removeUserSession();

		this.props.history.push('/login');
	};
  
  render() {
    return (
      <div>
        Welcome {this.user}!<br /><br />
        Здесь находится информация только для авторизованных пользователей <br /> <br/>
        <input type="button" onClick={this.handleLogout} value="Logout" />
		    <ul>
        	{this.state.trips.map(trip => (
          	<li key={trip.id}>
            	{trip.district} {trip.start_apply} {trip.end_apply} {trip.group_name}
          	</li>
        	))}
      	</ul>
      </div>
    );
  }
}