import React, { Component } from "react";
import Header from "./components/Header";
import MeterChart from "./components/MeterChart";
import AreaGraph from "./components/AreaGraph";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 1,
      avgValue: 0,
      status: '', // To track the status of the stress test
    };
    this.fetchData = this.fetchData.bind(this);
    this.startStressTest = this.startStressTest.bind(this);
    this.stopStressTest = this.stopStressTest.bind(this);
  }

  fetchData() {
    fetch("/api")
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          avgValue: responseJson.data.avg,
          seconds: this.state.seconds + 1,
        });
      });
  }

  startStressTest() {
    fetch("/start-stress-test", { method: 'POST' })
      .then(response => response.json())
      .then(data => this.setState({ status: data.message }))
      .catch(error => console.error('Error starting stress test:', error));
  }

  stopStressTest() {
    fetch("/stop-stress-test", { method: 'POST' })
      .then(response => response.json())
      .then(data => this.setState({ status: data.message }))
      .catch(error => console.error('Error stopping stress test:', error));
  }

  componentDidMount() {
    setInterval(this.fetchData, 1000);
  }

  render() {
    return (
      <div className="container">
        <Header />
        <div className="stress-test-control">
          <button onClick={this.startStressTest}>Start Stress Test</button>
          <button onClick={this.stopStressTest}>Stop Stress Test</button>
          <p>{this.state.status}</p>
        </div>
        <MeterChart avgValue={this.state.avgValue} />
        <AreaGraph
          avgValue={this.state.avgValue}
          seconds={this.state.seconds}
        />
        
      </div>
    );
  }
}

export default App;
