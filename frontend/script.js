// Configuration
const API_URL = 'http://localhost:8000';

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const modeBtns = document.querySelectorAll('.mode-btn');
const newChatBtn = document.getElementById('newChatBtn');
const logoutBtn = document.getElementById('logoutBtn');
const profileNameEl = document.getElementById('profileName');
const profileEmailEl = document.getElementById('profileEmail');
const profileAvatarEl = document.getElementById('profileAvatar');
const futureNoticeEl = document.getElementById('futureNotice');

// State
let currentMode = 'scholar';
let currentConversationId = null;
let unsubscribeConversations = null;
let unsubscribeMessages = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Auth guard: require Firebase user, otherwise redirect to login
    try {
        // Wait briefly for AuthAPI to attach (handles slow CDN)
        let retries = 20;
        while (!window.AuthAPI && retries-- > 0) {
            await new Promise(r => setTimeout(r, 50));
        }
        if (!window.AuthAPI) throw new Error('Auth not initialized');
        await window.AuthAPI.ensureReady();
        const { onAuthStateChanged } = window.firebaseAuthModule;
        onAuthStateChanged(window.firebaseAuth, (user) => {
            if (!user) {
                window.location.replace('auth/login.html');
                return;
            }
            if (profileNameEl) profileNameEl.textContent = user.displayName || 'Profile';
            if (profileEmailEl) profileEmailEl.textContent = user.email || '';
            if (profileAvatarEl) profileAvatarEl.textContent = (user.displayName && user.displayName[0]) ? user.displayName[0].toUpperCase() : 'U';
            // Subscribe to recent conversations
            if (unsubscribeConversations) { try { unsubscribeConversations(); } catch (e) {} }
            unsubscribeConversations = window.ChatStore?.subscribeConversations?.(user.uid, (items) => {
                renderConversations(items);
            });
            setupEventListeners();
            autoResizeTextarea();
        });
    } catch (e) {
        // If auth failed to load, redirect to login as a fallback
        window.location.replace('auth/login.html');
    }
});

// Event Listeners
function setupEventListeners() {
    // Send button
    sendBtn.addEventListener('click', handleSendMessage);
    
    // Enter key to send (Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Mode selector
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            if (currentMode === 'advanced' && futureNoticeEl) {
                futureNoticeEl.textContent = 'Advanced mode is coming soon – we\'re working on it.';
                setTimeout(() => { if (futureNoticeEl) futureNoticeEl.textContent = ''; }, 3000);
            }
        });
    });

    // New chat clears messages (no persistence yet)
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            chatContainer.innerHTML = `
            <div class="message assistant-message">
                <div class="message-avatar">🕉️</div>
                <div class="message-content">
                    <p>Namaste! 🙏</p>
                    <p>I am your Sanātana Dharma Knowledge Assistant. Ask me anything about the Bhagavad-Gītā, Hindu philosophy, or spiritual wisdom.</p>
                    <div class="example-questions">
                        <p><strong>Example questions:</strong></p>
                        <button class="example-btn" data-question="What is dharma in the Gita?">What is dharma?</button>
                        <button class="example-btn" data-question="Explain karma yoga">Explain karma yoga</button>
                        <button class="example-btn" data-question="Who is Krishna?">Who is Krishna?</button>
                        <button class="example-btn" data-question="What does the Gita teach about meditation?">What about meditation?</button>
                    </div>
                </div>
            </div>`;
        });
    }
    // Input option buttons (future features)
    document.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const label = btn.getAttribute('title') || btn.dataset.opt;
            if (futureNoticeEl) {
                futureNoticeEl.textContent = `${label} is coming soon – we're working on it.`;
                setTimeout(() => { if (futureNoticeEl) futureNoticeEl.textContent = ''; }, 3000);
            }
        });
    });
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try { if (window.AuthAPI) { await window.AuthAPI.signOut(); } } catch (e) {}
            window.location.replace('auth/login.html');
        });
    }
    
    // Example questions and recent chat interactions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('example-btn')) {
            const question = e.target.dataset.question;
            messageInput.value = question;
            handleSendMessage();
        }
        if (e.target.classList.contains('convo-item') || e.target.classList.contains('convo-title')) {
            const item = e.target.classList.contains('convo-item') ? e.target : e.target.closest('.convo-item');
            const conversationId = item && item.getAttribute('data-id');
            if (conversationId) {
                loadConversationMessages(conversationId).catch(() => {});
            }
        }
        if (e.target.classList.contains('convo-menu')) {
            const actions = e.target.closest('.convo-actions');
            const menu = actions && actions.querySelector('.convo-menu-popup');
            if (menu) {
                e.stopImmediatePropagation();
                const isOpen = menu.style.display === 'block';
                document.querySelectorAll('.convo-menu-popup').forEach(m => m.style.display = 'none');
                menu.style.display = isOpen ? 'none' : 'block';
            }
        }
        if (e.target.classList.contains('convo-delete')) {
            const item = e.target.closest('.convo-item');
            const conversationId = item && item.getAttribute('data-id');
            const uid = window.firebaseAuth?.currentUser?.uid;
            if (uid && conversationId && window.ChatStore) {
                e.stopPropagation();
                const ok = confirm('Delete this conversation? This cannot be undone.');
                if (!ok) return;
                window.ChatStore.deleteConversation(uid, conversationId)
                    .then(() => {
                        if (currentConversationId === conversationId) {
                            currentConversationId = null;
                            chatContainer.innerHTML = '';
                        }
                        loadConversations(uid).catch(() => {});
                    })
                    .catch(err => console.warn('Delete failed', err));
            }
        }
    });
    // Close any open menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.convo-actions')) {
            document.querySelectorAll('.convo-menu-popup').forEach(m => m.style.display = 'none');
        }
    });
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    });
}

