let currentAudio = null;
let isProcessing = false;

export function setupSocket() {
    const socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('audio', async (data) => {
        if (isProcessing) {
            console.log('Already processing response, queuing...');
            return;
        }
        
        try {
            isProcessing = true;
            
            // Stop current audio if playing
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            
            // Create new audio element
            currentAudio = new Audio();
            
            // Set up event handlers
            currentAudio.onplay = () => console.log('Audio started playing');
            currentAudio.onended = () => {
                console.log('Audio finished playing');
                isProcessing = false;
                currentAudio = null;
            };
            currentAudio.onerror = (e) => {
                console.error('Audio error:', e);
                isProcessing = false;
                currentAudio = null;
            };
            
            // Load and play the audio
            currentAudio.src = data.url;
            await currentAudio.play();
            
        } catch (error) {
            console.error('Error playing audio:', error);
            isProcessing = false;
            currentAudio = null;
        }
    });
    
    socket.on('stop-audio', () => {
        console.log('Stopping audio playback');
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        isProcessing = false;
    });
    
    socket.on('response', (message) => {
        document.getElementById('response').textContent = message;
    });
    
    return socket;
}