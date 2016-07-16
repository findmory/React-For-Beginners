/*
    StorePicker
    This will let us make <StorePicker/>
*/

import React from 'react';
import { History } from 'react-router';
import h from '../helpers';
import reactMixin from 'react-mixin';
import autobind from 'autobind-decorator';

@autobind
class StorePicker extends React.Component {

    goToStore(event){
        event.preventDefault();
        console.log('ya submitted it', this.refs);
        //get the data from the input
        var storeId = this.refs.storeId.value;
        //transition from StorePicker to App
        this.history.pushState( null, '/store/' + storeId);
    }

    render() {
        return (
            /* comments need to be like this in JSX */
            <form className="store-selector" onSubmit={this.goToStore}>
                <h2>Please Enter A Store</h2>
                <input type="text" ref="storeId" defaultValue={h.getFunName()} required/>
                <input type="Submit" value="Submit"/>
            </form>
        )
    }
};

reactMixin.onClass(StorePicker, History);

export default StorePicker;