import React from 'react';

// two way data binding of nested objects.
// the built-in "LinkState" only works on the top level items
import Catalyst from 'react-catalyst';

import Header from './Header';
import Fish from './Fish';
import Inventory from './Inventory';
import Order from './Order';


//Firebase
import Rebase from 're-base';
var base = Rebase.createClass('https://findmory-cotd.firebaseio.com/');



var App = React.createClass({
    mixins: [Catalyst.LinkedStateMixin],
    getInitialState: function(){
        return {
            fishes: {},
            order: {}
        }
    },
    componentDidMount: function() {
        base.syncState(this.props.params.storeId + '/fishes', {
            context: this,
            state: 'fishes'
        }); //takes our state and syncs it with firebase

        var localStorageRef = localStorage.getItem('order-' + this.props.params.storeId);

        if(localStorageRef) {
            //update our component state to reflect what is in local storage
            this.setState({
                order : JSON.parse(localStorageRef)
            });
        }
    },
    componentWillUpdate: function(nextProps, nextState) {
        localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
    },
    addToOrder: function(key){
        this.state.order[key] = this.state.order[key] + 1 || 1;
        this.setState({order : this.state.order});
    },
    removeFromOrder: function(key) {
        delete this.state.order[key];
        this.setState({
            order : this.state.order
        })
    },
    addFish: function(fish) {
        var timestamp = (new Date()).getTime();
        //update the state object
        this.state.fishes['fish-' + timestamp] = fish;
        // set the state (so it rerenders) and only pass an oject of the state that has changed
        // so it doesn't have to look through all the state for changes
        this.setState({ fishes : this.state.fishes });
    },
    removeFish : function(key) {
        if(confirm("Are you sure you want to remove this fish?!")) {
            this.state.fishes[key] = null;
            this.setState({
                fishes : this.state.fishes
            });
        } 
    },
    loadSamples: function() {
        this.setState({
            fishes: require('../sample-fishes')
        });
    },
    renderFish: function(key){
        return <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder}/>
    },
    render: function() {
        return (
            <div className="catch-of-the-day">
                <div className="menu">
                    <Header tagline="Fresh Seafood Market"/>
                    <ul className="list-of-fishes">
                        {Object.keys(this.state.fishes).map(this.renderFish)}
                    </ul>
                </div>
                <Order 
                    fishes={this.state.fishes} 
                    order={this.state.order} 
                    removeFromOrder={this.removeFromOrder}
                />
                <Inventory 
                    addFish={this.addFish} 
                    loadSamples={this.loadSamples} 
                    fishes={this.state.fishes} 
                    linkState={this.linkState}
                    removeFish={this.removeFish}
                />
            </div>
        )
    }
});

export default App;
