import React, { Component } from 'react';
import axios from 'axios';
import download from 'downloadjs';

class App extends Component {

  state = {
    usernameInput: null,
    passwordInput: null,
    newUserInput: null,
    newPasswordInput: null,
    newPasswordConfirmInput: null,
    user: null,
    userID: null,	// TASK: how do I keep this hidden?
    loggedIn: false,
    fileName: null,
    fileData: null,
    fileRecordsArray: []
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
    if (event) {
      this.setState({fileName: event.target.files[0].name})
      this.setState({fileData: event.target.files[0]});
      console.log(`${this.state.fileName} is ready to be submitted: ${this.state.fileData}`);
    }
  }

  uploadFile = (event) => {

	// upload only if logged in 
	// file size < 50 kb (frontend), num of files <= 5 per user (backend)

    // multer + react: https://blog.stvmlbrn.com/2017/12/17/upload-files-using-react-to-node-express-server.html
    event.preventDefault();


    const { user, loggedIn, fileName, fileData } = this.state; 

    console.log("user: ", user);
    console.log("loggedIn: ", loggedIn);
    console.log("file name: ", fileName);
    console.log("fileData: ", fileData);

    // check for file data upon submitting
    if (!fileData) {
    	console.log("please add a file before submitting");
    	alert("please add a file before submitting");
    	return // return to terminate function
    }
	    
	// allow upload only if logged in
    if (loggedIn) {

    	// file validation: file size < 500 kb
    	const fileSize = fileData.size;
    	const fileSizeLimit = 500000;	// bytes; fileSizeLimit/1000 = kilobytes

    	if (fileSize < fileSizeLimit) {
		    // instantiate react form object to hold file data
		    const formDataObj = new FormData();

		  	// TASK: backend user logged_in: true ? 
		  	formDataObj.append("user", user);
		    formDataObj.append("fileName", fileName);
		    formDataObj.append("fileData", fileData);

		    //axios.post("/api/uploadFile", formDataObj)
    		axios.post("http://localhost:3001/api/uploadFileGridFS", formDataObj)
		            .then(response => response.data)	// TASK: if response obj success is true, then add pretty file name to list display (or just retrieve all names from componentWillMount because setState below refreshes component  state?)
		            .then(data => {
		            	if (data.success) {
                    console.log("data:", data);
		            		this.setState({fileRecordsArray: [...this.state.fileRecordsArray, {fileName: data.file_name, fileId: data.file_id}]}); // use spread operator to create a new array instead of mutating old one
		            	} else {
		            		console.log("error: trouble uploading your file");
		            	}
		            })
		            .catch(error => console.log("upload file error:", error));
		} else {
			console.log(`the size of ${fileName} is too large at ${fileSize}; max size is ${fileSizeLimit} bytes`);
			alert(`the size of ${fileName} is too large at ${fileSize/1000} kilobytes; max size is ${fileSizeLimit/1000} kilobytes`);
		}

    } else {
		  console.log("you must be logged in to upload file");
    }
  }

  register = (event) => {
    event.preventDefault();

    const username = this.state.newUserInput;
    const newP = this.state.newPasswordInput;
    const newPC = this.state.newPasswordConfirmInput;
    console.log("new username input:", username);
    console.log("new password input:", newP);
    console.log("new password confirm input:", newPC);

    // axios.post("/api/register", {
    axios.post("http://localhost:3001/api/register", {      
            user: username,
            password: newP,
            passwordConfirm: newPC
        })
        .then(response => response.data)
        .then(data => {
          if (data.success) {
            console.log("new user registered!");
            // log in after registration
            this.setState({user: username}, console.log("set state user", this.state.user));
            this.setState({newPasswordInput: newP}, console.log("set new pass input", this.state.newPasswordInput));
            this.setState({newPasswordConfirmInput: newPC}, console.log("set new pass confirm input", this.state.newPasswordConfirmInput));
            this.setState({loggedIn: true}, console.log("logged in status", this.state.loggedIn));

          } else {      
            console.log("registration failed");
            console.log(data.error);
          }
        })
        .catch(err => console.log("registration error:", err));

  }

