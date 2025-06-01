import { createStore } from 'vuex'
import auth from './modules/auth'
import products from './modules/products'
import emailVerification from './modules/emailVerification'
import reviews from './modules/reviews'

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
    reviews
  }
})
