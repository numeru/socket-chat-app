import React from 'react';
import loadable from '@loadable/component';
import { Redirect, Route, Switch } from 'react-router';

const Login = loadable(() => import('@pages/login/login'));
const Signup = loadable(() => import('@pages/signup/signup'));
const Channel = loadable(() => import('@pages/channel/channel'));

const App = () => {
  return (
    <Switch>
      <Redirect exact path="/" to="/login" />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/workspace" component={Channel} />
    </Switch>
  );
};

export default App;
