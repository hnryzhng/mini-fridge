import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import axios from 'axios';

// import stylesheets
import "./styles.css";
// import 'bootstrap/dist/css/bootstrap.min.css';

// import components
import Footer from './components/Footer.js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

class App extends Component {

  state = {
    user: null,
    loggedIn: false,
    fileData: null,
    fileName: null,
    fileRecordsArray: [],
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
    	// log in if successfully registered
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

    let showComponent;

    if (this.state.loggedIn) {
      showComponent = <UserModule { ... this.state } handleFileUploadComponent={ this.handleFileUploadComponent } handleFileRecordsUpdate={ this.handleFileRecordsUpdate } />;
    } else {
      showComponent = <RoutesComponent { ...this.state } handleLoginModule={this.handleLoginModule} handleRegisterModule={this.handleRegisterModule}/>
    }


    return (
      <Router>
        <div>

          <NaviBar user={this.state.user} loggedIn={this.state.loggedIn} handleLoginModule={this.handleLoginModule} handleRegisterModule={this.handleRegisterModule} handleSignOut={this.handleSignOut} />

          { showComponent }

        </div>

        <UploadFileModal loggedIn={this.state.loggedIn} />
          

      </Router>
      
      <Footer />
    );
  }
}


class RoutesComponent extends Component {
  render() {
    return(

      <Switch> 
        <Route exact path='/' component={ Landing } />
        <Route exact path='/register-page' render={(props)=> <RegisterPage { ...props } handleRegisterModule={this.props.handleRegisterModule} /> } />
        <Route exact path='/login-page' render={(props)=> <LoginPage { ...props } handleLoginModule={this.props.handleLoginModule} /> } />

      </Switch>

    )
  }
}

class UserModule extends Component {
  render() {
    return(
      <>

        <UploadFileControl {...this.props} handleFileUploadComponent={this.props.handleFileUploadComponent} />

        <ListContainer { ...this.props } handleFileRecordsUpdate={ this.props.handleFileRecordsUpdate } />
      
      </>
    )
  }
}

class DemoModal extends Component {
  state = {
    showModal: true
  }

  closeModal = () => {
    this.setState({ showModal: false });
  }

  render(){
    return(

      <Modal id="demo-modal" show={ this.state.showModal } onHide={ this.closeModal } animation={ false } centered>
        
        <Modal.Header closeButton>
          <h3>Demo</h3>
        </Modal.Header>

        <Modal.Body>
          <p>If you want to try out this demo without registering for an account, use the credentials below to sign in:</p>
          <p>Username: <b>testuser</b></p>
          <p>Password: <b>testuser123</b></p>
        </Modal.Body>

        <Button id="demo-modal-close-button" variant="primary" onClick={ this.closeModal } >
          Got it!
        </Button>

      </Modal>
    )
  }

}

class Landing extends Component {

  state = {
    showModal: true
  }


  render() {

    const landingText = `

      Get your very own mini cloud. Our service is perfect for saving small files such 
      as Word docs so you can access them wherever you are.

    `

    return(
      <div className="container-fluid section-container parallax" id="landing-section">
            
          <DemoModal />

          <div className="row" id="landing-row">
            
            <div className="col-md d-flex align-self-center justify-content-center" id="landing-section-left">
              <img src={ require("./static/landing_img.png") } alt="landing" id="landing-image" />
            </div>

            <div className="col-md align-self-center justify-content-center" id="landing-section-right">
      
              <div className="row d-flex" id="landing-text-container">
                <p className="d-flex justify-content-center" id="landing-text">
                
                  { landingText }

                </p>
              </div>

              <div className="row justify-content-center">
              
                <Link to="/register-page" className="col-md btn btn-outline-light btn-lg" id="landing-register-button">
                    Sign Up
                </Link>
              </div>

              <div className="row justify-content-center">              
                <Link to="/login-page" className="col-md btn btn-outline-light btn-lg" id="landing-login-button">
                    Log In
                </Link>

              </div>


            </div>

          </div>


      </div>


    )
  }

}

class RegisterPage extends Component {
  state = {
    user: "",
    password: "",
    passwordConfirm: "",
  };

  validateInput(user, password, passwordConfirm) {
  	// checks register input fields

  	// check if any empty fields 
  	if (user.length === 0 || password.length === 0 || passwordConfirm.length === 0) {
  		alert("all fields must be filled out");
  		return false;
  	}

  	// check password length
  	const minLength = 6
  	const maxLength = 30
  	if (password.length < minLength || password.length > maxLength ) {
  		alert("password must be between 6 and 30 characters");
  		return false;
  	}

  	// check if password fields match
  	if (password !== passwordConfirm) {
  		alert("password and password confirmation must match");
  		return false;
  	}

  	// returns true if no validation errors in checks above
  	return true;

  }

