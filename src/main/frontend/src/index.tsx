import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './utils/App';
import registerServiceWorker from './utils/registerServiceWorker';
import './utils/bootstrap.min.css'

ReactDOM.render(
    <App/>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
