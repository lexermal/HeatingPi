(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{19:function(e,t,n){e.exports={input:"EditableLabel_input__2MCX0"}},20:function(e,t,n){e.exports={switch:"LabelSwitch_switch__aiIPQ"}},24:function(e,t,n){e.exports=n(42)},29:function(e,t,n){},31:function(e,t,n){},39:function(e,t,n){},42:function(e,t,n){"use strict";n.r(t);var a=n(1),o=n(9),l=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function i(e){navigator.serviceWorker.register(e).then(function(e){e.onupdatefound=function(){var t=e.installing;t&&(t.onstatechange=function(){"installed"===t.state&&(navigator.serviceWorker.controller?console.log("New content is available; please refresh."):console.log("Content is cached for offline use."))})}}).catch(function(e){console.error("Error during service worker registration:",e)})}n(29),n(31);var r=n(5),c=n(3),s=n(22),u=n.n(s),h=n(43),m=n(45),p=n(44),d=n(10),f=n.n(d),v=function(){function e(){}return e.prototype.getPins=function(e,t,n){console.log("Remoe this workaround"),this.callGraphql("\nquery{\n\tpins{\n\t\tid\n\t\tname\n\t}\n}\n",function(t){return e(t.pins.sort(function(e,t){return e.id>t.id?1:-1}))},t)},e.prototype.getSchemas=function(e,t){this.callGraphql("\nquery{\nschema{\n\tname\n\tid\n\tactive\n}\n}\n",function(t){return e(t.schema.sort(function(e,t){return e.name>t.name?1:-1}))},t)},e.prototype.callGraphql=function(e,t,n){fetch("http://localhost:9000/graphql",{method:"post",headers:new Headers({"Content-Type":"application/json"}),body:JSON.stringify({query:e})}).then(function(e){return e.json()}).then(function(e){t(e.data)}).catch(function(e){n(e)})},e}(),E=n(19),g=n.n(E),w=function(e){function t(t,n){var a=e.call(this,t,n)||this;return a.state={value:t.value||"",defaultvalue:t.value||""},a.onChange=a.onChange.bind(a),a}return r.a(t,e),t.prototype.render=function(){var e=this;return a.createElement("input",{className:g.a.input,value:this.state.value,onChange:function(t){return e.setState({value:t.target.value})},onKeyPress:this.onChange,onBlur:function(t){e.state.defaultvalue!==t.target.value&&(e.setState({defaultvalue:t.target.value}),e.props.onSumbit(t.target.value))}})},t.prototype.onChange=function(e){9!==e.which&&13!==e.which||e.target.blur()},t}(a.Component),b=n(8),S=n(20),y=n.n(S),N=function(e){function t(t,n){var a=e.call(this,t,n)||this;return a.state={index:t.defaultindex||0,defaultindex:t.defaultindex||0},a.onSave=a.onSave.bind(a),a.onClick=a.onClick.bind(a),a}return r.a(t,e),t.prototype.render=function(){return a.createElement("div",{title:this.props.tooltip,onClick:this.onClick,className:y.a.switch,onMouseOut:this.onSave},this.props.switchlist[this.state.index][0])},t.prototype.onClick=function(e){this.setState({index:this.state.index+1<this.props.switchlist.length?this.state.index+1:0})},t.prototype.onSave=function(){this.state.index!==this.state.defaultindex&&(this.setState({defaultindex:this.state.index}),this.props.onChange(this.props.switchlist[this.state.index][1]))},t}(a.Component),C=function(e){function t(t){var n=e.call(this,t)||this;return n.state={pins:[void 0]},(new v).getPins(function(e){return n.setState({pins:e})},function(e){return console.error(e)}),n.saveName=n.saveName.bind(n),n}return r.a(t,e),t.prototype.render=function(){var e=this;return a.createElement(c.c,null,a.createElement("h1",null,"Overview of all Pins"),a.createElement(f.a,null,a.createElement(c.l,null,a.createElement("tbody",null,a.createElement("tr",null,a.createElement("th",null,"Pinnumber"),a.createElement("th",null,"Name"),a.createElement("th",null,"Defaultvalue")),this.state.pins.filter(function(e){return void 0!==e&&null!==e}).map(function(t){return a.createElement("tr",{key:t.id},a.createElement("td",null,t.id),a.createElement("td",null,a.createElement(w,{value:t.name,onSumbit:function(n){return e.saveName(t.id,n)}})),a.createElement("td",null,a.createElement(N,{tooltip:"Click to change",switchlist:[["Active","true"],["Deactivated","false"]],onChange:function(n){return e.saveDefaultState(t.id,n)}})))})))))},t.prototype.saveName=function(e,t){console.log("SAVE : "+e+" with value: "+t),b.success("The changes have successfully been saved.")},t.prototype.saveDefaultState=function(e,t){console.log("SAVE : "+e+" with value: "+t),b.success("The changes have successfully been saved.")},t}(a.Component),k=(n(39),function(e){function t(t){var n=e.call(this,t)||this;return n.state={modal:!1},n.toggle=n.toggle.bind(n),n}return r.a(t,e),t.prototype.render=function(){var e=this;return a.createElement("div",null,a.createElement("div",{className:this.props.className,onClick:this.toggle},this.props.buttonLabel),a.createElement(c.d,{isOpen:this.state.modal,toggle:this.toggle},a.createElement(c.g,{toggle:this.toggle},this.props.title),a.createElement(c.e,null,this.props.children),a.createElement(c.f,null,a.createElement(c.a,{color:"primary",onClick:function(){e.toggle(),e.props.onSubmit()}},this.props.submitText||"Ok")," ",a.createElement(c.a,{color:"secondary",onClick:this.toggle},this.props.cancelText||"Cancel"))))},t.prototype.toggle=function(){this.setState({modal:!this.state.modal})},t}(a.Component)),x=function(e){function t(t){var n=e.call(this,t)||this;return n.state={pins:[void 0],modified:!1},(new v).getPins(function(e){return n.setState({pins:e})},function(e){return console.error(e)},-1!==t.schema?t.schema:void 0),n.saveName=n.saveName.bind(n),n}return r.a(t,e),t.prototype.componentWillReceiveProps=function(e,t){e.saveNow&&this.state.modified&&(this.setState({modified:!1}),this.props.onSave(this.props.schema,this.state.pins))},t.prototype.render=function(){var e=this;return a.createElement(c.c,null,a.createElement(f.a,null,a.createElement(c.l,null,a.createElement("tbody",null,a.createElement("tr",null,a.createElement("th",null,"Pinnumber"),a.createElement("th",null,"Name"),a.createElement("th",null,"State")),this.state.pins.filter(function(e){return void 0!==e&&null!==e}).sort(function(e,t){return e.id>t.id?1:-1}).map(function(t){return a.createElement("tr",{key:t.id},a.createElement("td",null,t.id),a.createElement("td",null,t.name),a.createElement("td",null,a.createElement(N,{defaultindex:t.state,tooltip:"Click to change",switchlist:[["unmodified","2"],["active","1"],["deactivated","0"]],onChange:function(n){return e.saveState(t.id,n)}})))})))))},t.prototype.saveName=function(e,t){var n=this.state.pins,a=n.splice(n.findIndex(function(t){return t.id===e}),1)[0];a.name=t,n.push(a),this.setState({pins:n,modified:!0})},t.prototype.saveState=function(e,t){var n=this.state.pins,a=n.splice(n.findIndex(function(t){return t.id===e}),1)[0];a.state=+t,n.push(a),this.setState({pins:n,modified:!0})},t}(a.Component),P=function(e){function t(t){var n=e.call(this,t)||this;return n.state={schema:[void 0],hoverindex:-1,saveNow:!1,newPinSchema:[void 0]},(new v).getSchemas(function(e){return n.setState({schema:e})},function(e){return console.error(e)}),n.saveName=n.saveName.bind(n),n.saveNewSchema=n.saveNewSchema.bind(n),n}return r.a(t,e),t.prototype.componentWillUpdate=function(e,t,n){console.log(t.schema)},t.prototype.render=function(){var e=this;return a.createElement(c.c,null,a.createElement("h1",null,"Overview of all Schemas"),a.createElement(k,{className:"btn btn-primary",title:"Add a new schema",buttonLabel:"Add schema",onSubmit:this.saveNewSchema},a.createElement("input",{placeholder:"Name"}),a.createElement(x,{schema:-1,saveNow:this.state.saveNow,onSave:function(t,n){return e.setState({newPinSchema:n})}})),a.createElement(f.a,null,a.createElement(c.l,null,a.createElement("tbody",null,a.createElement("tr",null,a.createElement("th",null,"Id"),a.createElement("th",null,"Name"),a.createElement("th",null,"Active"),a.createElement("th",null),a.createElement("th",null)),this.state.schema.filter(function(e){return void 0!==e&&null!==e}).map(function(t){return a.createElement("tr",{key:t.id,className:"schemaview"},a.createElement("td",null,t.id),a.createElement("td",null,a.createElement(w,{value:t.name,onSumbit:function(n){return e.saveName(t.id,n)}})),a.createElement("td",null,a.createElement(N,{tooltip:"Click to change",switchlist:[["Active","true"],["Deactivated","false"]],onChange:function(n){return e.saveDefaultState(t.id,n)}})),a.createElement("td",{className:"text-right"},a.createElement(k,{className:"btn btn-warning hoverbutton",title:t.name,buttonLabel:"Edit",onSubmit:function(){return e.setState({saveNow:!0})},submitText:"Save"},a.createElement(x,{schema:t.id,saveNow:e.state.saveNow,onSave:e.saveEditedPins})),a.createElement(k,{className:"btn btn-danger hoverbutton",submitText:"Yes",title:"Delete the following element?",buttonLabel:"Delete",onSubmit:function(){return e.deleteSchema(t.id)}},a.createElement("h3",null,t.name))))})))))},t.prototype.saveNewSchema=function(){this.setState({saveNow:!0}),console.log("SAVE : 2 with value: 2"),b.success("The changes have successfully been saved.")},t.prototype.saveName=function(e,t){console.log("SAVE : "+e+" with value: "+t),b.success("The changes have successfully been saved.")},t.prototype.saveDefaultState=function(e,t){console.log("SAVE : "+e+" with value: "+t),b.success("The changes have successfully been saved.")},t.prototype.deleteSchema=function(e){console.log("DELETE Schema : "+e),b.success("The schema was successfully delete.")},t.prototype.saveEditedPins=function(e,t){b.warning("Graphqlzeug implementieren und das vollgende schema ver\xe4ndern "+this.props.schema)},t}(a.Component),T=function(e){function t(t,n){return e.call(this,t,n)||this}return r.a(t,e),t.prototype.render=function(){return a.createElement(m.a,null,a.createElement("div",null,this.props.children,a.createElement(p.a,{exact:!0,path:"/",component:this.Home}),a.createElement(p.a,{path:"/about",component:this.About}),a.createElement(p.a,{path:"/topics",component:this.Topics}),a.createElement(p.a,{exact:!0,path:"/pins",component:C}),a.createElement(p.a,{exact:!0,path:"/schema",component:P})))},t.prototype.Home=function(){return a.createElement("div",null,a.createElement("h2",null,"Home"),"Home page, have fun ")},t.prototype.About=function(){return a.createElement("h2",null,"About")},t.prototype.Topics=function(e){return a.createElement("div",null,a.createElement("h2",null,"Topics"),a.createElement("ul",null,a.createElement("li",null,a.createElement(h.a,{to:e.match.url+"/components"},"Components")),a.createElement("li",null,a.createElement(h.a,{to:e.match.url+"/props-v-state"},"Props v. State"))),a.createElement(p.a,{path:e.match.path+"/:id",component:function(e){return console.log(e),a.createElement("h3",null,"Requested Param: ",e.match.params.id)}}),a.createElement(p.a,{exact:!0,path:e.match.path,render:function(){return a.createElement("h3",null,"Please select a topic.")}}))},t}(a.Component),A=function(e){function t(t){var n=e.call(this,t)||this;return n.toggle=n.toggle.bind(n),n.state={isOpen:!1},n}return r.a(t,e),t.prototype.render=function(){return a.createElement(T,null,a.createElement("div",null,a.createElement(c.i,{color:"primary",light:!0,expand:"md"},a.createElement(c.j,{href:"/"},"HeizungsPi"),a.createElement(c.k,{onClick:this.toggle}),a.createElement(c.b,{isOpen:this.state.isOpen,navbar:!0},a.createElement(u.a,{className:"ml-auto",navbar:!0},a.createElement(c.h,null,a.createElement(h.a,{className:"nav-link",to:"/pins"},"Pins")),a.createElement(c.h,null,a.createElement(h.a,{className:"nav-link",to:"/schema"},"Schema")),a.createElement(c.h,null,a.createElement(h.a,{className:"nav-link",to:"/active"},"Active")))))))},t.prototype.toggle=function(){this.setState({isOpen:!this.state.isOpen})},t}(a.Component);o.render(a.createElement(A,null),document.getElementById("root")),function(){if("serviceWorker"in navigator){if(new URL("",window.location.toString()).origin!==window.location.origin)return;window.addEventListener("load",function(){var e="/service-worker.js";l?(function(e){fetch(e).then(function(t){404===t.status||-1===t.headers.get("content-type").indexOf("javascript")?navigator.serviceWorker.ready.then(function(e){e.unregister().then(function(){window.location.reload()})}):i(e)}).catch(function(){console.log("No internet connection found. App is running in offline mode.")})}(e),navigator.serviceWorker.ready.then(function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://goo.gl/SC7cgQ")})):i(e)})}}()}},[[24,2,1]]]);
//# sourceMappingURL=main.33fe1791.chunk.js.map