  register = (event) => {

    event.preventDefault();
    
    const production = "https://mini-fridge.herokuapp.com";
    const development = "http://localhost:3001";
    const baseURL = (process.env.NODE_ENV? production: development);

    const { user, password, passwordConfirm } = this.state;

    const isValid = this.validateInput(user, password, passwordConfirm);

    if (isValid) {
	    // send POST request
	    axios.post(`${baseURL}/api/register`, {
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

	            this.props.history.push('/')  // uses React Router to navigate back to homepage route after successful registration

	          } else {      
	            console.log("registration failed");
	            console.log(data.error);
	            
	            alert(data.error);

	            // send data back to App component
	            this.props.handleRegisterModule(null, false);

	          }
	        })
	        .catch(err => console.log("registration error:", JSON.stringify(err.errors)));
	    };
  }

  render() {
    return(

      <div className="container-fluid d-flex" id="register-page-container">

        <DemoModal />

        <form className="form-inline align-self-center" id="register-page-form" onSubmit={ this.register }>

          <div className="row">
            <input type="text" className="form-control form-control-lg col-md" placeholder="type new username" name="username" onChange= {event=>this.setState({user: event.target.value})} />
          </div>

          <div className="row">
            <input type="password" className="form-control form-control-lg col-md" placeholder="type new password" name="password" onChange= {event=>this.setState({password: event.target.value})} />
          </div>

          <div className="row">
            <input type="password" className="form-control form-control-lg col-md" placeholder="confirm new password" name="passwordConfirm" onChange= {event=>this.setState({passwordConfirm: event.target.value})} />
          </div>

          <div className="row">            
            <button type="submit" className="btn btn-primary col-sm mt-3">
              REGISTER 
            </button>
          </div>

          <div className="row">
            <Link to="/login-page" className="col-sm btn btn-link" id="register-page-login-button"> 
              Login 
            </Link>
          </div>

        </form>

      </div>

    )
  }

}

class LoginPage extends Component {

  state = {
    usernameInput: null,
    passwordInput: null
  }