  login = (event) => {
  	event.preventDefault();

  	const username = this.state.usernameInput;
    const password = this.state.passwordInput;
  	console.log("submitted username: ", username);
    console.log("submitted password: ", password);
	
  	axios.post("http://localhost:3001/api/login", { 
  				user: username,
          		password: password
  			})
  			.then(response => response.data)
  			.then(data => {
          		//console.log("data obj:", data);
  				if (data.success) {
  					// change app state 
  					this.setState({user: username})
  					this.setState({loggedIn: true})
  					this.setState({fileRecordsArray: data.fileRecordsArray})
        			console.log("set state user:", this.state.user);
        			console.log("set state logged in status:", this.state.loggedIn);
        			console.log("set state user's file records:", this.state.fileRecordsArray);
  				} else {
          			// user is not registered
          			// display message
          			console.log(data.error);
        		};
  			})
  			.catch(error => console.log("sign in error:", error));
  			

  }

  handleSignOut = () => {
  	
  	this.setState({ user: null });
  	this.setState({ loggedIn: false });
    this.setState({ fileRecordsArray: [] });
  	
  	console.log("signed out user state:", this.state.user);
  	console.log("signed out log in state:", this.state.loggedIn);


  }

  del = (user, fId) => {
    // list item delete 

    console.log("standalone delete function:", user, ",", fId);
    axios.get("http://localhost:3001/api/deleteFileGridFS", {
            params: {
              user: user, 
              fileId: fId
            }
          })
          .then(response => response.data)
          .then(data => {
            if (data.success) {
              console.log("file has been deleted on the backend");
              console.log("data:", data);
              // find file in fileRecordsArray using data.file_id, then delete
              
              var oldArray = this.state.fileRecordsArray;

              // returns new array with files not matching id of file to be deleted
              var newArray = oldArray.filter(record => record.fileId !== data.file_id)

              console.log("newArray:", newArray);
              
              // set new state of fileRecordsArray
              this.setState({fileRecordsArray: newArray}) 
            }
          })
            .catch(err => console.log("error with delete request:", err));
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
          <List fileRecordsArray={ this.state.fileRecordsArray } user={ this.state.user } del= { this.del }/>  
        </div>


        <form onSubmit={this.login}>

        	<input type="text" style={{ width: "300px" }} placeholder="type username" name="username" onChange= {event=>this.setState({usernameInput: event.target.value})} />
          <input type="text" style={{ width: "300px" }} placeholder="type password" name="password" onChange= {event=>this.setState({passwordInput: event.target.value})} />

        	<button type="submit">
        		SIGN IN 
        	</button>
        </form>

        <p onClick={this.handleSignOut}>
        	SIGN OUT 
        </p>



        <form style={{ border: "1px solid blue"}} onSubmit={this.register}>

          <input type="text" style={{ width: "300px" }} placeholder="type new username" name="username" onChange= {event=>this.setState({newUserInput: event.target.value})} />
          <input type="text" style={{ width: "300px" }} placeholder="type new password" name="password" onChange= {event=>this.setState({newPasswordInput: event.target.value})} />
          <input type="text" style={{ width: "300px" }} placeholder="confirm new password" name="passwordConfirm" onChange= {event=>this.setState({newPasswordConfirmInput: event.target.value})} />
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
		let list = this.props.fileRecordsArray.map((file,index)=>{
		  return <Item key={index} fileName={file.fileName} fileId={file.fileId} user={this.props.user} del={this.props.del} />
		});

		return <ul>{list}</ul>; 

  	}

}

class Item extends Component {

  render() {
    
    const user = this.props.user;
    const fileId = this.props.fileId;
    const fileName = this.props.fileName;
    
    return(
    	<div>
    		<li id={ fileId } > { this.props.fileName } </li>
    		<p onClick={ () => { this.props.del(user, fileId) } }> DELETE </p>
        <p onClick={ () => { dLoad(user, fileId, fileName) } }> DOWNLOAD </p>
    	</div>
    )
  }
}

// download file request

async function dLoad(user, fId, fName) {
	console.log("standalone download function:", user, ",", fId, ",", fName);
	
  const reqUrl = `http://localhost:3001/api/downloadFileGridFS?user=${user}&fileId=${fId}&fileName=${fName}`;

  axios(reqUrl, {
    method: 'GET',
    responseType: 'arraybuffer'
  })
  .then((response) => {
    console.log("response content:", response.data)


    var blob = new Blob([response.data], {type: response.headers['content-type']});
    console.log("Blob file:", blob);
    
    download(blob)

    // const fileURL = URL.createObjectURL(blob);
    // console.log("file URL:", fileURL);
    // window.open(fileURL); 
  })
  .catch(error => {
    console.log('download error:', error);
  });

}

export default App;
