import React, { Component } from 'react';
import axios from 'axios';
import download from 'downloadjs';
import "./styles.css" // import CSS stylesheet

class App extends Component {

  state = {
    user: null,
    loggedIn: false,
    fileData: null,
    fileName: null,
    fileRecordsArray: []
  };

  //componentWillMount() {
    // if loggedIn, fetch user data for most updated list? do we need to update fileRecordsArray when uploading file if I do this?
  //}

  //componentUnmount() {
    //TASK: clear data upon sign out?
    // if (!loggedIn) set all states to null or false

  //}

  handleRegisterModule = (username, success) => {

  	console.log("handleRegisterModule:");
    console.log("new username input:", username);

    if (success) {
    	// log in if successfull registered
    	this.setState({ loggedIn: true });
    	this.setState({ user: username });
    } else {
    	this.setState({ loggedIn: false });
    }
  }

  handleLoginModule = (username, fileRecordsArray, success) => {

    console.log("handleLoginModule username: ", username);
    console.log("handleLoginModule fileRecordsArray:", fileRecordsArray);

    if (success) {
    	this.setState({ loggedIn: true });
    	this.setState({ user: username });
    	this.setState({ fileRecordsArray: fileRecordsArray });
    } else {
    	this.setState({ loggedIn: false });
    }
    
  }

  handleSignOut = () => {
  	
  	this.setState({ user: null });
  	this.setState({ loggedIn: false });
    this.setState({ fileRecordsArray: [] });
  	
  	console.log("signed out user state:", this.state.user);
  	console.log("signed out log in state:", this.state.loggedIn);

  }

  handleFileUploadComponent = (fData, success) => {

    if (success) {
      // update fileRecordsArray
      this.setState({fileName: fData.file_name});
      this.setState({fileRecordsArray: [...this.state.fileRecordsArray, {fileName: fData.file_name, fileId: fData.file_id}]}, () => console.log("fileRecordsArray:", this.state.fileRecordsArray)); // use spread operator to create a new array instead of mutating old one
    }

  }

  handleFileRecordsUpdate = (updatedFileRecordsArray) => {

    this.setState({ fileRecordsArray: updatedFileRecordsArray }, () => console.log("updated fileRecordsArray: ", this.state.fileRecordsArray));

  }

  render() {


    return (
      <div>
        
        <NaviBar user={this.state.user} loggedIn={this.state.loggedIn} handleLoginModule={this.handleLoginModule} handleRegisterModule={this.handleRegisterModule} handleSignOut={this.handleSignOut} />

        <UploadFileControl {...this.state} handleFileUploadComponent={this.handleFileUploadComponent} />

        <ListContainer { ...this.state } handleFileRecordsUpdate={ this.handleFileRecordsUpdate } />

        
        
      </div>
    );
  }
}

class ListContainer extends Component {

	state = {
		filteredFileRecordsArray: null
	}

	handleSearchFilter = (updatedArray) => {
		this.setState({ filteredFileRecordsArray: updatedArray });
	}

  render() {

	// loads fileRecordsArray from App component if filtered array (shallow) from SearchFilter component doesn't exist
	var filteredFileRecordsArray;

	if (this.state.filteredFileRecordsArray) {
		filteredFileRecordsArray = this.state.filteredFileRecordsArray;
	} else {
		filteredFileRecordsArray = this.props.fileRecordsArray;
	}

    return(

		<div id="list-container" style={{ width: "300px", height: "500px", border: "1px solid black" }}>
    		<SearchFilter { ...this.props } fileRecordsArray= { this.props.fileRecordsArray } handleSearchFilter={ this.handleSearchFilter } />
			
			<List { ...this.props } filteredFileRecordsArray={ filteredFileRecordsArray } />  

		</div>

    )
  }


}

class SearchFilter extends Component {

	// pass filtered file records array to List component

	state = {
		fileInput: '',
		filteredFileRecordsArray: null
	}

