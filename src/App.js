import React, { Component } from "react";
import { io } from "socket.io-client";
import moment from 'moment'
import ReactStars from "react-rating-stars-component";
import GoogleMapReact from 'google-map-react';
class App extends Component {
  state = {
    isLoggedIn: false,
    author: "",
    socket: null,
    inputValue: "",
    messages: [],
    emitEventType: "message",
  };
  componentDidMount() {
    const author = localStorage.getItem("user");
    if (author !== null) {
      this.setState({ author });
      this.initSocket();
    }
  }

  sendMessage = (e) => {
    e.preventDefault();

    // if we want to show user entered message as well
    var messages = this.state.messages;
    if(this.state.emitEventType === "message"){
      messages.push({
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

  initSocket = () => {
    const socket = io("https://demo-chat-server.on.ag/");
    this.setState({ isLoggedIn: true, socket });
    this.joinChat(socket);
  };

  joinChat = (socket) => {
    socket.connect(true);
    // listen on event of name "message" or "command"
    socket.on("message", (msg) => {
      var messages = this.state.messages;
      messages.push({ ...msg, type: "message", time: this.getTime() });
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
      messages.push({ ...msg, type: "command", time: this.getTime() });
      setTimeout(() => {
        this.setState({
          messages,
        });
        this.scrollChatToBottom();
      }, 300);
  
    });
  };

  getTime = () => {
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
    var objDiv = document.getElementById("chat-body");
    objDiv.scrollTop = objDiv.scrollHeight * 2000;
    document.getElementById("chat-body").scrollIntoView(false);
  };

  chatWidget = () => {
    if (this.state.isLoggedIn) {
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
    } else {
      return (
        <div>
          <div>Please enter your name</div>
          <form>
            <input
              onChange={(e) => this.setState({ author: e.target.value })}
              value={this.state.author}
            />
            <div>
              <button type="submit" onClick={(e) => this.login(e)}>
                Login
              </button>
            </div>
          </form>
        </div>
      );
    }
  };

  commandWidget = (message) => {
    const commandType = message.command.type;
    const data = message.command.data;
    console.log(data);
    switch (commandType) {
      case "date":
        return this.dateWidget(data);
      case "map":
        return this.mapWidget(data);
      case "rate":
        return this.rateWidget(data);
      case "complete":
        return this.completeWidget(data);
      default:
        return <div>{commandType}</div>;
    }
  };

  dateWidget = (data) => {
    let dates = [];
    const today = new Date(data)
    for(var i =0;i<=6;i++){
      const date = moment(today).add(i,"days")
      dates.push(date)
    }
    return <div>
      <div>Please pick a date </div>
      <div className="days-picker">

      {dates.map((date,key)=>{
        return <div key={key}>
          <button className="actions" onClick={e=>this.state.socket.emit("message",{
            author:this.state.author,
            message:date.format("LLL")
          })}>{date.format("dddd")}</button>
        </div>
      })}
      </div>
    </div>;
  };

  renderMarkers(map, maps,data) {
    return new maps.Marker({
      position: data,
      map,
      title: 'Hello World!'
    });
  }

  mapWidget = (data) => {
    return <div className="mapWidget"> 
    <div>This is our location</div>
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
  rateWidget = (data) => {
    let rates = [];
    for(var i=data[0];i<=data[1];i++){
      rates.push(i)
    }
    return <div className="ratings-widget">
      <div>Please rate the conversation :</div>
      <div>

        <ReactStars
    count={rates.length}
    onChange={this.ratingChanged}
    size={24}
    activeColor="#ffd700"

    />,
    </div>
    </div>;
  };

   ratingChanged = (newRating) => {
    this.state.socket.emit("message",{
      author:this.state.author,
      message:newRating
    })
  };

  completeWidget = (data) => {
    return (
      <div className="complete-widget">

      <div>
        <div>Close the conversation ?</div>
        {data.map((el, i) => {
          return (
            <button className="actions" key={i} onClick={() => this.closeConversation(el)}>
              {el}
            </button>
          );
        })}
        </div>
      </div>
    );
  };
  closeConversation = (el) => {
    this.state.socket.emit("message",{
      author: this.state.author,
      message: el,
    })

    if (el === "Yes") {
      console.log("close conversation");
    } else {
      console.log("Keep going");
    }
  };

  render() {
    return (
      <div className="page">
        <div className="chat-container">
          <div className="chat-header">
            <div>type is {this.state.emitEventType}</div>
            <div>
              <button
                onClick={() => this.setState({ emitEventType: "message" })}
              >
                Message
              </button>
              <button
                onClick={() => this.setState({ emitEventType: "command" })}
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

export default App;
