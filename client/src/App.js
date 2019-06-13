import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {

  state = {
    usernameInput: null,
    passwordInput: null,
    newUserInput: null,
    newPasswordInput: null,
    user: null,
    userID: null,	// TASK: how do I keep this hidden?
    loggedIn: false,
    fileName: null,
    fileData: null,
    fileNamesArray: []
  };

  //componentWillMount() {
  //}

  //componentUnmount() {
    //TASK: clear data upon sign out?
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


    const { user, loggedIn, fileName, fileData } = this.state; 

    console.log("user: ", user);
    console.log("loggedIn: ", loggedIn);
    console.log("file name: ", fileName);
    console.log("fileData: ", fileData);
	    
    if (loggedIn) {

	    // instantiate react form object to hold file data
	    const formDataObj = new FormData();

	  	// TASK: logged_in: true,
	  	formDataObj.append("user", user);
	    formDataObj.append("fileName", fileName);
	    formDataObj.append("fileData", fileData);

	    axios.post("http://localhost:3001/api/uploadFile", formDataObj)
	            .then(response => response.data)	// TASK: if response obj success is true, then add pretty file name to list display (or just retrieve all names from componentWillMount because setState below refreshes component  state?)
	            .then(data => {
	            	if (data.success) {
	            		this.setState({fileNamesArray: [...this.state.fileNamesArray, this.state.fileName]}); // use spread operator to create a new array instead of mutating old one
	            	} else {
	            		console.log("error: trouble uploading your file");
	            	}
	            })
	            .catch(error => console.log("upload file error:", error));

    } else {
		  console.log("you must be logged in to upload file");
    }
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
          if (data.success) {
            console.log("new user registered!");
            // log in after registration
            this.setState({user: username})
            this.setState({loggedIn: true})
            // this.setState({fileNamesArray: data.file})
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
  				if (data.success) {
  					// change app state 
  					this.setState({user: username})
  					this.setState({loggedIn: true})
  					this.setState({fileNamesArray: data.fileNamesArray})
            		console.log("set state user:", this.state.user);
            		console.log("set state logged in status:", this.state.loggedIn);
            		console.log("set state user's file names:", this.state.fileNamesArray);
  				} else {
            		// user is not registered
            		// display message
            		console.log("you are not a registered user");
          		};
  			})
  			.catch(error => console.log("sign in error:", error));
  			

  }

  handleSignOut = async () => {
  	
  	this.setState({ user: null });
  	this.setState({ loggedIn: false });
  	
  	console.log("signed out user state:", this.state.user);
  	console.log("signed out log in state:", this.state.loggedIn);


  }


  render() {

  	// conditionally show upload file field only if logged in
  	const isLoggedIn = this.state.loggedIn;
  	let uploadFileField;

  	if (isLoggedIn) {
  		uploadFileField = <UploadFileForm uploadFile={this.uploadFile} handleFileUpload={this.handleFileUpload} />;

  	} else {
  		uploadFileField = null;
  	}

    return (
      <div>
        
        {uploadFileField}

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

        <p onClick={this.handleSignOut}>
        	SIGN OUT 
        </p>



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

class UploadFileForm extends Component {
	render() {
		return(
        <form onSubmit={this.props.uploadFile}>

          <input type="file" style={{ width: "300px" }} placeholder="upload file" name="fileData" onChange={this.props.handleFileUpload} />

          <button type="submit">
              submit file
          </button>

        </form>
	    )
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
