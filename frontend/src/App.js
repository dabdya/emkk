import React from 'react';

class App extends React.Component {

	async componentDidMount() {
		const gg = await fetch("http://127.0.0.1:8000/rand/");
		await gg.json();
	  }
	render() {
		return <h1>Привет</h1>;
	}
}

export default App;
