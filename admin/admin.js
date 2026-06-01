const SUPABASE_URL = 'https://pyzscraqjqilpqadcrky.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5enNjcmFxanFpbHBxYWRjcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzk5MTcsImV4cCI6MjA5NTkxNTkxN30.uiZOL9czYhBTeG_Nc_hI80RnaIlUkOs7wRg_hozpgcg'

const { createClient } = supabase
const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

const loginForm = document.querySelector('#login-form')
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = loginForm.email.value
    const password = loginForm.password.value
    const errorEl = document.querySelector('#login-error')

    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) {
      errorEl.textContent = 'Неверный email или пароль'
      return
    }
    window.location.href = 'dashboard.html'
  })
}

const logoutBtn = document.querySelector('#logout-btn')
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await sb.auth.signOut()
    window.location.href = 'login.html'
  })
}

const dashboardPage = document.querySelector('#tab-registrations')
if (dashboardPage) {
  checkAuth()
  setupTabs()
  loadRegistrations()
  loadCourses()
  setupCourseModal()
}

async function checkAuth() {
  const { data: { user } } = await sb.auth.getUser()
  if (!user) {
    window.location.href = 'login.html'
  }
}

function setupTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      document.querySelector(`#tab-${tab.dataset.tab}`).classList.add('active')
    })
  })
}

async function loadRegistrations() {
  const { data, error } = await sb
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    document.querySelector('#registrations-body').innerHTML =
      `<tr><td colspan="7" style="color:#ef4444;text-align:center">Ошибка загрузки</td></tr>`
    return
  }

  const tbody = document.querySelector('#registrations-body')
  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted)">Пока нет заявок</td></tr>`
    return
  }

  tbody.innerHTML = data.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.phone}</td>
      <td>${r.email || '—'}</td>
      <td>${r.selected_date || '—'}</td>
      <td><span class="status-badge status-badge--${r.status}">${statusLabel(r.status)}</span></td>
      <td>${formatDate(r.created_at)}</td>
    </tr>
  `).join('')
}

async function loadCourses() {
  const { data, error } = await sb.from('courses').select('*').order('created_at')

  const list = document.querySelector('#courses-list')
  if (error) {
    list.innerHTML = `<p style="color:#ef4444">Ошибка загрузки</p>`
    return
  }

  if (!data || data.length === 0) {
    list.innerHTML = `<p style="color:var(--color-text-muted)">Курсов пока нет</p>`
    return
  }

  list.innerHTML = data.map(c => `
    <div class="course-admin-card">
      <div class="course-admin-card__info">
        <h3>${c.title}</h3>
        <p>${c.duration} · ${c.format} · ${c.price.toLocaleString()} ₽</p>
      </div>
      <div class="course-admin-card__actions">
        <button class="btn btn--primary" onclick="editCourse(${c.id})">Изменить</button>
        <button class="btn" style="background:#ef4444;color:#fff;box-shadow:none" onclick="deleteCourse(${c.id})">Удалить</button>
      </div>
    </div>
  `).join('')
}

let editingCourseId = null

function setupCourseModal() {
  document.querySelector('#add-course-btn')?.addEventListener('click', () => openModal())
  document.querySelector('#modal-cancel')?.addEventListener('click', closeModal)
  document.querySelector('#course-form')?.addEventListener('submit', saveCourse)
  document.querySelector('#course-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal()
  })
}

function openModal(course = null) {
  editingCourseId = course?.id || null
  document.querySelector('#modal-title').textContent = course ? 'Редактировать курс' : 'Новый курс'
  const form = document.querySelector('#course-form')
  form.title.value = course?.title || ''
  form.description.value = course?.description || ''
  form.duration.value = course?.duration || ''
  form.format.value = course?.format || ''
  form.price.value = course?.price || ''
  form.old_price.value = course?.old_price || ''
  document.querySelector('#course-modal').classList.add('open')
}

function closeModal() {
  document.querySelector('#course-modal').classList.remove('open')
  editingCourseId = null
}

async function saveCourse(e) {
  e.preventDefault()
  const form = e.target
  const data = {
    title: form.title.value,
    description: form.description.value,
    duration: form.duration.value,
    format: form.format.value,
    price: parseInt(form.price.value),
    old_price: parseInt(form.old_price.value) || null,
  }

  const { error } = editingCourseId
    ? await sb.from('courses').update(data).eq('id', editingCourseId)
    : await sb.from('courses').insert(data)

  if (error) {
    alert('Ошибка сохранения: ' + error.message)
    return
  }

  closeModal()
  loadCourses()
}

async function editCourse(id) {
  const { data } = await sb.from('courses').select('*').eq('id', id).single()
  if (data) openModal(data)
}

async function deleteCourse(id) {
  if (!confirm('Удалить курс?')) return
  await sb.from('course_dates').delete().eq('course_id', id)
  await sb.from('program_modules').delete().eq('course_id', id)
  await sb.from('registrations').delete().eq('course_id', id)
  const { error } = await sb.from('courses').delete().eq('id', id)
  if (!error) loadCourses()
}

function statusLabel(s) {
  const map = { new: 'Новая', contacted: 'Связались', approved: 'Записан' }
  return map[s] || s
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
