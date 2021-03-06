import React from 'react'

export const Login = ({ login }) => (
  <div id='login'>
    <h1>Log In</h1>
    <form>
    <div className="form-group">
        <label htmlFor="formName">Email Address</label>
        <input type="email" className="form-control" className="formEmail" placeholder="Enter email" />
    </div>
    <div className="form-group">
        <label htmlFor="formEmail">Password</label>
        <input type="password" className="form-control" className="formPassword" placeholder="Enter password" />
    </div>
    <button type="submit" className="btn btn-primary">Submit</button>
    </form>
  </div>
)

import {login} from 'APP/app/reducers/auth'
import {connect} from 'react-redux'

export default connect(
  state => ({}),
  {login},
)(Login)
