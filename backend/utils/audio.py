"""
Audio processing utilities
Handles audio format conversion and processing
"""

import io
import wave
import struct
from pydub import AudioSegment
from typing import Optional

# Import settings
try:
    from backend.config.settings import AUDIO_SAMPLE_RATE, AUDIO_CHANNELS, AUDIO_SAMPLE_WIDTH
except ImportError:
    # Fallback defaults
    AUDIO_SAMPLE_RATE = 24000
    AUDIO_CHANNELS = 1
    AUDIO_SAMPLE_WIDTH = 2


def pcm16_to_wav(pcm_data: bytes, sample_rate: int = None, channels: int = None) -> bytes:
    """
    Convert raw PCM16 audio to WAV format
    
    Args:
        pcm_data: Raw PCM16 audio bytes
        sample_rate: Sample rate (default: 24000)
        channels: Number of channels (default: 1 - mono)
    
    Returns:
        WAV formatted audio bytes
    """
    sample_rate = sample_rate or AUDIO_SAMPLE_RATE
    channels = channels or AUDIO_CHANNELS
    
    try:
        print(f"🔊 Converting PCM to WAV: {len(pcm_data)} bytes, {sample_rate}Hz, {channels}ch")
        
        # Create WAV file in memory
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(channels)
            wav_file.setsampwidth(AUDIO_SAMPLE_WIDTH)  # 16-bit = 2 bytes
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(pcm_data)
        
        wav_buffer.seek(0)
        wav_data = wav_buffer.read()
        print(f"✅ Created WAV file: {len(wav_data)} bytes")
        return wav_data
    except Exception as e:
        print(f"❌ Error converting PCM to WAV: {e}")
        import traceback
        traceback.print_exc()
        return pcm_data


def pcm16_to_mp3(pcm_data: bytes, sample_rate: int = None, channels: int = None) -> bytes:
    """
    Convert raw PCM16 audio to MP3 format (more browser compatible)
    
    Args:
        pcm_data: Raw PCM16 audio bytes
        sample_rate: Sample rate (default: 24000)
        channels: Number of channels (default: 1 - mono)
    
    Returns:
        MP3 formatted audio bytes
    """
    sample_rate = sample_rate or AUDIO_SAMPLE_RATE
    channels = channels or AUDIO_CHANNELS
    
    try:
        print(f"🔊 Converting PCM to MP3: {len(pcm_data)} bytes, {sample_rate}Hz, {channels}ch")
        
        # Create AudioSegment from raw PCM data
        audio_segment = AudioSegment(
            data=pcm_data,
            sample_width=AUDIO_SAMPLE_WIDTH,
            frame_rate=sample_rate,
            channels=channels
        )
        
        # Export as MP3
        mp3_buffer = io.BytesIO()
        audio_segment.export(mp3_buffer, format="mp3", bitrate="128k")
        mp3_buffer.seek(0)
        mp3_data = mp3_buffer.read()
        
        print(f"✅ Created MP3 file: {len(mp3_data)} bytes")
        return mp3_data
        
    except Exception as e:
        print(f"❌ Error converting PCM to MP3: {e}")
        # Fallback to WAV
        return pcm16_to_wav(pcm_data, sample_rate, channels)


def convert_webm_to_pcm16(webm_data: bytes) -> bytes:
    """
    Convert WebM audio data to PCM16 format for OpenAI
    
    Args:
        webm_data: WebM audio bytes
    
    Returns:
        PCM16 audio bytes (24kHz, mono, 16-bit)
    
    Raises:
        Exception: If conversion fails
    """
    try:
        print(f"🔄 Converting {len(webm_data)} bytes of WebM to PCM16...")

        # Create audio segment from WebM data
        audio_segment = AudioSegment.from_file(io.BytesIO(webm_data), format="webm")

        # Convert to PCM16: 24kHz, 16-bit, mono
        audio_segment = audio_segment.set_frame_rate(AUDIO_SAMPLE_RATE)
        audio_segment = audio_segment.set_channels(AUDIO_CHANNELS)
        audio_segment = audio_segment.set_sample_width(AUDIO_SAMPLE_WIDTH)  # 16-bit

        # Export as raw PCM data
        pcm_data = audio_segment.raw_data
        print(f"✅ Converted to {len(pcm_data)} bytes of PCM16 audio")
        return pcm_data

    except Exception as e:
        print(f"❌ Error converting WebM to PCM16: {e}")
        raise


