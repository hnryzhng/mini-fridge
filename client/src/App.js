import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {

  state = {
    user: null,
    fileName: null,
    fileData: null,
    fileNamesArray: []
  };

  //componentWillMount() {
    // load list of file names for specific signed in user when List component mounts
  //}

  //componentUnmount() {
  //}

  storeFile = (event) => {
  	let file = event.target.files[0];
  	this.setState({fileData: file});
  }

  handleFileUpload = (event) => {
    this.setState({fileName: event.target.files[0].name})
    this.setState({fileData: event.target.files[0]});

  }

  uploadFile = () => {
    // check if file is valid
    // valid: smaller than x size, fewer than y files in user list
    // send object of username, file name, file data to db
    // only show file in front end if post was successful

    // user log-in authentication (maybe have page of validation)
    // if logged in, then submit data 
    // isLoggedIn()?
    // const userId = grabUserId();
    
    console.log("file name: ", this.state.fileName);
    console.log("file data: ", this.state.fileData);
    
    const formDataObj = new FormData();

  	//user_id: userId,
  	//logged_in: true,
    formDataObj.append("name", this.state.fileName);
    formDataObj.append("file", this.state.fileData);

    axios.post("http://localhost:3001/api/uploadFile", formDataObj); // {user, file name, file data}
    //        .then();

    // .then()
    this.setState({fileNamesArray: [...this.state.fileNamesArray, this.state.fileName]}); // set state to change state, use spread operator to create a new array instead of mutating old one
    //console.log("files array: ", this.state.fileNamesArray);

    // should assign file's unique id to key


  }

  render() {

    return (
      <div>

        <input type="file" style={{ width: "300px" }} placeholder="upload file" onChange= {this.handleFileUpload} />

        <button id="upload file" onClick={()=>{this.uploadFile()}}>
          upload file
        </button>
        <div id="fileName">
          Filename: {this.state.fileName}
        </div>

        <div id="listContainer" style={{ width: "300px", height: "500px", border: "1px solid black" }}>
          <List fileNamesArray={this.state.fileNamesArray} />  
        </div>


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
