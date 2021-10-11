import React, { Component } from "react";
import { io } from "socket.io-client";
import moment from 'moment'
import ReactStars from "react-rating-stars-component";
import GoogleMapReact from 'google-map-react';
import Header from "./Header";
import { withRouter } from "react-router";

class App extends Component {
  state = {
    isLoggedIn: false,
    author: "",
    socket: null,
    inputValue: "",
    messages: [{
         id:"1",
         command:{
           type:"welcome",
           data:"welcome"
         },
      "type":"command"
    }],
    emitEventType: "message",
    visibility:80
  };
  componentDidMount() {
    // check if user logged in
    const author = localStorage.getItem("username");
    if (author !== null) {
      this.setState({ author });
      this.initSocket();
    }else {
      this.props.history.push('/login')
    }
  }

  generateNewId = () =>{
    return (new Date()).getTime()
  }

  // emit messages to server
  sendMessage = (e) => {
    e.preventDefault();

    // if we want to show user entered message as well
    var messages = this.state.messages;
    if(this.state.emitEventType === "message"){
      messages.push({
        id:this.generateNewId(),
        author: this.state.author,
        message: this.state.inputValue,
        type: "message",
        time:this.getTime()
      });
      this.setState({messages})
    }
    // here we emit an event of name either "message" or "command" depends on the client choice
    this.state.socket.emit(this.state.emitEventType, {
      author: this.state.author,
      message: this.state.inputValue,
    });
  };

  login = (e) => {
    e.preventDefault();
    if (this.state.author !== "") {
      localStorage.setItem("user", this.state.author);
      this.initSocket();
    }
  };


  // declare socket server
  initSocket = () => {
    const socket = io("https://demo-chat-server.on.ag/");
    this.setState({ isLoggedIn: true, socket });
    this.joinChat(socket);
  };

  // connect to socket server and listen to messages
  joinChat = (socket) => {
    socket.connect(true);
    socket.emit('join', this.state.author);
    // listen on event of name "message" or "command"
    socket.on("message", (msg) => {
      var messages = this.state.messages;
      messages.push({ ...msg, type: "message", time: this.getTime(),id:this.generateNewId() });
      // give a bit of time to display the server message
      setTimeout(() => {
        this.setState({
          messages,
          inputValue: "",
        });
        this.scrollChatToBottom();
      }, 300);

    });
    socket.on("command", (msg) => {
      var messages = this.state.messages;
      messages.push({ ...msg, type: "command", time: this.getTime(),id:this.generateNewId() });
      setTimeout(() => {
        this.setState({
          messages,
        });
        this.scrollChatToBottom();
      }, 300);
  
    });
  };

  getTime = () => {
        // get time in format of hh:mm a/pm
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
      
  };
  scrollChatToBottom = () => {
    // scroll to the bottom of the chat widget whenever new message appear
    var objDiv = document.getElementById("chat-body");
    objDiv.scrollTop = objDiv.scrollHeight * 2000;
    document.getElementById("chat-body").scrollIntoView(false);
  };

  chatWidget = () => {
      return (
        <div>
          <div className="chat-body" id="chat-body">
            {/* <div className="user-header-name">
            {" "}
            hi {this.state.author}. Welcome to Ottonovaa chat bot
            </div>
          <hr /> */}
            {this.state.messages.map((message, i) => {
              if (message.type === "message") {
                return (
                  <div         className={
                    message.author === "ottonova bot"
                      ? "bot-message"
                      : "client"
                  }>
                  <div
                    key={i}
                    className="message-body"
            
                  >
                    <div className="author-header">
                      <div className="message-author-name">{message.author}</div>
                      <div className="message-time">{message.time}</div>
                    </div>
                    <p>{"      " + message.message}</p>
                  </div>
                  </div>
                );
              } else {
                return <div>{this.commandWidget(message)}</div>;
              }
            })}
          </div>
          <form>
            <div className="chat-footer">
              {this.state.emitEventType === "message" ? (
                <div className="message-input-wrapper">
                  <input
                  placeholder="Type your message..."
                  value={this.state.inputValue}
                  onChange={(e) =>
                    this.setState({ inputValue: e.target.value })
                  }
                ></input>
                  </div>

              ) : null}
              <button className="primary btn-send" type="submit" onClick={(e) => this.sendMessage(e)}>
                {this.state.emitEventType === "message"
                  ? "Send"
                  : "Try a command"}
              </button>
            </div>
          </form>
        </div>
      );
    
  };