	filterResults = (fileName) => {

		console.log('filterResults filename:', fileName);
		console.log('searchfilter filterInput state:', this.state.fileInput);
		console.log('searchfilter unfiltered array:', this.props.fileRecordsArray)

		// filter for files in array that match input filename
		const newArray = this.props.fileRecordsArray.filter((fileItem) => {
				
				const itemName = fileItem.fileName.toLowerCase();
				const f = fileName.toLowerCase();
				// console.log('file item in array:', itemName);

				// return file item whose name has string of fileName being searched 
				return(itemName.indexOf(f) !== -1)
		});	


		this.setState({ filteredFileRecordsArray: newArray }, () => { 
		
				console.log("filter results filteredFileRecordsArray: ", this.state.filteredFileRecordsArray);

				// send filtered array to ListContainer parent component to be sent to List sibling
				this.props.handleSearchFilter(this.state.filteredFileRecordsArray); 
			}
		);

	}

	searchFilter = (event) => {
		
		this.setState({ fileInput: event.target.value }, () => { this.filterResults(this.state.fileInput) });

	}

	render() {

		return(

			<div id="search-filter">
				<input type="text" id="search-filter-input" placeholder="FILE YOU ARE LOOKING FOR" onChange={ this.searchFilter } />
			</div>	
		)
	}

}

class LoginRegisterModule extends Component {
  render() {
    return(
      <>
        <LoginModule handleLoginModule={ this.props.handleLoginModule } />
        <RegisterModule handleRegisterModule={ this.props.handleRegisterModule } />
      </>
    )
  }
}


class LoginModule extends Component {

  state = {
    usernameInput: null,
    passwordInput: null
  }

  login = (event) => {

    event.preventDefault();

    // send POST request to backend
    axios.post("http://localhost:3001/api/login", {
    // axios.post("/api/login", { 
          user: this.state.usernameInput,
          password: this.state.passwordInput
        })
        .then(response => response.data)
        .then(data => {
			if (data.success) {
				// change app state 
				console.log("user:", this.state.usernameInput);
				console.log("user's file records:", data.fileRecordsArray);

				// send data up to App parent component 
				this.props.handleLoginModule(this.state.usernameInput, data.fileRecordsArray, true);

			} else {
				// cannot find user
				console.log(data.error);

				// send data up to App parent component 
				this.props.handleLoginModule(data.user, data.fileRecordsArray, false);
			};
        })
        .catch(error => console.log("sign in error:", error));
    

  }

    render() {
      return(

        <div id="login-module">
          <form onSubmit={this.login}>

            <input type="text" id="login-username" placeholder="type username" name="username" onChange= {event=>this.setState({usernameInput: event.target.value})} />
            <input type="text" id="login-password" placeholder="type password" name="password" onChange= {event=>this.setState({passwordInput: event.target.value})} />

            <button type="submit" className="btn btn-primary">
              SIGN IN 
            </button>

          </form>
        </div>


      )
    }


}

class SignOutButton extends Component {

  render() {
    return(

    	<div id="sign-out-button" onClick={this.props.handleSignOut} >
        	SIGN OUT 
      	</div>
    )
  }
}

class RegisterModule extends Component {

  state = {
    user: null,
    password: null,
    passwordConfirm: null,
    show: false
  };

  register = (event) => {

    event.preventDefault();
    
    // send POST request
    //axios.post("/api/register", {      
    axios.post("http://localhost:3001/api/register", {
            user: this.state.user,
            password: this.state.password,
            passwordConfirm: this.state.passwordConfirm
        })
        .then(response => response.data)
        .then(data => {
          if (data.success) {
            console.log("new user registered!");
            
            // send data back to App component
            this.props.handleRegisterModule(this.state.user, true);


          } else {      
            console.log("registration failed");
            console.log(data.error);

            // send data back to App component
            this.props.handleRegisterModule(null, false);

          }
        })
        .catch(err => console.log("registration error:", err));
  }


