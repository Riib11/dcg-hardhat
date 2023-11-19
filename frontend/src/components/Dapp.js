import React from "react";

import { ethers } from "ethers";
import DcgArtifact from "../contracts/Dcg.json";
import contractAddress from "../contracts/contract-address.json";
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";

const HARDHAT_NETWORK_ID = '1337';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      selectedAddress: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      // Dcg
      games: undefined,
      gameIx: 0,
    };

    this.state = this.initialState;
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (this.state.games === undefined) {
      return <Loading />;
    }

    const game_list_view = (() => {
      if (this.state.games.length == 0) {
        return (<div>number of games: {this.state.games.length}</div>);
      } else {
        return (
          <div>
            <div>number of games: {this.state.games.length}</div>
            <div>
              {this.state.games.map((game, gameIx_) =>
              (<div className="game-list-item" key={gameIx_} onClick={(event) => {
                this.setState({ gameIx: gameIx_ });
              }}>
                <div className="game-list-item-players">GAME#{gameIx_}: {game.player1_addr} vs {game.player2_addr}</div>
              </div>))}
            </div>
          </div>
        )
      }
    })();

    const game_view = (() => {
      if (this.state.games.length == 0) {
        return (
          <div>
            game:none
          </div>
        )
      } else {
        let game = this.state.games[0];
        console.log(game);
        return (
          <div className="game">
            <div>GAME #{this.state.gameIx}</div>
            <div>
              Player 1
              <div>PWR[{game.player1_cardPower.toString()}]</div>
            </div>
            <div>
              Player 2
              <div>PWR[{game.player2_cardPower.toString()}]</div>
            </div>
          </div>
        );
      }
    })();

    const create_game_view = (() => {
      return (
        <div>
          <button onClick={async (event) => {
            await this._dgc.createGame(
              this.state.selectedAddress, // address player1_addr,
              0, // uint player1_cardPower,
              this.state.selectedAddress, // address player2_addr,
              1 // uint player2_cardPower
            );
          }}>
            create game
          </button>
        </div>
      )
    })();

    return (
      <div>
        <h1>DCG</h1>
        {game_view}
        {create_game_view}
        {game_list_view}
      </div>
    )
  }

  componentWillUnmount() {
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Once we have the address, we can initialize the application.

    // First we check the network
    this._checkNetwork();

    await this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", async ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this._resetState();
      }

      await this._initialize(newAddress);
    });
  }

  async _initialize(userAddress) {
    this.setState({
      selectedAddress: userAddress,
    });

    await this._initializeEthers();
    await this._startPollingGame();
  }

  async _initializeEthers() {
    // console.debug("[_initializeEthers]");

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x539',
                chainName: 'local hardhat testnet',
                rpcUrls: ['http://localhost:8545/'],
                nativeCurrency: {
                  name: "ether",
                  symbol: 'ETH',
                  decimals: 18
                },
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
          console.error(addError)
        }
      }
      // handle other "switch" errors
    }

    // We first initialize ethers by creating a provider using window.ethereum
    // 
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    // this._provider = new ethers.providers.Web3Provider(window.ethereum)
    this._provider = ethers.getDefaultProvider("http://localhost:8545");

    // TODO: or actually this is not required?
    // // MetaMask requires requesting permission to connect users accounts
    // await this._provider.send("wallet_requestPermissions", []);

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = await this._provider.getSigner();

    this._dgc = new ethers.Contract(
      contractAddress.Dcg,
      DcgArtifact.abi,
      signer
    );

    // console.debug("[_initializeEthers]", "dgc", this._dgc);
    // console.debug("[_initializeEthers]", "dgc.games", await this._dgc.getGames());

    // // Then, we initialize the contract using that provider and the token's
    // // artifact. You can do this same thing with your contracts.
    // this._token = new ethers.Contract(
    //   contractAddress.Token,
    //   TokenArtifact.abi,
    //   signer
    // );

    // console.debug("[_initializeEtheres]", "[token]", this._token);
  }

  async _startPollingGame() {
    console.debug("[_startPollingGame]");
    this.pollGameInterval = setInterval(() => this._updateGames(), 1000);

    // We run it once immediately so we don't have to wait for it
    await this._updateGames();
  }

  _stopPollingGame() {
    clearInterval(this.pollGameInterval);
    this.pollGameInterval = undefined;
  }

  async _updateGames() {
    // TODO: update game
    const games = await this._dgc.getGames();
    // console.debug("[_updateGames]", "games", games);
    this.setState({ games });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  async _switchChain() {
    try {
      const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      await this._initialize(this.state.selectedAddress);
    } catch (switchError) {
      if (switchError.code === 4902) {
        // This error code indicates that the chain has not been added to
        // MetaMask.
        await this._addChain();
      } else {
        console.error(switchError);
      }
    }
  }

  async _addChain() {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: chainIdHex,
          chainName: 'local hardhat testnet',
          rpcUrls: ['http://localhost:8545/'],
          nativeCurrency: {
            name: "ether",
            symbol: 'ETH',
            decimals: 18
          },
        },
      ],
    });
  }

  // This method checks if the selected network is Localhost:8545
  async _checkNetwork() {
    const networkVersion = await window.ethereum.request({ method: 'net_version' });
    if (networkVersion !== HARDHAT_NETWORK_ID) {
      this._switchChain();
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }
}