  login = (event) => {

    event.preventDefault();

    const production = "https://mini-fridge.herokuapp.com";
    const development = "http://localhost:3001";
    const baseURL = (process.env.NODE_ENV? production: development);

    // send POST request to backend
    axios.post(`${baseURL}/api/login`, {
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

            this.props.history.push('/')  // uses React Router to navigate back to homepage route after successful login

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


      <div className="container-fluid d-flex" id="login-page-container">

        <DemoModal />

        <form className="form-inline align-self-center" id="login-page-form" onSubmit={this.login}>

            <div className="row">
              <input type="text" className="form-control form-control-lg col-md" id="login-page-username" placeholder="username" name="username" onChange= {event=>this.setState({usernameInput: event.target.value})} />             
            </div>

            <div className="row">
              <input type="password" className="form-control form-control-lg col-md" id="login-page-password" placeholder="password" name="password" onChange= {event=>this.setState({passwordInput: event.target.value})} />
            </div>

            <div className="row mt-3">
              <button type="submit" className="btn btn-primary col-sm">
                SIGN IN 
              </button>
            </div>

            <div className="row">
              <Link to="/register-page" className="col-sm btn btn-link" id="login-page-register-button"> Register </Link>
            </div>

        </form>
    
      </div>

    )
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
  				<input type="text" className="form-control form-control-lg" id="search-filter-input" placeholder="SEARCH FOR YOUR FILE" onChange={ this.searchFilter } />
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

    const production = "https://mini-fridge.herokuapp.com";
    const development = "http://localhost:3001";
    const baseURL = (process.env.NODE_ENV? production: development);

    // send POST request to backend
    axios.post(`${baseURL}/api/login`, {
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

        <div className="container-fluid" id="login-register-module-container">

				<form className="form-inline" id="login-module" onSubmit={this.login}>

				  <div className="row">

					<input type="text" className="form-control form-control-lg col-sm " id="login-username" placeholder="username" name="username" onChange= {event=>this.setState({usernameInput: event.target.value})} />				      

					<input type="password" className="form-control form-control-lg col-sm" id="login-password" placeholder="password" name="password" onChange= {event=>this.setState({passwordInput: event.target.value})} />

					<button type="submit" className="btn btn-primary col-sm">
						SIGN IN 
					</button>

					<button type="button" className="col-sm" id="register-button" onClick={ this.sendToParent }> Register </button>

				  </div>

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
    user: "",
    password: "",
    passwordConfirm: "",
    show: false
  };

  validateInput(user, password, passwordConfirm) {
  	// checks register input fields

  	// check if any empty fields 
  	if (user.length === 0 || password.length === 0 || passwordConfirm.length === 0) {
  		alert("all fields must be filled out");
  		return false;
  	}

  	// check password length
  	const minLength = 6
  	const maxLength = 30
  	if (password.length < minLength || password.length > maxLength ) {
  		alert("password must be between 6 and 30 characters");
  		return false;
  	}

  	// check if password fields match
  	if (password !== passwordConfirm) {
  		alert("password and password confirmation must match");
  		return false;
  	}

  	// returns true if no validation errors in checks above
  	return true;

  }

  register = (event) => {

    event.preventDefault();
    
    const production = "https://mini-fridge.herokuapp.com";
    const development = "http://localhost:3001";
    const baseURL = (process.env.NODE_ENV? production: development);

    const { user, password, passwordConfirm } = this.state;

	const isValid = this.validateInput(user, password, passwordConfirm);

	if (isValid) {
	    // send POST request
	    axios.post(`${baseURL}/api/register`, {
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
	};
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

		  <nav id="navibar" className="navbar navbar-expand-md shadow-sm bg-white rounded">

             


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
	  showComponent = <NavigationMenu user={ this.props.user } handleSignOut={ this.props.handleSignOut } />
	} else {
	  showComponent = <LoginRegisterModule { ...this.props } />
	}

    return(
		<>
			{ showComponent }
		</>
	);
  }

}

class Logo extends Component {
  render() {
    return(
    
      <a className="navbar-brand" id="logo-container" href="/">
        <img src={ require("./static/logo_cropped.png") } alt="Mini Fridge"/>
      </a>  
    


    )
  }
}

class NavigationMenu extends Component {
  render() {
    return(

      
        <div className="container-fluid d-md-flex justify-content-end" id="navigation-menu-container">  	

          <div className="" id="navigation-menu">  					
  		      <ul className="navbar-nav">

  		        <li className="nav-item dropdown">

  		          <button type="button" className="nav-link dropdown-toggle btn btn-link" href="#" id="nav-dropdown-link" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    		        <p id="nav-dropdown-text"> Hey {this.props.user} </p>
  		          </button>

  		          <div className="dropdown-menu" aria-labelledby="navbar-dropdown-menu-link">
  		            <button type="button" className="dropdown-item btn btn-link" href="#">
  		              <SignOutButton handleSignOut={this.props.handleSignOut} /> 
  		            </button>
  		          </div>  		          
  		        </li>

  		      </ul>
  	      </div>

      	</div>
      
    )
  }
}

class UploadFileModal extends Component {

  state = {
    showUploadFileModal: false
  }

  componentWillUpdate(prevProps, prevState) {
    // show if logged in
    // console.log("uploadfilemodal will update")
    if (prevProps !== this.props) {
      if (this.props.loggedIn) {
        this.setState({ showUploadFileModal: true })
      }
    }
  }

  closeModal = () => {
    this.setState({ showUploadFileModal: false });
  }

  render(){
    return(

      <Modal id="upload-file-modal" show={ this.state.showUploadFileModal } onHide={ this.closeModal } animation={ false } centered>

        <Modal.Header closeButton>
        </Modal.Header>

        <Modal.Body>
          <p>Since this is a demo using free storage, you can only upload files that are 500 kilobytes or smaller. Think Word documents or low-resolution images. The cloud can get expensive!</p>
        </Modal.Body>

        <Button id="demo-modal-close-button" variant="primary" onClick={ this.closeModal } >
          Understood!
        </Button>

      </Modal>

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

  clearFileUploadStates = () => {
    this.setState({ fileData: null });
    this.setState({ hasFileWaiting: false });
  }

	uploadFile = (event) => {

		const fileData = this.state.fileData;
		const fileName = ((fileData)? fileData.name: null);
		const user = this.props.user;
		const loggedIn = this.props.loggedIn;
    const fileRecordsArray = this.props.fileRecordsArray;

		event.preventDefault();

		console.log("---UploadFileForm component---");
		console.log("user: ", user);
		console.log("loggedIn: ", loggedIn);
		console.log("file name: ", fileName);
		console.log("fileData: ", fileData);

		// check that file data exists upon submitting
		if (!fileData) {
			alert("please add a file before submitting");
      return // terminate function
		}

		// check for logged-in user
		if (!loggedIn) {
			alert("you must be logged in to upload file");
      this.clearFileUploadStates();
			return // terminate function
		}

    // check that there's no filename collision in fileRecordsArray
    for (var i=0; i<fileRecordsArray.length; i++) {
      const fName = fileRecordsArray[i].fileName;
      if (fileName === fName) {
        alert("file with same name already exists");
        this.clearFileUploadStates();
        return
      }
    }

		// file validation: file size < 500 kb
		const fileSize = fileData.size;
		const fileSizeLimit = 500000; // bytes; fileSizeLimit/1000 = kilobytes

		// send file data with POST request
		if (fileSize <= fileSizeLimit) {
			// instantiate react form object to hold file data
			const formDataObj = new FormData();

			formDataObj.append("user", user);
			formDataObj.append("fileName", fileName);
			formDataObj.append("fileData", fileData);

			const production = "https://mini-fridge.herokuapp.com";
			const development = "http://localhost:3001";
			const baseURL = (process.env.NODE_ENV? production:development);

			axios.post(`${baseURL}/api/uploadFileGridFS`, formDataObj)
			      .then(response => response.data) 
			      .then(data => {
			        if (data.success) {
			          console.log("data:", data);

			          // send file name back to parent to update fileRecordsArray
			          this.props.handleFileUploadComponent(data, true);

                	// reset states to no file
                	this.clearFileUploadStates();

			        } else {
			          console.log("error: trouble uploading your file");
			          console.log("DATA:", data);

			          alert(data.error);

			          this.props.handleFileUploadComponent(null, false);

                // reset states to no file
                this.clearFileUploadStates();

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

  constructor(props) {
    
    super(props);

    // grab reference to <a> download element DOM node
    this.a = React.createRef();

  }

  downloadHelper = (response, filename) => {
    // helper function allows greater control over file download on front-end

    // render blob into downloadable url
    // grab hidden <a> download-tag, assign el with filename and file download url attributes, trigger element click to initiate download

    console.log("download helper response data", response.data);

    // create Blob and downloadable url
    var blob = new Blob([response.data], {type: response.headers['content-type']}); // render Blob from response data and set content type in header
    console.log("Blob file:", blob);
    const fileURL = URL.createObjectURL(blob);  // produce downloadable url from Blob 
    console.log("download file url:", fileURL)
    
    // get element
    const a = this.a.current;
    console.log("current <a>:", a);

    // set attributes
    a.setAttribute('href', fileURL);  // set <a> tag url to file url
    a.setAttribute('download', filename); // set <a> tag filename 

    console.log('download <a> with attr:', a);

    // click element to download
    a.click();

    // remove browser's reference to the file
    URL.revokeObjectURL(fileURL);
  }

  dLoad = async(user, fId, fName) => {
    // TASK BOOKMARK
    // keep name of downloaded file

    console.log("standalone download function:", user, ",", fId, ",", fName);
    
    const production = "https://mini-fridge.herokuapp.com";
    const development = "http://localhost:3001";
    const baseURL = (process.env.NODE_ENV? production: development);

    const reqUrl = `${baseURL}/api/downloadFileGridFS?user=${user}&fileId=${fId}&fileName=${fName}`;

    axios(reqUrl, {
      method: 'GET',
      responseType: 'arraybuffer'
    })
    .then((response) => {

      this.downloadHelper(response, fName);


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

    const production = "https://mini-fridge.herokuapp.com";
    const development = "http://localhost:3001";
    const baseURL = (process.env.NODE_ENV? production: development);

    axios.get(`${baseURL}/api/deleteFileGridFS`, {
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
    		  
        <button type="button" className="col-md-8 btn btn-link"><li id={ fileId } className="file-list-item"> { this.props.fileName } </li></button>
    	  <button type="button" className="col-md-2 btn btn-link"><img src={ require("./static/icons/delete.png") } className="delete-icon icon" alt="DELETE" onClick={ () => { this.del(user, fileId, fileRecordsArray) } } /></button>
        <button type="button" className="col-md-2 btn btn-link"><img src={ require("./static/icons/download.png") } className="download-icon icon" alt="DOWNLOAD" onClick={ () => { this.dLoad(user, fileId, fileName) } } /></button>

        <a href="#" id="download-tag" ref={ this.a } >DOWNLOAD LINK</a> 

          </div>
    	</div>
    )
  }
}

export default App;
