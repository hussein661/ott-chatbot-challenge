import React, { Component } from 'react';
import { withRouter } from "react-router";

class Header extends Component {

    logout = ()=>{
        localStorage.removeItem("username")
        this.props.history.push('/login')
    }
    render() {
        return (
            <div class="nav">
              <div style={{color:"#FF476D",padding:"0 10px",fontWeight:"bold",fontSize:"24px"}}> Hi {localStorage.getItem("username")}</div>
            <ul>

              <li  onClick={this.logout}><a href="#" class="nav-link" >LOGOUT Now</a></li>
            </ul>
          </div>
        );
    }
}

export default withRouter(Header);