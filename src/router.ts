import DocumentDetails from './views/dashboard/pages/documents/DocumentDetails.vue';
import DriveComponent from './views/dashboard/pages/documents/Drive.vue';
import DurableWebsite from './views/dashboard/pages/dapp/DurableWebsite.vue';
import index from './views/dashboard/Index.vue';
import MessagingComponent from './views/dashboard/pages/messaging/Messaging.vue';
import Router from 'vue-router';
import TemplateEditor from './views/dashboard/pages/TemplateEditor.vue';
import ViewerComponent from './views/dashboard/pages/documents/Viewer.vue';
import Vue from 'vue';
import WalletComponent from './views/dashboard/pages/wallet/Wallet.vue';


Vue.use(Router);

export default new Router({
  mode: "hash",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      // @ts-ignore
      component: index,

      children: [

        {
          path: "drive",
          name: "drive",
          // @ts-ignore
          component: DriveComponent,
        },
        {
          path: "/user/:user/details/:id",
          name: "details",
          // @ts-ignore
          component: DocumentDetails,
        },
        // {
        //   path: "messaging",
        //   name: "messaging",
        //   // @ts-ignore
        //   component: MessagingComponent
        // },
        {
          path: "wallet",
          name: "wallet",
          // @ts-ignore
          component: WalletComponent
        },
        {
          path: "viewer",
          name: "viewer",
          // @ts-ignore
          component: ViewerComponent,
        },
      ]
    },

    {
      path: "/fe",
      // @ts-ignore
      component: index,

      children: [


        {
          name: "Editor",
          path: "editor",
          // @ts-ignore
          component: TemplateEditor
        },
      ]
    }
  ]
});
