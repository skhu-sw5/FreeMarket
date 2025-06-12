import { createStore } from 'vuex'
import auth from './modules/auth'
import products from './modules/products'
import emailVerification from './modules/emailVerification'
import reviews from './modules/reviews'
import chat from './modules/chat'
import ui from './modules/ui'

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth,
    products,
    emailVerification,
    reviews,
    chat,
    ui
  }
})
