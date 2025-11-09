import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MedicineReminder = () => {

  const { backendUrl, token } = useContext(AppContext)
  
  const [reminders, setReminders] = useState([])
  const [medicineName, setMedicineName] = useState('')
  const [dosage, setDosage] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch reminders on component mount
  useEffect(() => {
    if (token) {
      fetchReminders()
    }
  }, [token])

  // Fetch all reminders
  const fetchReminders = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/reminders/list', { headers: { token } })
      
      if (data.success) {
        setReminders(data.reminders)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Add new reminder
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.post(
        backendUrl + '/api/reminders/add',
        { medicineName, dosage, time },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        // Clear form
        setMedicineName('')
        setDosage('')
        setTime('')
        // Refresh list
        fetchReminders()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Delete reminder
  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        backendUrl + '/api/reminders/' + id,
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        // Refresh list
        fetchReminders()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <div className='min-h-[80vh] py-10'>
      <div className='max-w-4xl mx-auto'>
        
        {/* Header */}
        <div className='text-center mb-8'>
          <p className='text-3xl font-semibold text-gray-800'>Medicine Reminder</p>
          <p className='text-gray-600 mt-2'>Never miss your medication</p>
        </div>

        {/* Add Reminder Form */}
        <div className='bg-white p-8 rounded-lg shadow-md mb-8'>
          <p className='text-xl font-semibold text-gray-700 mb-4'>Add New Reminder</p>
          
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            
            <div>
              <label className='text-gray-600 font-medium mb-2 block'>Medicine Name</label>
              <input
                type='text'
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder='e.g., Aspirin'
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
                required
              />
            </div>

            <div>
              <label className='text-gray-600 font-medium mb-2 block'>Dosage</label>
              <input
                type='text'
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder='e.g., 500mg'
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
                required
              />
            </div>

            <div>
              <label className='text-gray-600 font-medium mb-2 block'>Time</label>
              <input
                type='time'
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary'
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='bg-primary text-white py-3 px-8 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 font-medium mt-2'
            >
              {loading ? 'Adding...' : 'Add Reminder'}
            </button>
          </form>
        </div>

        {/* Reminders List */}
        <div className='bg-white p-8 rounded-lg shadow-md'>
          <p className='text-xl font-semibold text-gray-700 mb-4'>
            My Reminders ({reminders.length})
          </p>

          {reminders.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <p>No reminders yet. Add your first reminder above!</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {reminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <p className='text-lg font-semibold text-gray-800'>
                        {reminder.medicineName}
                      </p>
                      <p className='text-gray-600 mt-1'>
                        <span className='font-medium'>Dosage:</span> {reminder.dosage}
                      </p>
                      <p className='text-gray-600 mt-1'>
                        <span className='font-medium'>Time:</span> {reminder.time}
                      </p>
                      <p className='text-gray-400 text-sm mt-2'>
                        Added: {new Date(reminder.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(reminder._id)}
                      className='bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all font-medium'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicineReminder


