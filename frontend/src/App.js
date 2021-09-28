import React from 'react';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const gg = await fetch("http://127.0.0.1:8000/rand/");
    let json = await gg.json();
    this.setState({j: json['Можно ли пойти в поход?']});
    }

  render() {
    return <h1>{ this.state.j }</h1>;
  }
}

export default App;