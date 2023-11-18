import React from "react";
import { ethers } from "ethers";

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      selectedAddress: undefined
    }

    this.state = this.initialState;
  }

  render() {
    return (
      <div>
        <div>window.ethereum: {window.ethereum}</div>
        <div>this.state.selectedAddress: {this.state.selectedAddress}</div>
      </div>
    )
  }
}