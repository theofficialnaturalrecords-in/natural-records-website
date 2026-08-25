/*
  NATURAL RECORDS — SITE CONFIG
  -----------------------------
  1) Paste your Mailchimp form ACTION URL into MAILCHIMP_FORM_ACTION.
  2) Create a free Supabase project for the Community section.
  3) Paste its Project URL + anon key below, then run community.sql in
     Supabase SQL Editor. Never put a Supabase service-role key here.
*/
const MAILCHIMP_FORM_ACTION = "https://app.us16.list-manage.com/subscribe/post?u=34ab24e3bc3042bd196a59fde&id=a46bb9e78f&f_id=00e8c2e1f0";
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";

// ---------- Newsletter ----------
const form = document.getElementById('newsletter-form');
const status = document.getElementById('form-status');

if (MAILCHIMP_FORM_ACTION) form.action = MAILCHIMP_FORM_ACTION;

form.addEventListener('submit', (event) => {
  if (!MAILCHIMP_FORM_ACTION) {
    event.preventDefault();
    status.textContent = 'Newsletter setup is almost ready — connect the Mailchimp form URL in script.js.';
    status.style.color = '#f0d69a';
    return;
  }
  const email = document.getElementById('email');
  if (!email.checkValidity()) {
    event.preventDefault();
    status.textContent = 'Drop in a valid email address.';
    status.style.color = '#f0d69a';
  }
});

// ---------- Coming soon ----------
document.querySelectorAll('[data-coming-soon]').forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    alert('This is coming soon — we are building it. ✦');
  });
});

// ---------- Community ----------
const communityAuth = document.getElementById('community-auth');
const communityMember = document.getElementById('community-member');
const authForm = document.getElementById('auth-form');
const authStatus = document.getElementById('auth-status');
const authSubmit = document.getElementById('auth-submit');
const authName = document.getElementById('auth-name');
const authNameLabel = document.getElementById('auth-name-label');
const memberName = document.getElementById('member-name');
const logoutButton = document.getElementById('logout-button');
const messageForm = document.getElementById('message-form');
const messageBody = document.getElementById('message-body');
const messageCount = document.getElementById('message-count');
const messageStatus = document.getElementById('message-status');
const communityFeed = document.getElementById('community-feed');
const refreshCommunity = document.getElementById('refresh-community');
const authTabs = document.querySelectorAll('[data-auth-mode]');

let authMode = 'login';
let supabaseClient = null;

function setStatus(element, text, good = false) {
  element.textContent = text;
  element.style.color = good ? '#53715b' : '#9a684d';
}

function setAuthMode(mode) {
  authMode = mode;
  authTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.authMode === mode));
  const signup = mode === 'signup';
  authName.classList.toggle('hidden', !signup);
  authNameLabel.classList.toggle('hidden', !signup);
  authName.required = signup;
  authName.autocomplete = signup ? 'name' : 'off';
  authSubmit.innerHTML = signup ? 'Create account <span>→</span>' : 'Log in <span>→</span>';
  authStatus.textContent = '';
}

authTabs.forEach((tab) => tab.addEventListener('click', () => setAuthMode(tab.dataset.authMode)));

function communityConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
}

function initials(name) {
  const parts = (name || 'N').trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]).toUpperCase();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function relativeTime(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderMessages(messages) {
  if (!messages?.length) {
    communityFeed.innerHTML = '<p class="feed-empty">No messages yet. Be the first to say hi. ✦</p>';
    return;
  }
  communityFeed.innerHTML = messages.map((message) => `
    <article class="message-item">
      <div class="message-avatar" aria-hidden="true">${escapeHtml(initials(message.author_name))}</div>
      <div>
        <div class="message-meta">
          <strong>${escapeHtml(message.author_name)}</strong>
          <time datetime="${escapeHtml(message.created_at)}">${escapeHtml(relativeTime(message.created_at))}</time>
        </div>
        <p class="message-body">${escapeHtml(message.body)}</p>
      </div>
    </article>
  `).join('');
}

async function loadMessages() {
  if (!supabaseClient) {
    communityFeed.innerHTML = '<p class="feed-empty">Community is ready — connect Supabase in script.js to turn it on.</p>';
    return;
  }
  const { data, error } = await supabaseClient
    .from('community_messages')
    .select('id, author_id, author_name, body, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    communityFeed.innerHTML = '<p class="feed-empty">The community feed could not load yet. Check the Supabase setup.</p>';
    console.error(error);
    return;
  }
  renderMessages(data);
}

function showLoggedOut() {
  communityAuth.classList.remove('hidden');
  communityMember.classList.add('hidden');
}

function showLoggedIn(user) {
  communityAuth.classList.add('hidden');
  communityMember.classList.remove('hidden');
  const name = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'friend';
  memberName.textContent = name;
}

async function refreshAuthState() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user) showLoggedIn(data.session.user);
  else showLoggedOut();
}

if (communityConfigured()) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session?.user) showLoggedIn(session.user);
    else showLoggedOut();
  });
  refreshAuthState();
  loadMessages();
} else {
  // Keep the section usable as a preview without pretending auth is live.
  showLoggedOut();
  communityFeed.innerHTML = '<p class="feed-empty">Community is ready — connect Supabase in script.js to turn it on.</p>';
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    setStatus(authStatus, 'Connect Supabase in script.js first.');
    return;
  }
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const name = authName.value.trim();
  authSubmit.disabled = true;
  setStatus(authStatus, authMode === 'signup' ? 'Creating your account…' : 'Logging you in…');

  let result;
  if (authMode === 'signup') {
    result = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } }
    });
  } else {
    result = await supabaseClient.auth.signInWithPassword({ email, password });
  }

  authSubmit.disabled = false;
  if (result.error) {
    setStatus(authStatus, result.error.message);
    return;
  }

  if (authMode === 'signup' && !result.data.session) {
    setStatus(authStatus, 'Account created. Check your email to confirm it, then log in.', true);
    return;
  }
  setStatus(authStatus, 'You are in. ✦', true);
  authForm.reset();
});

logoutButton.addEventListener('click', async () => {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
});

messageBody.addEventListener('input', () => {
  messageCount.textContent = `${messageBody.value.length} / 1000`;
});

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    setStatus(messageStatus, 'Connect Supabase in script.js first.');
    return;
  }
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const user = sessionData.session?.user;
  const body = messageBody.value.trim();
  if (!user) {
    setStatus(messageStatus, 'Please log in before posting.');
    return;
  }
  if (!body) return;

  const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';
  const submitButton = messageForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  setStatus(messageStatus, 'Posting…');

  const { error } = await supabaseClient.from('community_messages').insert({
    author_id: user.id,
    author_name: displayName,
    body
  });

  submitButton.disabled = false;
  if (error) {
    setStatus(messageStatus, error.message);
    return;
  }
  messageForm.reset();
  messageCount.textContent = '0 / 1000';
  setStatus(messageStatus, 'Posted. ✦', true);
  await loadMessages();
});

refreshCommunity.addEventListener('click', loadMessages);
