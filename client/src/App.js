import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {

  state = {
    user: null,
    filename: null,
    fileData: null,
    filesArray: []
  };

  //componentWillMount() {
    // load file data for specific signed in user when List component mounts
  //}

  //componentUnmount() {
  //}

  uploadFile = () => {
    // check if file is valid
    // valid: smaller than x size, fewer than y files in user list

    // send object of username, file name, file data to db
    // only show file in front end if post was successful

    // axios.post("http://localhost:3001/uploadFile", {}) // {user, file name, file data}
    //        .then(); 

    // .then()
    this.setState({filesArray: [...this.state.filesArray, this.state.filename]}); // set state to change state, use spread operator to create a new array instead of mutating old one
    //console.log("files array: ", this.state.filesArray);


    // should assign file's unique id to key

  }

  render() {

    return (
      <div>

        <input type="text" style={{ width: "300px" }} placeholder="put file name" onChange={ event => this.setState({filename: event.target.value}) }/>
        <button id="upload file" onClick={()=>{this.uploadFile()}}>
          upload file
        </button>
        <div id="filename">
          Filename: {this.state.filename}
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
