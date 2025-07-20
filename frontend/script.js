const API_BASE_URL = 'http://127.0.0.1:5000';
let currentUser = null;

function showPage(id) {
  document.querySelectorAll('.card').forEach(e => e.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = { method, 
                    headers: {'Content-Type': 'application/json'}, 
                    credentials: 'include' };
  if (data) options.body = JSON.stringify(data);
  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

// Login: uses /login, expects user in response
async function login(name, mobile) {
  const { user } = await apiRequest('/login', 'POST', { name, mobile });
  currentUser = user;
  updateProfile();
  showPage('profilePage');
}

// Signup: uses /signup, expects only message, then auto-login via /login
async function signup(name, mobile, email, address) {
  await apiRequest('/signup', 'POST', { name, mobile, email, address });
  // After signup, login to get JWT and user info
  await login(name, mobile);
}

function logout() {
  apiRequest('/logout', 'POST').finally(() => {
    currentUser = null;
    showPage('loginPage');
  });
}

function updateProfile() {
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileMobile').textContent = currentUser.mobile;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('profileAddress').textContent = currentUser.address;
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
  try {
    const res = await apiRequest('/contacts/search', 'POST', { contacts });
    document.getElementById('foundContacts').innerHTML = res.found.map(c =>
      `<p>${c.name} - ${c.mobile}${c.email ? ' - ' + c.email : ''}${c.address ? ' - ' + c.address : ''}</p>`
    ).join('');
    document.getElementById('notFoundContacts').innerHTML = res.notFound.map(m => `<p>${m}</p>`).join('');
    showPage('contactsResultPage');
  } catch (err) {
    alert(err.message); // Show error to user
    if (err.message === "Unauthorized") {
      showPage('loginPage');
    }
  }
}

// Form listeners
document.getElementById('loginForm').onsubmit = e => {
  e.preventDefault();
  login(
    document.getElementById('loginName').value,
    document.getElementById('loginMobile').value
  );
};

document.getElementById('signupForm').onsubmit = e => {
  e.preventDefault();
  signup(
    document.getElementById('signupName').value,
    document.getElementById('signupMobile').value,
    document.getElementById('signupEmail').value,
    document.getElementById('signupAddress').value
  );
};
