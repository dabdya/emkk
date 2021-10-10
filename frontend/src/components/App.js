import React from "react";
import { Trips }  from "./Trips.js";
import Login from "./Login.js";
import Registration from "./Registration.js";

import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";


export default function App() {
	return (
		<Router>
			<div>
				<nav>
					<ul>
						<li>
							<Link to="/trips">Trips</Link>
						</li>
						<li>
							<Link to="/login">Login</Link>
						</li>
						<li>
							<Link to="/registration">Registration</Link>
						</li>
					</ul>
				</nav>

				<Switch>
					<Route path="/trips">
						<Trips />
					</Route>

					<Route path="/login">
						<Login />
					</Route>

					<Route path="/registration">
						<Registration />
					</Route>
				</Switch>
			</div>
		</Router>
	);
}















// import React from 'react';

// class App extends React.Component {

// 	constructor(props) {
// 		super(props);
// 		this.state = {};
// 	}

// 	async componentDidMount() {
// 		const gg = await fetch("http://localhost:8000/api/trips");
// 		let json = await gg.json();
// 		console.log(json);
// 		this.setState({j: 'Посмотри в консоль, там пришел джейсончик, пока не знаю как его отрендерить :('});
// 		}

// 	render() {
// 		return <h2>{ this.state.j}</h2>;
// 	}
// }

// export default App;