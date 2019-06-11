import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {

  state = {
    usernameInput: null,
    passwordInput: null,
    newUserInput: null,
    newPasswordInput: null,
    user: null,
    loggedIn: null,
    fileName: null,
    fileData: null,
    fileNamesArray: []
  };

  //componentWillMount() {
    // TASK: load list of file names for specific signed in user when List component mounts
    // grab list of pretty file names from user record
    /*
    axios.get("http://localhost:3001/api/uploadFile")
    		.then((response) => {

    			this.setState(fileNamesArray: ...//response);
    		})
    		.catch((error) => {console.log("error: ", error)};
	*/
  //}

  //componentUnmount() {
  	// clear data?
  //}

  storeFile = (event) => {
  	let file = event.target.files[0];
  	this.setState({fileData: file});
  }

  handleFileUpload = (event) => {
    event.preventDefault();
    this.setState({fileName: event.target.files[0].name})
    this.setState({fileData: event.target.files[0]});
  }

  uploadFile = (event) => {
    // check if file is valid
    // valid: smaller than x size, fewer than y files in user list
    // send object of username, file name, file data to db
    // only show file in front end if post was successful

    // user log-in authentication (maybe have page of validation)
    // if logged in, then submit data 
    // isLoggedIn()?
    // const userId = grabUserId();


    // multer + react: https://blog.stvmlbrn.com/2017/12/17/upload-files-using-react-to-node-express-server.html
    event.preventDefault();
    const { fileName, fileData } = this.state; 

    console.log("file name: ", fileName);
    console.log("fileData: ", fileData);
    
    const formDataObj = new FormData();

  	//user_id: userId,
  	//logged_in: true,
    formDataObj.append("fileName", fileName);
    formDataObj.append("fileData", fileData);

    axios.post("http://localhost:3001/api/uploadFile", formDataObj) // TASK: {user, file name, file data}; send username data as well
            .then(response => console.log("RESPONSE:", response))	// TASK: if response obj success is true, then add pretty file name to list display (or just retrieve all names from componentWillMount because setState below refreshes component  state?)
            .catch((error) => {console.log("upload file error:", error)});

    // .then()
    this.setState({fileNamesArray: [...this.state.fileNamesArray, this.state.fileName]}); // set state to change state, use spread operator to create a new array instead of mutating old one
    //console.log("files array: ", this.state.fileNamesArray);

    // should assign file's unique id to key
  }


  register = (event) => {
    event.preventDefault();

    const username = this.state.newUserInput;
    console.log("new username input:", username);

    axios.post("http://localhost:3001/api/register", {
            user: username
        })
        .then(response => response.data)
        .then(data => {
          if (data.success === true) {
            console.log("new user registered!");
            // log in after registration
            this.setState({user: username})
            this.setState({loggedIn: true})
            console.log("set state user:", this.state.user);
            console.log("set state logged in status:", this.state.loggedIn);
          } else {
            console.log("registration failed");
          }
        })
        .catch(err => console.log("registration error:", err));

  }

  signIn = (event) => {
  	event.preventDefault();

  	const username = this.state.usernameInput;
  	console.log("submitted username: ", username);

	
  	axios.post("http://localhost:3001/api/signIn/", { 
  				user: username
  			})
  			.then(response => response.data)
  			.then(data => {
          		//console.log("data obj:", data);
  				if (data.success === true) {
  					// change app state 
  					this.setState({user: username})
  					this.setState({loggedIn: true})
            		console.log("set state user:", this.state.user);
            		console.log("set state logged in status:", this.state.loggedIn);
  				} else {
            		// user is not registered
            		// display message
            		console.log("you are not a registered user");
          		};
  			})
  			.catch(error => console.log("sign in error:", error));
  			

  }


  render() {

    return (
      <div>
        <form onSubmit={this.uploadFile}>

          <input type="file" style={{ width: "300px" }} placeholder="upload file" name="fileData" onChange= {this.handleFileUpload} />

          <button type="submit">
              submit file
          </button>

        </form>


        <div id="fileName">
          Filename: {this.state.fileName}
        </div>

        <div id="listContainer" style={{ width: "300px", height: "500px", border: "1px solid black" }}>
          <List fileNamesArray={this.state.fileNamesArray} />  
        </div>


        <form onSubmit={this.signIn}>

        	<input type="text" style={{ width: "300px" }} placeholder="type username" name="username" onChange= {event=>this.setState({usernameInput: event.target.value})} />


        	<button type="submit">
        		SIGN IN 
        	</button>
        </form>



        <form onSubmit={this.register}>

          <input type="text" style={{ width: "300px" }} placeholder="type new username" name="username" onChange= {event=>this.setState({newUserInput: event.target.value})} />


          <button type="submit">
            REGISTER 
          </button>
        </form>

      </div>
    );
  }
}

class List extends Component {
  render() {
    let list = this.props.fileNamesArray.map((file,index)=>{
      return <Item key={index} fileName={file} />
    });

    return <ul>{list}</ul>; 
    
  }

}

class Item extends Component {
  render() {
    return(
      <li>{this.props.fileName}</li>
    )
  }
}


export default App;
