import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Axios from './utils/Custom_Axios'
import SummaryAPI from './common/summaryAPI'
import { setUserDetail, clearUserDetail } from './store/userSlice'
import './App.css'

function App() {
  const dispatch = useDispatch()

  const fetchUser = async () => {
    try {
      const response = await Axios({
        ...SummaryAPI.get_user
      })
      if (response.data.success) {
        dispatch(setUserDetail(response.data.data))
      } else {
        dispatch(clearUserDetail())
      }
    } catch (error) {
      console.log("Error fetching user", error)
      dispatch(clearUserDetail())
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}

export default App
