import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './utils/registerServiceWorker';
import './assets/bootstrap.min.css'
import './assets/toastr.min.css'
import GenericView from './views/GenericView'

ReactDOM.render(
    <GenericView/>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
