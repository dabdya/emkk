import React from 'react';

export class Trips extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			trips: []
		  };
	}

	async componentDidMount() {
		fetch("http://localhost:8000/api/trips")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            trips: result
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
		}

	render() {
		if(!this.state.isLoaded){
			return <h2>Ошибка загрузки</h2>;
		} else {
			return ( <ul>
        		{this.state.trips.map(trip => (
          		<li key={trip.id}>
            		{trip.district} {trip.start_apply} {trip.end_apply} {trip.group_name}
          		</li>
        		))}
      		</ul>
			);}
	}
}