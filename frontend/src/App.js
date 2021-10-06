import React from 'react';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const gg = await fetch("http://localhost:8000/api/trips");
    let json = await gg.json();
    console.log(json);
    this.setState({j: 'Посмотри в консоль, там пришел джейсончик, пока не знаю как его отрендерить :('});
    }

  render() {
    return <h2>{ this.state.j}</h2>;
  }
}

export default App;