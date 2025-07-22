const API_BASE_URL = 'https://authflow-xzhn.onrender.com';
let currentUser = null;

function showPage(id) {
  document.querySelectorAll('.card').forEach(e => e.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  clearNotification();

  // Clear form fields when switching pages
  if (id === 'loginPage') {
    document.getElementById('loginName').value = '';
    document.getElementById('loginMobile').value = '';
  } else if (id === 'signupPage') {
    document.getElementById('signupName').value = '';
    document.getElementById('signupMobile').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupAddress').value = '';
    // Scroll signup button into view for accessibility
    setTimeout(() => {
      const btn = document.querySelector('#signupForm button[type="submit"]');
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  } else if (id === 'contactsPage') {
    document.getElementById('contactsInput').value = '';
  }
}

function showNotification(message, type = 'error') {
  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.className = `notification ${type}`;
  notif.classList.remove('hidden');
}
function clearNotification() {
  const notif = document.getElementById('notification');
  notif.textContent = '';
  notif.className = 'notification hidden';
}
function showLoading(show = true) {
  document.getElementById('loading').classList.toggle('hidden', !show);
}

async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = { method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' };
  if (data) options.body = JSON.stringify(data);
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Unknown error');
    return json;
  } catch (err) {
    throw err;
  }
}

function validateMobile(mobile) {
  return /^[0-9]{10}$/.test(mobile);
}
function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

// Login: uses /login, expects user in response
async function login(name, mobile) {
  if (!name || !mobile) {
    showNotification('Name and mobile are required.');
    return;
  }
  if (!validateMobile(mobile)) {
    showNotification('Mobile number must be 10 digits.');
    return;
  }
  showLoading(true);
  disableForm('loginForm', true);
  try {
    const { user } = await apiRequest('/login', 'POST', { name, mobile });
    currentUser = user;
    updateProfile();
    showPage('profilePage');
    showNotification('Login successful!', 'success');
    updateUserStatus();
  } catch (err) {
    showNotification(err.message || 'Login failed.');
  } finally {
    showLoading(false);
    disableForm('loginForm', false);
  }
}

// Signup: uses /signup, expects only message, then auto-login via /login
async function signup(name, mobile, email, address) {
  if (!name || !mobile || !email || !address) {
    showNotification('All fields are required.');
    return;
  }
  if (!validateMobile(mobile)) {
    showNotification('Mobile number must be 10 digits.');
    return;
  }
  if (!validateEmail(email)) {
    showNotification('Invalid email address.');
    return;
  }
  showLoading(true);
  disableForm('signupForm', true);
  try {
    await apiRequest('/signup', 'POST', { name, mobile, email, address });
    await login(name, mobile);
    showNotification('Signup successful!', 'success');
  } catch (err) {
    showNotification(err.message || 'Signup failed.');
  } finally {
    showLoading(false);
    disableForm('signupForm', false);
  }
}

function logout() {
  showLoading(true);
  apiRequest('/logout', 'POST').finally(() => {
    currentUser = null;
    updateUserStatus();
    showPage('loginPage');
    showNotification('Logged out.', 'success');
    showLoading(false);
  });
}

function updateProfile() {
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileMobile').textContent = `Mobile: ${currentUser.mobile}`;
  document.getElementById('profileEmail').textContent = `Email: ${currentUser.email}`;
  document.getElementById('profileAddress').textContent = `Address: ${currentUser.address}`;
}

function updateUserStatus() {
  const el = document.getElementById('userStatus');
  if (currentUser) {
    el.textContent = `Logged in as ${currentUser.name}`;
  } else {
    el.textContent = '';
  }
}

async function uploadContacts() {
  const input = document.getElementById('contactsInput').value;
  let contacts;
  try {
    contacts = JSON.parse(input);
    if (!Array.isArray(contacts)) throw new Error();
  } catch {
    contacts = input.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!contacts.length) {
    showNotification('Please enter at least one contact number.');
    return;
  }
  showLoading(true);
  disableContactsActions(true);
  try {
    const res = await apiRequest('/contacts/search', 'POST', { contacts });
    document.getElementById('foundContacts').innerHTML = res.found.length
      ? `<h4>Found:</h4>` + res.found.map(c =>
        `<p><i class="fas fa-user-check"></i> ${c.name} - ${c.mobile}${c.email ? ' - ' + c.email : ''}${c.address ? ' - ' + c.address : ''}</p>`
      ).join('') : '';
    document.getElementById('notFoundContacts').innerHTML = res.notFound.length
      ? `<h4>Not Found:</h4>` + res.notFound.map(m => `<p><i class="fas fa-user-times"></i> ${m}</p>`).join('') : '';
    showPage('contactsResultPage');
    showNotification('Contact search complete.', 'success');
  } catch (err) {
    showNotification(err.message || 'Contact search failed.');
    if (err.message === "Unauthorized") {
      showPage('loginPage');
      currentUser = null;
      updateUserStatus();
    }
  } finally {
    showLoading(false);
    disableContactsActions(false);
  }
}

function disableForm(formId, disabled) {
  const form = document.getElementById(formId);
  if (!form) return;
  Array.from(form.elements).forEach(el => {
    if (el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.disabled = disabled;
    }
  });
}
function disableContactsActions(disabled) {
  document.querySelectorAll('.contacts-actions button').forEach(btn => btn.disabled = disabled);
}

// Form listeners

document.getElementById('loginForm').onsubmit = e => {
  e.preventDefault();
  login(
    document.getElementById('loginName').value.trim(),
    document.getElementById('loginMobile').value.trim()
  );
};

document.getElementById('signupForm').onsubmit = e => {
  e.preventDefault();
  signup(
    document.getElementById('signupName').value.trim(),
    document.getElementById('signupMobile').value.trim(),
    document.getElementById('signupEmail').value.trim(),
    document.getElementById('signupAddress').value.trim()
  );
};

// On load, clear loading and notification
window.onload = () => {
  showLoading(false);
  clearNotification();
  updateUserStatus();
};