  // switch for widget type and display its corresponding component
  commandWidget = (message) => {
    const commandType = message.command.type;
    const data = message.command.data;
    switch (commandType) {
      case "date":
        return this.dateWidget(data,message.id);
      case "map":
        return this.mapWidget(data);
      case "rate":
        return this.rateWidget(data,message.id);
      case "complete":
        return this.completeWidget(data,message.id);
      case "welcome":
          return this.welcomeMessage(data);
      default:
        return <div>{commandType}</div>;
    }
  };

  welcomeMessage = () =>{
    return (
      <div className="welcome-message">How can I help you ?</div>
    )
  }
  dateWidget = (data,widgetId) => {
    let dates = [];
    const today = new Date(data)
    for(var i =0;i<=6;i++){
      const date = moment(today).add(i,"days")
      dates.push(date)
    }
    return <div>
      <div className="widget-title">Please pick a date </div>
      <div className="days-picker">

      {dates.map((date,key)=>{
        return <div key={key}>
          <button className="actions" onClick={e=>this.selectDate(date,widgetId)}>{date.format("dddd")}</button>
        </div>
      })}
      </div>
    </div>;
  };

   selectDate = (date,widgetId)=>{
    this.state.socket.emit("message",{
      author:this.state.author,
      message:date.format("LLL")
    })
    this.removeWidget(widgetId)
  }

  renderMarkers(map, maps,data) {
    return new maps.Marker({
      position: data,
      map,
      title: 'Hello World!'
    });
  }

  mapWidget = (data) => {
    return <div className="mapWidget"> 
    <div  className="widget-title">This is our location</div>
         <div style={{ height: '200px', width: '100%' }}>
    <GoogleMapReact
      bootstrapURLKeys={{ key:"AIzaSyClw9Fp6y-wpzYJGSCK6k4cX14WEFkBQp0" }}
      defaultCenter={data}
      defaultZoom={11}
      onGoogleApiLoaded={({map, maps}) => this.renderMarkers(map, maps,data)}
    >
    </GoogleMapReact>
  </div></div>;
  };
  rateWidget = (data,widgetId) => {
    let rates = [];
    for(var i=data[0];i<=data[1];i++){
      rates.push(i)
    }
    return <div className="ratings-widget">
      <div  className="widget-title">Please rate the conversation :</div>
      <div>

        <ReactStars
    count={rates.length}
    onChange={rating=>this.ratingChanged(rating,widgetId)}
    size={24}
    activeColor="#ffd700"

    />,
    </div>
    </div>;
  };

   ratingChanged = (newRating,widgetId) => {
    this.state.socket.emit("message",{
      author:this.state.author,
      message:newRating
    })
    this.removeWidget(widgetId)
  };
  removeWidget = (widgetId) =>{
    var messages = this.state.messages;
    messages = messages.filter(m=> m.id!== widgetId);
    this.setState({messages})
  }

  completeWidget = (data,widgetId) => {
    return (
      <div className="complete-widget">

      <div>
        <div  className="widget-title">Close the conversation ?</div>
        {data.map((el, i) => {
          return (
            <button className="actions" key={i} onClick={() => this.closeConversation(el,widgetId)}>
              {el}
            </button>
          );
        })}
        </div>
      </div>
    );
  };
  closeConversation = (el,widgetId) => {
    this.state.socket.emit("message",{
      author: this.state.author,
      message: el,
    })

    if (el === "Yes") {
      this.close()
    }
    this.removeWidget(widgetId)
  };

  close = ()=>{
    this.setState({
      visibility:"hidden"

    })
  }

  show = ()=>{
    this.setState({
      visibility:"visible"

    })
  }

  render() {
    return (
      <div className="page">
        <Header />
            <div className="show" onClick={this.show}>&#9993;</div>
        <div className="chat-container"style={{"visibility":this.state.visibility}}>
          <div className="chat-header">
            <div className="close-icon" onClick={this.close}>X</div>


            <div>
              <button
                onClick={() => this.setState({ emitEventType: "message" })}
                className={this.state.emitEventType === "message" ? "secondary active" : "secondary"}
              >
                Message
              </button>
              <button
                onClick={() => this.setState({ emitEventType: "command" })}
                className={this.state.emitEventType === "command" ? "secondary active" : "secondary"}
              >
                Command
              </button>
            </div>
          </div>
          {this.chatWidget()}
        </div>
      </div>
    );
  }
}

export default withRouter(App);
