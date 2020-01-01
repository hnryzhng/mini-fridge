import React, { Component } from 'react';
import ReactDOM from 'react-dom';
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

		<div id="list-container">
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

      <div id="search-filter-container">

  			<div id="search-filter">
  				<input type="text" className="form-control form-control-lg" id="search-filter-input" placeholder="type to search for your file" onChange={ this.searchFilter } />
  			</div>	

      </div>  

		)
	}

}

class LoginRegisterModule extends Component {

  state = {
    showRegisterModal: false
  }

  handleShowRegisterModal = (success) => {
    // LoginModule <-> LoginRegisterModule <-> RegisterModule

    // Show RegisterModal
    // click on LoginModule's "Register account" button 
    // LoginModule's this.props.handleShowRegisterModal sends success paramater back to this parent component
    // if success, change showRegisterModal to true
    // send this.state.showRegisterModal to RegisterModule to show if true

    // Close RegisterModal
    // click on close icon in RegisterModule
    // RegisterModule's this.props.handleShowRegisterModal sends success parameter back to parent
    // if not success, change showRegisterModal to false

    if (success) {
      this.setState({ showRegisterModal: true });
    } else {
      this.setState({ showRegisterModal: false });
    }

  }

  render() {
    return(
      <>
        <LoginModule handleLoginModule={ this.props.handleLoginModule } handleShowRegisterModal={ this.handleShowRegisterModal } />
        <RegisterModule handleRegisterModule={ this.props.handleRegisterModule } showRegisterModal={ this.state.showRegisterModal } handleShowRegisterModal={ this.handleShowRegisterModal } />
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

  sendToParent = () => {
    this.props.handleShowRegisterModal(true);
  }

    render() {
      return(

        <div className="container">
          <div className="row">


          <div className="col-sm">
            <form className="form-inline" id="login-module" onSubmit={this.login}>

              <div className="row">

                  <input type="text" className="form-control form-control-lg col-sm" id="login-username" placeholder="username" name="username" onChange= {event=>this.setState({usernameInput: event.target.value})} />
                  <input type="password" className="form-control form-control-lg col-sm" id="login-password" placeholder="password" name="password" onChange= {event=>this.setState({passwordInput: event.target.value})} />

                  <button type="submit" className="btn btn-primary ">
                    SIGN IN 
                  </button>

              </div>

            </form>
          </div>
          
          
          <button type="button col-sm" id="register-button" onClick={ this.sendToParent }> Register </button>
          

          </div>
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

  sendToParent = () => {
    this.props.handleShowRegisterModal(false);
  }

  render() {

    return(


    	<div id="register-module-container">
      	
  			<div id="register-module" style={{ display: this.props.showRegisterModal? 'block' : 'none' }}>
  				<form style={{ border: "1px solid blue"}} onSubmit={ this.register }>

  				<input type="text" style={{ width: "300px" }} placeholder="type new username" name="username" onChange= {event=>this.setState({user: event.target.value})} />
  				<input type="password" style={{ width: "300px" }} placeholder="type new password" name="password" onChange= {event=>this.setState({password: event.target.value})} />
  				<input type="password" style={{ width: "300px" }} placeholder="confirm new password" name="passwordConfirm" onChange= {event=>this.setState({passwordConfirm: event.target.value})} />
  				<button type="submit">
  				  REGISTER 
  				</button>

  				</form>

  				<button type="button" id="close-signout-module" onClick={ this.sendToParent } > CLOSE </button>
  			</div>

      </div>

    )
  }


}


class NaviBar extends Component {

	render() {
		return(

		  <nav id="navibar" className="navbar navbar-expand-md shadow-sm p-3 mb-5 bg-white rounded">

        <div className="container">
          <div className="row">
        
            <div className="col-sm-4">
              <Logo />
            </div>

            <div className="col-sm-8">
  		        <NavigationControl user={ this.props.user } loggedIn={ this.props.loggedIn } handleLoginModule={ this.props.handleLoginModule } handleRegisterModule={ this.props.handleRegisterModule } handleSignOut={ this.props.handleSignOut } />
            </div>

          </div>
        </div>


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

    	<div className="collapse navbar-collapse" id="navigation-control-container">
        <ul className="navbar-nav">
    	  
         { showComponent }
        
        </ul>
    	</div>
    	);
  }

}

class Logo extends Component {
  render() {
    return(
    
      <a className="navbar-brand" id="logo-container" href="/">
        <img src={ require("./static/logo_cropped.png") }/>
      </a>  
    


    )
  }
}

class UserModule extends Component {
  render() {
    return(
      <div>
        <div className="nav-item dropdown">

          <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Hey {this.props.user} 
          </a>

          <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
            <a className="dropdown-item" href="#">
              <SignOutButton handleSignOut={this.props.handleSignOut} /> 
            </a>
          </div>
          
        </div>
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
		const fileName = ((fileData)? fileData.name: null);
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

                this.setState({ hasFileWaiting: false });

			        } else {
			          console.log("error: trouble uploading your file");
			          this.props.handleFileUploadComponent(null, false);

                this.setState({ hasFileWaiting: false });
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

    let currentButton;

    if (this.state.hasFileWaiting) {
      currentButton = <button type="button" className="btn btn-lg btn-block btn-success" id="submit-file-button" onClick={ this.uploadFile }>SUBMIT FILE</button>
    } else {
      currentButton = <button type="button" className="btn btn-lg btn-block btn-primary" id="upload-file-button" onClick={ this.clickFileInput } >UPLOAD</button>
    }

		return(
			<div id="upload-file-module">

			    <div id="upload-file-control">
			        
              { currentButton }

			        <div id="filename-display">
			        	<p id="filename-display-text"> { this.state.fileData? this.state.fileData.name: "" }</p>
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

		return <ul className="list-group">{list}</ul>; 

  	}

}

class Item extends Component {

  downloadHelper = (response, filename) => {
    // helper function allows greater control over file download on front-end

    // render blob into downloadable url, create <a>, bind element to DOM, assign el with name and url attributes, function to trigger click on link to download

    console.log("download helper response data", response.data);

    // create Blob and downloadable url
    var blob = new Blob([response.data], {type: response.headers['content-type']}); // render Blob from response data and set content type in header
    console.log("Blob file:", blob);
    const fileURL = URL.createObjectURL(blob);  // produce downloadable url from Blob 
    
    // create <a> element
    // set <a> attributes
    const a = React.createElement('a', {href: fileURL, download: filename, display: 'none'});  // hide <a>
    // console.log("<a> element: ", a);

    // bind to DOM
    ReactDOM.render(
      a, 
      document.getElementById('root')
    );

    // click element to download
    a.click();

    // remove browser's reference to the file
    URL.revokeObjectURL(fileURL);


  }

  dLoad = async(user, fId, fName, downloadHelper) => {
    // TASK BOOKMARK
    // keep name of downloaded file

    console.log("standalone download function:", user, ",", fId, ",", fName);
    
    const reqUrl = `http://localhost:3001/api/downloadFileGridFS?user=${user}&fileId=${fId}&fileName=${fName}`;

    axios(reqUrl, {
      method: 'GET',
      responseType: 'arraybuffer'
    })
    .then((response) => {

      downloadHelper(response, fName);


      // console.log("response content:", response.data)
      // var blob = new Blob([response.data], {type: response.headers['content-type']});
      // console.log("Blob file:", blob);
      // download(blob)


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
    	<div className="container list-group-item list-group-item-action">
        <div className="row">
    		  
          <a href="#" className="col-sm-8"><li id={ fileId } > { this.props.fileName } </li></a>
    		  <a href="#" className="col-sm-2"><img src={ require("./static/icons/delete.png") } className="delete-icon icon" alt="DELETE" onClick={ () => { this.del(user, fileId, fileRecordsArray) } } /></a>
          <a href="#" className="col-sm-2"><img src={ require("./static/icons/download.png") } className="download-icon icon" alt="DOWNLOAD" onClick={ () => { this.dLoad(user, fileId, fileName, this.downloadHelper) } } /></a>

          </div>
    	</div>
    )
  }
}

export default App;
