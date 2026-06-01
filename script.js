const SUPABASE_URL = 'https://pyzscraqjqilpqadcrky.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5enNjcmFxanFpbHBxYWRjcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzk5MTcsImV4cCI6MjA5NTkxNTkxN30.uiZOL9czYhBTeG_Nc_hI80RnaIlUkOs7wRg_hozpgcg'

const { createClient } = supabase
const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle')
  const nav = document.querySelector('.nav')

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('nav--open')
    })
  }

  const signupForm = document.querySelector('#signup-form')
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault()

      const formData = new FormData(signupForm)
      const data = {}
      formData.forEach((value, key) => { data[key] = value })

      const btn = signupForm.querySelector('button[type="submit"]')
      const originalText = btn.textContent
      btn.textContent = 'Отправка...'
      btn.disabled = true

      try {
        const { error } = await sb.from('registrations').insert({
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          selected_date: data.date || null,
          course_id: 1,
          status: 'new'
        })

        if (error) throw error

        signupForm.reset()
        btn.textContent = '✓ Заявка отправлена!'
      } catch (err) {
        console.error('Ошибка:', err)
        btn.textContent = '✗ Ошибка, попробуйте позже'
      }

      btn.disabled = false
      setTimeout(() => { btn.textContent = originalText }, 3000)
    })
  }

  const contactForm = document.querySelector('#contact-form')
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault()

      const formData = new FormData(contactForm)
      const data = {}
      formData.forEach((value, key) => { data[key] = value })

      const btn = contactForm.querySelector('button[type="submit"]')
      const originalText = btn.textContent
      btn.textContent = 'Отправка...'
      btn.disabled = true

      try {
        const { error } = await sb.from('registrations').insert({
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          course_id: 1,
          status: 'new'
        })

        if (error) throw error

        contactForm.reset()
        btn.textContent = '✓ Отправлено!'
      } catch (err) {
        console.error('Ошибка:', err)
        btn.textContent = '✗ Ошибка'
      }

      btn.disabled = false
      setTimeout(() => { btn.textContent = originalText }, 3000)
    })
  }
})
