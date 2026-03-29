
import './App.css'

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={!auth.isAuthenticated ? <Login /> : <Navigate to='/' />} />
          <Route path="signup" element={!auth.isAuthenticated ? <SignUp /> : <Navigate to='/' />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>
      </>
    )
  )
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  )
}

export default App
