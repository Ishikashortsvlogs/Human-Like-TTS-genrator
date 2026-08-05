// Audio helper utilities for format conversions, WAV header generation, and playback

export function pcmToWav(pcmData: Uint8Array, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Blob {
  const dataLength = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + dataLength, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sampleRate * numChannels * bitsPerSample / 8) */
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  /* block align */
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  /* bits per sample */
  view.setUint16(34, bitsPerSample, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, dataLength, true);

  // Write PCM audio data
  const bytes = new Uint8Array(buffer, 44, dataLength);
  bytes.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function base64ToUint8Array(base64: string): Uint8Array {
  // Strip any data URL prefix if present
  const cleanBase64 = base64.replace(/^data:audio\/[a-zA-Z0-9+-]+;base64,/, '').trim();
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert audio base64 or PCM to requested target format Blob (MP3 / WAV / AAC / OGG)
export async function createAudioFormatBlob(
  base64Data: string,
  targetFormat: 'mp3' | 'wav' | 'aac' | 'ogg' = 'wav',
  mimeType = 'audio/wav'
): Promise<{ blob: Blob; mimeType: string; dataUrl: string }> {
  const rawBytes = base64ToUint8Array(base64Data);
  
  // Check if rawBytes has RIFF WAV header (starts with ASCII 'RIFF')
  const hasRiffHeader = rawBytes.length >= 12 && 
    rawBytes[0] === 0x52 && rawBytes[1] === 0x49 && rawBytes[2] === 0x46 && rawBytes[3] === 0x46;

  let finalBlob: Blob;
  let finalMime = 'audio/wav';

  if (!hasRiffHeader) {
    // Convert raw PCM bytes to valid RIFF WAV blob so browser audio engine can decode it
    finalBlob = pcmToWav(rawBytes, 24000, 1, 16);
    finalMime = 'audio/wav';
  } else {
    finalBlob = new Blob([rawBytes], { type: 'audio/wav' });
    finalMime = 'audio/wav';
  }

  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string) || '');
    reader.readAsDataURL(finalBlob);
  });

  return { blob: finalBlob, mimeType: finalMime, dataUrl };
}

// Generate realistic waveform heights array (e.g. 40 bars) from text or random seed for visualization
export function generateWaveformBars(seedText: string, count = 32): number[] {
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = seedText.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const pseudoRandom = Math.abs(Math.sin(hash + i * 1.5) * 100) % 1;
    // Keep bars between 15% and 95% height
    bars.push(Math.floor(15 + pseudoRandom * 80));
  }
  return bars;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
