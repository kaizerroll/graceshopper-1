import React, { Component } from 'react'
import Navbar from './Navbar'
import Products from './Products'

export default class AppContainer extends Component {

  // const toPass = {}


  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <Navbar />
        </div>
        <div className="row" id="page-content">
        {
          this.props.children && React.cloneElement(this.props.children, {})
        }
        </div>
      </div>
    )
  }
} 
