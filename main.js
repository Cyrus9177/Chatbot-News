// Initialize bot when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.bot = new FactCheckBot();
    window.bot.initialize();

    const messages = document.getElementById('chat-messages');
    messages.innerHTML = `
        <div class="message bot">
            <div class="message-content">
                Hello! I'm your AI fact-checking assistant. Ask me anything or share a statement to verify.
            </div>
        </div>`;
});

// Add error handler for API limits
async function handleApiError(error) {
    console.error('API Error:', error);
    return "I've reached my API limit. Please try again later or check these reliable sources: WHO.int, CDC.gov, NASA.gov";
}

// Make sendMessage globally available
window.sendMessage = async function() {
    const input = document.getElementById('user-input');
    const messages = document.getElementById('chat-messages');
    
    if (input.value.trim() === '') return;

    // Add user message
    messages.innerHTML += `
        <div class="message user">
            <div class="message-content">${input.value}</div>
        </div>`;
    
    // Show loading indicator
    messages.innerHTML += `
        <div class="message bot" id="loading">
            <div class="message-content">Checking real-time sources...</div>
        </div>`;

    // Get bot response
    try {
        const response = await window.bot.processInput(input.value);
        // Remove loading message
        document.getElementById('loading').remove();
        messages.innerHTML += `
            <div class="message bot">
                <div class="message-content">${response}</div>
            </div>`;
    } catch (error) {
        document.getElementById('loading').remove();
        const errorMessage = await handleApiError(error);
        messages.innerHTML += `
            <div class="message bot error">
                <div class="message-content">${errorMessage}</div>
            </div>`;
    }
    
    // Clear input and scroll
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
}

// Handle enter key
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
});
