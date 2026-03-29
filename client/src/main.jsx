import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { login } from './slice/authSlice.js'

const authData = JSON.parse(localStorage.getItem('auth'))

if (authData && authData.token && authData.username && authData.role) {
  console.log("Local Storage to Redux Store: ", authData)
  store.dispatch(login(authData))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