  render() {

    return(

    	<div id="register-module-container">
      		<button type="button" id="register-button" onClick={ ()=> this.setState({show: true}) } > Register for an account </button>
			
			<div id="register-module" style={{ display: this.state.show? 'block' : 'none' }}>
				<form style={{ border: "1px solid blue"}} onSubmit={ this.register }>

				<input type="text" style={{ width: "300px" }} placeholder="type new username" name="username" onChange= {event=>this.setState({user: event.target.value})} />
				<input type="text" style={{ width: "300px" }} placeholder="type new password" name="password" onChange= {event=>this.setState({password: event.target.value})} />
				<input type="text" style={{ width: "300px" }} placeholder="confirm new password" name="passwordConfirm" onChange= {event=>this.setState({passwordConfirm: event.target.value})} />
				<button type="submit">
				  REGISTER 
				</button>

				</form>

				<button type="button" id="close-signout-module" onClick={ ()=> this.setState({ show: false })} > CLOSE </button>
			</div>

      	</div>

    )
  }


}


class NaviBar extends Component {

	render() {
		return(

		  <nav id="navibar" class="navbar navbar-expand-md">

        <Logo />
        
		    <NavigationControl user={ this.props.user } loggedIn={ this.props.loggedIn } handleLoginModule={ this.props.handleLoginModule } handleRegisterModule={ this.props.handleRegisterModule } handleSignOut={ this.props.handleSignOut } />

		  </nav>

    )
  }

}

class NavigationControl extends Component {


	render() {

	let showComponent;
	const isLoggedIn = this.props.loggedIn;

	if (isLoggedIn) {
	  showComponent = <UserModule user={ this.props.user } handleSignOut={ this.props.handleSignOut } />
	} else {
	  showComponent = <LoginRegisterModule { ...this.props } />
	}

    return(

    	<div id="navigation-control-container">
    		{ showComponent }
    	</div>
    	);
  }

}

class Logo extends Component {
  render() {
    return(
    
      <a id="logo-container" className="navbar-brand" href="#">
        <p> Mini Fridge </p>
      </a>  
    


    )
  }
}

class UserModule extends Component {
  render() {
    return(
          
      <div>

        <div id="user-greeting"> Hey {this.props.user} </div>
      
        <SignOutButton handleSignOut={this.props.handleSignOut} />

      </div>
      
    )
  }
}

class UploadFileControl extends Component {

  render() {

      let showUploadForm;   
      const isLoggedIn = this.props.loggedIn;
      
      if (isLoggedIn) {
        showUploadForm = <UploadFileForm {...this.props} handleFileUploadComponent={this.props.handleFileUploadComponent} />
      } else {
        showUploadForm = null;
      }

      return(
      	<div id="upload-file-container">

      		{ showUploadForm }

      	</div>

      	);

  }
}

class UploadFileForm extends Component {

	constructor(props) {
		// use constructor so can define file input element
		
		super(props)

		// file size < 500 kb (frontend), num of files <= 5 per user (backend)
		this.state = {
			fileData: null,
			hasFileWaiting: false
		}

		// define DOM objects
		this.fileInputObj = React.createRef();
		this.fileSubmitButton = React.createRef();
	}

	uploadFile = (event) => {

		const fileData = this.state.fileData;
		const fileName = fileData.name;
		const user = this.props.user;
		const loggedIn = this.props.loggedIn;

		// multer + react: https://blog.stvmlbrn.com/2017/12/17/upload-files-using-react-to-node-express-server.html
		event.preventDefault();

		console.log("---UploadFileForm component---");
		console.log("user: ", user);
		console.log("loggedIn: ", loggedIn);
		console.log("file name: ", fileName);
		console.log("fileData: ", fileData);

		// check that file data exists upon submitting
		if (!fileData) {
			console.log("please add a file before submitting");
			alert("please add a file before submitting");
			return // return to terminate function
		}

		// allow upload only if logged in
		if (!loggedIn) {
			console.log("you must be logged in to upload file");
			return // terminate function
		}

		// file validation: file size < 500 kb
		const fileSize = fileData.size;
		const fileSizeLimit = 500000; // bytes; fileSizeLimit/1000 = kilobytes

		// send file data with POST request
		if (fileSize < fileSizeLimit) {
			// instantiate react form object to hold file data
			const formDataObj = new FormData();

			// TASK: backend user logged_in: true ? 
			formDataObj.append("user", user);
			formDataObj.append("fileName", fileName);
			formDataObj.append("fileData", fileData);

			axios.post("http://localhost:3001/api/uploadFileGridFS", formDataObj)
			//axios.post("/api/uploadFileGridFS", formDataObj)
			      .then(response => response.data) 
			      .then(data => {
			        if (data.success) {
			          console.log("data:", data);

			          // send file name back to parent to update fileRecordsArray
			          this.props.handleFileUploadComponent(data, true);

			        } else {
			          console.log("error: trouble uploading your file");
			          this.props.handleFileUploadComponent(null, false);
			        }
			      })
			      .catch(error => console.log("upload file error:", error));
		} else {
			console.log(`the size of ${fileName} is too large at ${fileSize}; max size is ${fileSizeLimit} bytes`);
			alert(`the size of ${fileName} is too large at ${fileSize/1000} kilobytes; max size is ${fileSizeLimit/1000} kilobytes`);
		}

	}

