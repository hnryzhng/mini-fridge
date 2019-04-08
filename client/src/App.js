import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {

  state = {
    user: null,
    fileName: null,
    fileData: null,
    filesArray: []
  };

  //componentWillMount() {
    // load list of file data for specific signed in user when List component mounts
  //}

  //componentUnmount() {
  //}

  handleFileUpload = (event) => {
  	// show file path in component (placeholder: this.filePath)
  	// extract file name
  	// extract file data
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



    var requestObj = {
    	//user_id: userId,
    	//logged_in: true,
    	file_name: "",	// grab from end of rel path
    	file_data: this.state.fileData
    }
    // axios.post("http://localhost:3001/uploadFile", {}) // {user, file name, file data}
    //        .then(); 

    // .then()
    this.setState({filesArray: [...this.state.filesArray, this.state.fileName]}); // set state to change state, use spread operator to create a new array instead of mutating old one
    //console.log("files array: ", this.state.filesArray);

    // should assign file's unique id to key


  }

  render() {

    return (
      <div>

        <input type="text" style={{ width: "300px" }} placeholder="put file name" onChange={ event => this.setState({fileName: event.target.value}) }/>

        <input type="file" style={{ width: "300px" }} placeholder="upload file" onChange= {this.handleFileUpload} />

        <button id="upload file" onClick={()=>{this.uploadFile()}}>
          upload file
        </button>
        <div id="fileName">
          Filename: {this.state.fileName}
        </div>

        <div id="listContainer" style={{ width: "300px", height: "500px", border: "1px solid black" }}>
          <List filesArray={this.state.filesArray} />  
        </div>


      </div>
    );
  }
}

class List extends Component {
  render() {
    let list = this.props.filesArray.map((file,index)=>{
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
