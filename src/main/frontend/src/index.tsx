import './assets/toastr.min.css'
import './assets/bootstrap.min.css'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import GenericView from './views/GenericView/GenericView'
import registerServiceWorker from './utils/registerServiceWorker'

ReactDOM.render(<GenericView/>, document.getElementById('root') as HTMLElement)
registerServiceWorker()