	clickFileInput = (event) => {

		event.preventDefault();

		// grab DOM elements
		const fileInputObj = this.fileInputObj.current;
		const fileSubmitButton = this.fileSubmitButton.current;

		// if no file 
		if (!this.state.hasFileWaiting) {

			// click element
			fileInputObj.click();  	

			this.setState({ hasFileWaiting: true });

		} else {
			// send file

			fileSubmitButton.click();

			this.setState({ hasFileWaiting: false });

		}

		console.log('fileinputobj clicked:', fileInputObj);
	}

	render() {
		return(
			<div id="upload-file-module">

			    <div id="upload-file-control">
			        <button type="button" id="upload-file-button" onClick={ this.clickFileInput } >{this.state.hasFileWaiting? 'SUBMIT FILE':'UPLOAD'}</button>
			        <div id="filename-display">
			        	<p> {this.state.fileData? this.state.fileData.name : " "} </p>
			        </div>
			    </div>

				<div id="upload-file-form">
			        <form onSubmit={this.uploadFile}>

			          <input ref={this.fileInputObj} type="file" id="upload-file-input" placeholder="upload file" name="fileData" onChange={event=>this.setState({fileData: event.target.files[0]})} />

			          <button type="submit" id="submit-file-button" ref={this.fileSubmitButton}>
			              submit file
			          </button>
			        </form>
			    </div>
		        

		    </div>
	    )
	}
}

class List extends Component {

	render() {
		
		let list = this.props.filteredFileRecordsArray.map((file,index)=>{
		  return <Item key={ index } fileName={ file.fileName } fileId={ file.fileId } user={ this.props.user } fileRecordsArray={ this.props.fileRecordsArray } handleFileRecordsUpdate={ this.props.handleFileRecordsUpdate } />
		});

		return <ul>{list}</ul>; 

  	}

}

class Item extends Component {

  dLoad = async(user, fId, fName) => {
    // TASK BOOKMARK
    // keep name of downloaded file

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


  del = (user, fId, fileRecordsArray) => {
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
              
              var oldArray = fileRecordsArray;

              // returns new array with files not matching id of file to be deleted
              var newArray = oldArray.filter(record => record.fileId !== data.file_id)

              console.log("newArray:", newArray);
              
              // send updated file records array to be updated in App parent component
              this.props.handleFileRecordsUpdate(newArray);
            }
          })
          .catch(err => console.log("error with delete request:", err));
  }


  render() {
    
    const user = this.props.user;
    const fileId = this.props.fileId;
    const fileName = this.props.fileName;
    const fileRecordsArray = this.props.fileRecordsArray;
    
    return(
    	<div>
    		<li id={ fileId } > { this.props.fileName } </li>
    		<p onClick={ () => { this.del(user, fileId, fileRecordsArray) } }> DELETE </p>
        <p onClick={ () => { this.dLoad(user, fileId, fileName) } }> DOWNLOAD </p>
    	</div>
    )
  }
}

export default App;
