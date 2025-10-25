export type ProgressPhase =
  | 'stringify'
  | 'encrypt'
  | 'pack'
  | 'encodePNG'
  | 'writeFile'
  | 'readFile'
  | 'decodePNG'
  | 'unpack'
  | 'decrypt'
  | 'parseJSON'
  | 'done';

export interface ProgressUpdate {
  phase: ProgressPhase;
  processedBytes: number;
  totalBytes: number;
  percent: number;
}

export type ProgressCallback = (update: ProgressUpdate) => void;

/**
 * Throttled progress callback wrapper
 * Limits updates to ~60fps to prevent UI jank
 */
export class ThrottledProgress {
  private lastUpdate = 0;
  private readonly minInterval = 16; // ~60fps
  private callback: ProgressCallback;
  
  constructor(callback: ProgressCallback) {
    this.callback = callback;
  }
  
  update(phase: ProgressPhase, processedBytes: number, totalBytes: number) {
    const now = Date.now();
    const percent = totalBytes > 0 ? Math.min(100, (processedBytes / totalBytes) * 100) : 0;
    
    // Always send the final 100% update
    if (percent >= 100 || now - this.lastUpdate >= this.minInterval) {
      this.callback({ phase, processedBytes, totalBytes, percent });
      this.lastUpdate = now;
    }
  }
  
  done() {
    this.callback({ phase: 'done', processedBytes: 100, totalBytes: 100, percent: 100 });
  }
}
