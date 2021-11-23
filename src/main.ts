import App from './App.vue';
import router from './router';
import store from './store';
import Vue from 'vue';
import VueSkycons from 'vue-skycons';
import vuetify from './plugins/vuetify';
import './plugins/base';
import './plugins/chartist';
import './plugins/vee-validate';
import './plugins/appconfig';
import Vuebar from 'vuebar';


import GAuth from 'vue-google-oauth2'
import Cryptoicon from 'vue-cryptoicon';
// For all icons
import icon from 'vue-cryptoicon/src/icons';
import VueCodemirror from 'vue-codemirror'
 
// require styles
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/lib/codemirror';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/comment-fold';
import '@codemirror/fold'
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript'

Cryptoicon.add(icon);
Vue.use(Cryptoicon);

const gauthOption = {
  clientId: '779014570531-bvmnb5bq69uov2cc1vkr4jhh03pgdrvj.apps.googleusercontent.com',
  scope: 'profile email',
  prompt: 'select_account'
}
Vue.use(GAuth, gauthOption)
// @ts-nocheck
// @ts-ignore
Vue.use(VueSkycons, {
    color: '#1e88e5'
});

Vue.use(Vuebar);
// Vue.use(VueWorker)
Vue.config.productionTip = true;


// require more codemirror resource...
 
// you can set default global options and events when use
Vue.use(VueCodemirror, /* { 
  options: { theme: 'base16-dark', ... },
  events: ['scroll', ...]
} */)


// @ts-ignore
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
