// Configuration
const API_URL = 'http://localhost:8000';

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const modeBtns = document.querySelectorAll('.mode-btn');

// State
let currentMode = 'scholar';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    autoResizeTextarea();
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
        });
    });
    
    // Example questions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('example-btn')) {
            const question = e.target.dataset.question;
            messageInput.value = question;
            handleSendMessage();
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
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Disable send button
    sendBtn.disabled = true;
    
    // Show loading
    loadingOverlay.classList.add('active');
    
    try {
        // Call API
        const response = await callAPI(message, currentMode);
        
        // Add assistant response
        addMessage(response.response, 'assistant', response.citations, response.generation_time);
        
    } catch (error) {
        console.error('Error:', error);
        addMessage(
            'I apologize, but I encountered an error. Please make sure the API server is running on port 8000.',
            'assistant',
            ['Error: ' + error.message]
        );
    } finally {
        // Hide loading
        loadingOverlay.classList.remove('active');
        
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