def convert_m4a_to_pcm16(m4a_data: bytes) -> bytes:
    """
    Convert M4A audio data to PCM16 format for OpenAI
    
    Args:
        m4a_data: M4A audio bytes
    
    Returns:
        PCM16 audio bytes (24kHz, mono, 16-bit)
    
    Raises:
        Exception: If conversion fails
    """
    try:
        print(f"🔄 Converting {len(m4a_data)} bytes of M4A to PCM16...")

        # Create audio segment from M4A data
        audio_segment = AudioSegment.from_file(io.BytesIO(m4a_data), format="m4a")

        # Convert to PCM16: 24kHz, 16-bit, mono
        audio_segment = audio_segment.set_frame_rate(AUDIO_SAMPLE_RATE)
        audio_segment = audio_segment.set_channels(AUDIO_CHANNELS)
        audio_segment = audio_segment.set_sample_width(AUDIO_SAMPLE_WIDTH)  # 16-bit

        # Export as raw PCM data
        pcm_data = audio_segment.raw_data
        print(f"✅ Converted to {len(pcm_data)} bytes of PCM16 audio")
        return pcm_data

    except Exception as e:
        print(f"❌ Error converting M4A to PCM16: {e}")
        raise


def detect_audio_format(audio_data: bytes) -> Optional[str]:
    """
    Detect audio format from header bytes
    
    Args:
        audio_data: Audio file bytes
    
    Returns:
        Format string ('m4a', 'webm', 'wav', etc.) or None
    """
    if len(audio_data) < 12:
        return None
    
    # Check for common audio formats
    if audio_data[:4] == b'RIFF' and audio_data[8:12] == b'WAVE':
        return 'wav'
    elif audio_data[4:8] == b'ftyp':
        return 'm4a'  # MP4/M4A container
    elif audio_data[:4] == b'\x1a\x45\xdf\xa3':
        return 'webm'  # WebM/Matroska
    
    return None


def convert_audio_to_pcm16(audio_data: bytes, format: str = None) -> bytes:
    """
    Auto-detect and convert audio to PCM16 format
    
    Args:
        audio_data: Audio bytes in any format
        format: Optional format hint ('m4a', 'webm', 'wav')
    
    Returns:
        PCM16 audio bytes
    """
    # Auto-detect format if not provided
    if not format:
        format = detect_audio_format(audio_data)
    
    if format == 'webm':
        return convert_webm_to_pcm16(audio_data)
    elif format == 'm4a' or format == 'mp4':
        return convert_m4a_to_pcm16(audio_data)
    elif format == 'wav':
        # Already in a supported format, might just need resampling
        audio_segment = AudioSegment.from_wav(io.BytesIO(audio_data))
        audio_segment = audio_segment.set_frame_rate(AUDIO_SAMPLE_RATE)
        audio_segment = audio_segment.set_channels(AUDIO_CHANNELS)
        audio_segment = audio_segment.set_sample_width(AUDIO_SAMPLE_WIDTH)
        return audio_segment.raw_data
    else:
        # Try generic conversion
        print(f"⚠️  Unknown format, attempting generic conversion...")
        try:
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_data))
            audio_segment = audio_segment.set_frame_rate(AUDIO_SAMPLE_RATE)
            audio_segment = audio_segment.set_channels(AUDIO_CHANNELS)
            audio_segment = audio_segment.set_sample_width(AUDIO_SAMPLE_WIDTH)
            return audio_segment.raw_data
        except Exception as e:
            print(f"❌ Failed to convert audio: {e}")
            raise

