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

    this.state.filesArray.push(this.state.filename);  // filename => fileData
    console.log("files array: ", this.state.filesArray);

    // re-render list component upon adding list item
    //this.forceUpdate();
    //OR https://stackoverflow.com/questions/33080657/react-update-one-item-in-a-list-without-recreating-all-items

    // show in list component

    // should assign file's unique id to key

    // PROBLEM: should re-render component after upload so that file name will show in list?

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
          <ul id="list">
            {this.state.filesArray.map((file, index)=>{
              return <li key={index}>{file}</li>
            })}
          </ul> 
        </div>

      </div>
    );
  }
}
export default App;
