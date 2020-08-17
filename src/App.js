import React from 'react';
import './App.css';

import SignIn from './SignIn/SignIn';
import Welcome from "./Welcome/index";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
  return (
    <div className="App" >
      <header className="App-header">
        {
         <Router>
         <Switch>
           <Route exact path="/welcome" component={Welcome} />
           <SignIn />
         </Switch>
       </Router>
        }
      </header>     
    </div>
  );
}

export default App;