// Handle Send Message
async function handleSendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    // Persist user message
    try {
        const uid = window.firebaseAuth?.currentUser?.uid;
        if (uid && window.ChatStore) {
            if (!currentConversationId) {
                const title = message.slice(0, 60);
                currentConversationId = await window.ChatStore.createConversation(uid, title);
            }
            await window.ChatStore.addMessage(uid, currentConversationId, 'user', message, { mode: currentMode });
        }
    } catch (e) { console.warn('Persist user message failed', e); }
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Disable send button
    sendBtn.disabled = true;
    
    // Show inline typing indicator
    const typingEl = addTypingIndicator();
    
    try {
        // Call API
        const response = await callAPI(message, currentMode);
        
        // Add assistant response
        addMessage(response.response, 'assistant', response.citations, response.generation_time);
        // Persist assistant message
        try {
            const uid = window.firebaseAuth?.currentUser?.uid;
            if (uid && window.ChatStore && currentConversationId) {
                await window.ChatStore.addMessage(uid, currentConversationId, 'assistant', response.response, {
                    citations: response.citations || [],
                    generationTime: response.generation_time || null,
                    modelUsed: response.model_used || null,
                    mode: response.mode || currentMode
                });
                // Set conversation title if newly created
                const title = message.slice(0, 60);
                await window.ChatStore.setTitle(uid, currentConversationId, title);
                // Refresh sidebar
                loadConversations(uid).catch(() => {});
            }
        } catch (e) { console.warn('Persist assistant message failed', e); }
        
    } catch (error) {
        console.error('Error:', error);
        addMessage(
            'I apologize, but I encountered an error. Please make sure the API server is running on port 8000.',
            'assistant',
            ['Error: ' + error.message]
        );
    } finally {
        // Remove typing indicator
        if (typingEl && typingEl.parentNode) {
            typingEl.parentNode.removeChild(typingEl);
        }
        
        // Enable send button
        sendBtn.disabled = false;
        
        // Focus input
        messageInput.focus();
    }
}

// Call API
async function callAPI(message, mode) {
    const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message,
            mode: mode
        })
    });
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
}

// Add Message to Chat
function addMessage(text, type, citations = null, generationTime = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'user' ? '👤' : '🕉️';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Format text with line breaks
    const paragraphs = text.split('\n\n');
    paragraphs.forEach(para => {
        if (para.trim()) {
            const p = document.createElement('p');
            p.textContent = para;
            content.appendChild(p);
        }
    });
    
    // Add citations if present
    if (citations && citations.length > 0 && type === 'assistant') {
        const citationsDiv = document.createElement('div');
        citationsDiv.className = 'citations';
        
        const citationsLabel = document.createElement('strong');
        citationsLabel.textContent = 'Sources: ';
        citationsDiv.appendChild(citationsLabel);
        
        citations.forEach(citation => {
            const tag = document.createElement('span');
            tag.className = 'citation-tag';
            tag.textContent = citation;
            citationsDiv.appendChild(tag);
        });
        
        content.appendChild(citationsDiv);
    }
    
    // Add generation time if present
    if (generationTime && type === 'assistant') {
        const timeDiv = document.createElement('div');
        timeDiv.className = 'citations';
        timeDiv.innerHTML = `<small>Generated in ${generationTime.toFixed(2)}s</small>`;
        content.appendChild(timeDiv);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Sidebar: load recent conversations
function renderConversations(items) {
    const list = document.getElementById('convoList');
    if (!list) return;
    list.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'convo-item';
        li.setAttribute('data-id', item.id);
        const title = item.title || 'New chat';
        const preview = item.lastMessage || '';
        li.innerHTML = `
            <div class="convo-main">
                <div class="convo-title">${escapeHtml(title)}</div>
                <div class="convo-subtitle">${escapeHtml(preview)}</div>
            </div>
            <div class="convo-actions">
                <button class="convo-menu" title="Options">⋯</button>
                <div class="convo-menu-popup">
                    <button class="convo-delete">Delete</button>
                </div>
            </div>`;
        list.appendChild(li);
    });
}

// Load messages for a conversation
async function loadConversationMessages(conversationId) {
    try {
        const uid = window.firebaseAuth?.currentUser?.uid;
        if (!uid || !window.ChatStore) return;
        currentConversationId = conversationId;
        chatContainer.innerHTML = '';
        if (unsubscribeMessages) { try { unsubscribeMessages(); } catch (e) {} }
        unsubscribeMessages = window.ChatStore.subscribeMessages(uid, conversationId, (msgs) => {
            chatContainer.innerHTML = '';
            msgs.forEach(m => {
                addMessage(m.content || '', m.role === 'user' ? 'user' : 'assistant');
            });
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 500);
    } catch (e) { console.warn('Load messages failed', e); }
}

// Add inline typing indicator as assistant message
function addTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message typing-message';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🕉️';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    const dots = document.createElement('div');
    dots.className = 'typing-indicator';
    dots.innerHTML = '<span></span><span></span><span></span>';
    content.appendChild(dots);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageDiv;
}

function escapeHtml(s) {
    return (s || '').replace(/[&<>\"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]); });
}

// Test API connection on load
async function testAPIConnection() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            console.log('✅ API connection successful');
        }
    } catch (error) {
        console.warn('⚠️ API server not running. Please start the server on port 8000');
    }
}

testAPIConnection();

