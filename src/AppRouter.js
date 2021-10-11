import {React, Component } from 'react';
import { withRouter } from "react-router";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  
} from "react-router-dom";
import App from "./App";
import Login from "./Login";

export default function AppRouter() {
  return (
    <Router>
      <div>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/chat">
            <App />
          </Route>
          <Route path="/">
            <HomeWithRouter />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}


class Home extends Component {

  componentDidMount(){
    if(!localStorage.getItem('loggedIn')){
      this.props.history.push('/login')
    }
  }
 
  render() {
    return (
      <div>
        
      </div>
    );
  }
}

const HomeWithRouter = withRouter(Home);


