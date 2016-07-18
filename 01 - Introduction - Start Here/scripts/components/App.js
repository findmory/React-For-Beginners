import React from 'react';

// two way data binding of nested objects.
// the built-in "LinkState" only works on the top level items
import Catalyst from 'react-catalyst';

import Header from './Header';
import Fish from './Fish';
import Inventory from './Inventory';
import Order from './Order';
import reactMixin from 'react-mixin';
import autobind from 'autobind-decorator'


//Firebase
import Rebase from 're-base';
var base = Rebase.createClass('https://findmory-cotd.firebaseio.com/');


@autobind  //makes "this" refer to the react component
class App extends React.Component {

    constructor() {
        super();

        this.state = {
            fishes: {},
            order: {}
        }
    }


    componentDidMount() {
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
    }

    componentWillUpdate(nextProps, nextState) {
        localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
    }

    addToOrder(key){
        this.state.order[key] = this.state.order[key] + 1 || 1;
        this.setState({order : this.state.order});
    }

    removeFromOrder(key) {
        delete this.state.order[key];
        this.setState({
            order : this.state.order
        })
    }

    addFish(fish) {
        var timestamp = (new Date()).getTime();
        //update the state object
        this.state.fishes['fish-' + timestamp] = fish;
        // set the state (so it rerenders) and only pass an oject of the state that has changed
        // so it doesn't have to look through all the state for changes
        this.setState({ fishes : this.state.fishes });
    }

    removeFish (key) {
        if(confirm("Are you sure you want to remove this fish?!")) {
            this.state.fishes[key] = null;
            this.setState({
                fishes : this.state.fishes
            });
        } 
    }

    loadSamples() {
        this.setState({
            fishes: require('../sample-fishes')
        });
    }

    renderFish(key){
        return <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder}/>
    }

    render() {
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
                    linkState={this.linkState.bind(this)}
                    removeFish={this.removeFish}
                    {...this.props}
                />
            </div>
        )
    }
};

reactMixin.onClass(App, Catalyst.LinkedStateMixin);

export default App;
