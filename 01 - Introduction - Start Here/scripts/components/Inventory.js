/*
    Inventory
*/

import React from 'react';
import AddFishForm from './AddFishForm';
import autobind from 'autobind-decorator';

import Firebase from 'firebase';
const ref = new Firebase('https://findmory-cotd.firebaseio.com/');

@autobind
class Inventory extends React.Component{
    constructor() {
        super();

        this.state = {
            uid: ''
        }
    }

    authenticate(provider) {
        console.log("trying to auth with " + provider);
        ref.authWithOAuthPopup(provider, this.authHandler);
    }

    componentWillMount() {
        console.log("checking to see if we can log them in");
        var token = localStorage.getItem('token');
        if(token){
            ref.authWithCustomToken(token, this.authHandler);
        }

    }

    logout(){
        ref.unauth();
        localStorage.removeItem('token');
        this.setState({
            uid : null
        });

    }

    authHandler(err, authData) {
        if(err){
            console.err(err);
            return;
        }

        //save the login token in the browser
        localStorage.setItem('token', authData.token);

        console.log(this.props);
        const storeRef = ref.child(this.props.params.storeId);
        storeRef.on('value', (snapshot)=>{
            var data = snapshot.val() || {};

            if(!data.owner){
                //claim it as our own 
                storeRef.set({
                    owner : authData.uid
                });
            }

            //update our state to refelect the current store owner and user
            this.setState({
                uid : authData.uid,
                owner : data.owner || authData.uid
            });
        });
    }


    //if you don't manually bind like this then this method in the onClick will run on page load, which is probably not what you want!
    renderLogin() {
        return (
            <nav className="login">
                <h2>Inventory</h2>
                <p>Sign in to manage your store's inventory</p>
                <button className="facebook" onClick={this.authenticate.bind(this,'facebook')}>Login with Facebook</button>
            </nav>
        )
    }

    renderInventory(key) {
        var linkState = this.props.linkState;
        return (
            <div className="fish-edit" key={key}>
                <input type="text" valueLink={linkState('fishes.' + key + '.name')} />
                <input type="text" valueLink={linkState('fishes.' + key + '.price')} />
                <select valueLink={linkState('fishes.' + key + '.status')}>
                    <option value="unavailable">Sold Out!</option>
                    <option value="available">Fresh!</option>
                </select>
                <textarea valueLink={linkState('fishes.' + key + '.desc')} />
                <input type="text" valueLink={linkState('fishes.' + key + '.image')} />
                <button onClick={this.props.removeFish.bind(null, key)}>Remove Fish</button>
            </div>
        )
    }

    render() {
        let logoutButton = <button onClick={this.logout}>Log Out!</button>

        //first check if they arent logged in
        if(!this.state.uid) {
            return (
                <div>{this.renderLogin()}</div>
            )
        }

        //then check if they aren't the owner of the current store
        if(this.state.uid !== this.state.owner){
            return (
                <div>
                    <p>Sorry you arent the owner of this store</p>
                    {logoutButton}
                </div>
            )
        }

        return (
            <div>
                <h2>Inventory</h2>
                {logoutButton}
                {Object.keys(this.props.fishes).map(this.renderInventory)}
                <AddFishForm {...this.props}/> {/* spread operator.  passes all the props */}
                <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
            </div>
        )
    }

};

Inventory.propTypes = {
    removeFish : React.PropTypes.func.isRequired,
    loadSamples : React.PropTypes.func.isRequired,
    addFish : React.PropTypes.func.isRequired,
    linkState : React.PropTypes.func.isRequired,
    fishes : React.PropTypes.object.isRequired,
}

export default Inventory;
