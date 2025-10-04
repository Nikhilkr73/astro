// OpenAI Realtime Voice Astrology JavaScript

class OpenAIRealtimeAstroGuide {
    constructor() {
        this.websocket = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.userId = 'user_001';
        this.isConnected = false;
        this.audioContext = null;
        this.audioBuffer = [];
        this.isPlayingResponse = false;
        this.audioQueue = [];
        this.currentAudioSource = null;
        this.audioChunkBuffer = [];
        this.bufferTimeout = null;

        this.initializeElements();
        this.setupEventListeners();
        this.initializeAudioContext();
    }

    initializeElements() {
        // Voice elements
        this.startRecordingBtn = document.getElementById('startRecording');
        this.stopRecordingBtn = document.getElementById('stopRecording');
        this.avatarCircle = document.getElementById('avatarCircle');
        this.statusIndicator = document.getElementById('statusIndicator');

        // Messages
        this.messagesContainer = document.getElementById('messages');

        // Setup elements
        this.userIdInput = document.getElementById('userId');
        this.connectBtn = document.getElementById('connectBtn');
        this.quickSetup = document.getElementById('quickSetup');
    }

    setupEventListeners() {
        // Voice recording
        this.startRecordingBtn.addEventListener('click', () => this.startRecording());
        this.stopRecordingBtn.addEventListener('click', () => this.stopRecording());

        // Connection
        this.connectBtn.addEventListener('click', () => {
            console.log('Connect button clicked');
            this.connectToAstroGuru();
        });
        this.userIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.connectToAstroGuru();
        });
    }

    async initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🎵 Audio context initialized');
        } catch (error) {
            console.error('❌ Failed to initialize audio context:', error);
        }
    }

    connectToAstroGuru() {
        console.log('🔌 connectToAstroGuru called');
        const userId = this.userIdInput.value.trim();
        console.log('🔌 User ID:', userId);
        if (!userId) {
            console.log('❌ No user ID provided');
            alert('Please enter a user ID');
            return;
        }

        console.log('🔌 Starting connection process with userId:', userId);
        this.userId = userId;
        this.addMessage('system', '🔌 Connecting to AstroGuru Realtime...');
        this.connectWebSocket();
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/${this.userId}`;

        console.log('🔌 Connecting to AstroGuru Realtime:', wsUrl);
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
            console.log('✅ Connected to AstroGuru Realtime');
            this.updateStatus('🌟 Connected - Ready for voice conversation');
            this.isConnected = true;

            // Hide setup panel and enable voice controls
            this.quickSetup.style.display = 'none';
            this.startRecordingBtn.disabled = false;

            this.addMessage('system', '🌟 Welcome to OpenAI Realtime! Start talking and AstroGuru will respond with natural voice.');
        };

        this.websocket.onmessage = (event) => {
            console.log('📨 Message from AstroGuru Realtime:', event.data);
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.websocket.onclose = () => {
            console.log('❌ Disconnected from AstroGuru Realtime');
            this.updateStatus('❌ Disconnected');
            this.isConnected = false;
            this.addMessage('system', '❌ Connection lost. Please refresh and reconnect.');
        };

        this.websocket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            this.updateStatus('❌ Connection Error');
            this.isConnected = false;
        };
    }

    async startRecording() {
        if (!this.isConnected) {
            alert('Please connect first');
            return;
        }

        // Clear any pending audio to avoid confusion
        this.clearAudioQueue();

        try {
            console.log('🎤 Starting voice recording for OpenAI Realtime...');
            this.addMessage('system', '🎤 Listening... (Realtime mode)');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 24000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                console.log('📊 Audio data received:', event.data.size, 'bytes');
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                console.log('⏹️ Recording stopped, sending to OpenAI Realtime...');
                this.processRealtimeRecording();
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start(100); // Collect data every 100ms for real-time
            this.isRecording = true;

            this.startRecordingBtn.disabled = true;
            this.stopRecordingBtn.disabled = false;
            this.startRecordingBtn.classList.add('recording');
            this.avatarCircle.classList.add('listening');
            this.updateStatus('🔴 Recording... speak naturally');

        } catch (error) {
            console.error('❌ Error starting recording:', error);
            this.addMessage('error', '❌ Microphone access needed. Please allow microphone access and try again.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            console.log('⏹️ Stopping recording...');
            this.mediaRecorder.stop();
            this.isRecording = false;

            this.startRecordingBtn.disabled = false;
            this.stopRecordingBtn.disabled = true;
            this.startRecordingBtn.classList.remove('recording');
            this.avatarCircle.classList.remove('listening');
            this.updateStatus('🔄 Processing with OpenAI Realtime...');
        }
    }

    async processRealtimeRecording() {
        try {
            console.log('🔄 Processing voice for OpenAI Realtime...');
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            console.log('📊 Audio blob size:', audioBlob.size, 'bytes');

            // Convert to base64 and send raw WebM to server
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBase64 = this.arrayBufferToBase64(arrayBuffer);

            console.log('📤 Sending WebM audio to server...');

            this.websocket.send(JSON.stringify({
                type: 'audio',
                data: audioBase64,
                format: 'webm'
            }));

            this.addMessage('system', '🔮 AstroGuru is processing your voice with OpenAI Realtime...');

        } catch (error) {
            console.error('❌ Error processing recording:', error);
            this.updateStatus('❌ Error processing voice');
            this.addMessage('error', '❌ Could not process your voice. Please try again.');
        }
    }

    convertToPCM16(audioBuffer) {
        const length = audioBuffer.length;
        const result = new Int16Array(length);
        const channelData = audioBuffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            result[i] = Math.max(-32768, Math.min(32767, Math.floor(channelData[i] * 32768)));
        }

        return result.buffer;
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach(byte => binary += String.fromCharCode(byte));
        return btoa(binary);
    }

    handleWebSocketMessage(data) {
        console.log('📨 Handling realtime message:', data.type);

        if (data.type === 'audio_response') {
            console.log('🔊 OpenAI Realtime audio response received');
            this.addMessage('astroguru', '🔊 AstroGuru is speaking...');

            if (data.audio && data.audio.length > 0) {
                console.log('🔊 Queueing OpenAI Realtime voice response...');
                this.queueAudioChunk(data.audio, data.mime_type || 'audio/pcm');
            }

            this.updateStatus('🌟 Ready for your next message');

        } else if (data.type === 'error') {
            console.log('❌ Error received:', data.message);
            this.addMessage('error', data.message);
            this.updateStatus('🌟 Ready to try again');
        } else if (data.type === 'pong') {
            // Keep-alive response
            console.log('🏓 Pong received');
        }
    }

    queueAudioChunk(audioBase64, mimeType = 'audio/pcm') {
        console.log('📦 Buffering audio chunk, buffer size:', this.audioChunkBuffer.length);

        // Add to buffer
        this.audioChunkBuffer.push(audioBase64);

        // Clear any existing timeout
        if (this.bufferTimeout) {
            clearTimeout(this.bufferTimeout);
        }

        // If we have enough chunks or haven't received more in 100ms, process buffer
        if (this.audioChunkBuffer.length >= 3) {
            this.flushAudioBuffer();
        } else {
            this.bufferTimeout = setTimeout(() => this.flushAudioBuffer(), 100);
        }
    }

    flushAudioBuffer() {
        if (this.audioChunkBuffer.length === 0) return;

        console.log('🎵 Flushing', this.audioChunkBuffer.length, 'audio chunks as one segment');

        // Combine all buffered chunks
        const combinedAudio = this.combineAudioChunks(this.audioChunkBuffer);
        this.audioQueue.push({ audioBase64: combinedAudio, mimeType: 'audio/pcm' });

        // Clear buffer
        this.audioChunkBuffer = [];

        // Start playing if not already playing
        if (!this.isPlayingResponse) {
            this.playNextAudioChunk();
        }
    }

    combineAudioChunks(audioChunks) {
        if (audioChunks.length === 1) return audioChunks[0];

        // Convert all chunks to binary and combine
        const combinedData = [];

        for (const chunk of audioChunks) {
            const binaryString = atob(chunk);
            for (let i = 0; i < binaryString.length; i++) {
                combinedData.push(binaryString.charCodeAt(i));
            }
        }

        // Convert back to base64
        const uint8Array = new Uint8Array(combinedData);
        let binary = '';
        uint8Array.forEach(byte => binary += String.fromCharCode(byte));
        return btoa(binary);
    }

    async playNextAudioChunk() {
        if (this.audioQueue.length === 0) {
            console.log('🎵 Audio queue empty, stopping playback');
            this.isPlayingResponse = false;
            return;
        }

        this.isPlayingResponse = true;
        const { audioBase64, mimeType } = this.audioQueue.shift();

        try {
            console.log('🔊 Playing next audio chunk, remaining in queue:', this.audioQueue.length);

            // Convert base64 to array buffer
            const binaryString = atob(audioBase64);
            const arrayBuffer = new ArrayBuffer(binaryString.length);
            const uint8Array = new Uint8Array(arrayBuffer);

            for (let i = 0; i < binaryString.length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i);
            }

            // Create audio buffer from PCM16 data
            const audioBuffer = this.audioContext.createBuffer(1, arrayBuffer.byteLength / 2, 24000);
            const channelData = audioBuffer.getChannelData(0);
            const int16Array = new Int16Array(arrayBuffer);

            for (let i = 0; i < int16Array.length; i++) {
                channelData[i] = int16Array[i] / 32768;
            }

            // Stop any currently playing audio
            if (this.currentAudioSource) {
                this.currentAudioSource.stop();
                this.currentAudioSource = null;
            }

            // Play the audio
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            this.currentAudioSource = source;

            source.onended = () => {
                console.log('🎵 Audio chunk finished, playing next...');
                this.currentAudioSource = null;
                // Play next chunk
                this.playNextAudioChunk();
            };

            source.start();

        } catch (error) {
            console.error('❌ Error playing audio chunk:', error);
            this.addMessage('error', '❌ Could not play audio response');
            // Continue with next chunk even if this one failed
            this.playNextAudioChunk();
        }
    }

    clearAudioQueue() {
        console.log('🗑️ Clearing audio queue and buffer');
        this.audioQueue = [];
        this.audioChunkBuffer = [];
        this.isPlayingResponse = false;

        // Clear any pending buffer timeout
        if (this.bufferTimeout) {
            clearTimeout(this.bufferTimeout);
            this.bufferTimeout = null;
        }

        // Stop any currently playing audio
        if (this.currentAudioSource) {
            this.currentAudioSource.stop();
            this.currentAudioSource = null;
        }
    }

    async playRealtimeAudio(audioBase64, mimeType = 'audio/pcm') {
        // This method is now replaced by the queueing system
        this.queueAudioChunk(audioBase64, mimeType);
    }

    addMessage(sender, text) {
        const messageDiv = document.createElement('div');

        if (sender === 'user') {
            messageDiv.className = 'message user';
            messageDiv.innerHTML = `<strong>You:</strong> ${text}`;
        } else if (sender === 'astroguru') {
            messageDiv.className = 'message astroguru';
            messageDiv.innerHTML = `<strong>🔮 AstroGuru (Realtime):</strong> ${text}`;
        } else if (sender === 'system') {
            messageDiv.className = 'message system';
            messageDiv.innerHTML = text;
        } else if (sender === 'error') {
            messageDiv.className = 'message error';
            messageDiv.innerHTML = text;
        }

        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    updateStatus(status) {
        this.statusIndicator.textContent = status;
        console.log('Status:', status);
    }

    // Send periodic keep-alive pings
    startKeepAlive() {
        setInterval(() => {
            if (this.isConnected && this.websocket) {
                this.websocket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Every 30 seconds
    }
}

// Initialize the OpenAI realtime astrology guide when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Initializing OpenAI Realtime AstroGuru...');
    const guide = new OpenAIRealtimeAstroGuide();
    guide.startKeepAlive();
});