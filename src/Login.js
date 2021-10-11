import React, { Component } from "react";
import { withRouter } from "react-router";

class Login extends Component {
    state = {
        username:"",
        password:""
    }

    submitForm = (e)=>{
        e.preventDefault()
        localStorage.setItem("username",this.state.username)
        this.props.history.push('/chat')

    }
  render() {
    return (
      <div>
        <div class="login">
          <h1>Ottonova ChatBot</h1>
          <form className="loginForm" onSubmit={this.submitForm}>
            <input class="one" type="text"  placeholder="Enter a Username..." value={this.state.username}  onChange={e=>this.setState({username:e.target.value})}/>
            <input
            autoComplete="new-password"
              class="two"
              type="password"
              placeholder="Enter Password..."
              minlenght="8"
              value={this.state.password} 
                            onChange={e=>this.setState({password:e.target.value})}
            />
            <button type="submit" class="btn"   style={{ color: 'white',fontWeight:"bold" }}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default  withRouter(Login);
