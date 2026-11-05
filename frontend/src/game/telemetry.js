import { sendTelemetryBatch } from '../api/client.js';

export const VALID_EVENT_TYPES = ['death', 'coin', 'stomp', 'checkpoint', 'jump'];

/**
 * TelemetryManager maintains an in-memory buffer of fine-grained gameplay events,
 * samples repetitive actions like jumps, transmits batched data every 10s and at run completion,
 * and guarantees zero event loss on failure by retaining unacknowledged events for retry.
 */
export default class TelemetryManager {
  /**
   * @param {Object} [options={}]
   * @param {number} [options.flushIntervalMs=10000] - Flush period in ms (default 10 seconds)
   * @param {number} [options.jumpSampleIntervalMs=300] - Sample throttle for jump events
   * @param {number} [options.maxBatchSize=500] - Maximum events permitted in a single payload
   */
  constructor(options = {}) {
    this.runId = null;
    this.buffer = [];
    this.intervalId = null;
    this.isFlushing = false;
    this.startTime = Date.now();
    this.flushIntervalMs = options.flushIntervalMs || 10000;
    this.jumpSampleIntervalMs = options.jumpSampleIntervalMs || 300;
    this.maxBatchSize = options.maxBatchSize || 500;
    this.lastJumpTime = 0;
  }

  /**
   * Set the active backend run_id for subsequent telemetry ingestion.
   * @param {number} runId
   */
  setRunId(runId) {
    this.runId = runId;
  }

  /**
   * Initialize or reset telemetry recording session.
   * @param {number|null} [runId=null]
   */
  start(runId = null) {
    this.stop();
    this.runId = runId;
    this.buffer = [];
    this.startTime = Date.now();
    this.lastJumpTime = 0;
    this.isFlushing = false;

    // Start 10-second periodic transmission
    this.intervalId = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }

  /**
   * Stop recurring timer.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Record a gameplay telemetry event.
   * @param {('death'|'coin'|'stomp'|'checkpoint'|'jump')} eventType
   * @param {number} x - Horizontal position
   * @param {number} y - Vertical position
   * @param {Object} [meta={}] - Additional context metadata
   */
  record(eventType, x, y, meta = {}) {
    if (!VALID_EVENT_TYPES.includes(eventType)) {
      console.warn(`[Telemetry] Unsupported event type rejected: ${eventType}`);
      return;
    }

    const now = Date.now();

    // Sample jump actions so high-frequency buffering does not flood backend
    if (eventType === 'jump') {
      if (now - this.lastJumpTime < this.jumpSampleIntervalMs) {
        return;
      }
      this.lastJumpTime = now;
    }

    const t_ms = Math.max(0, now - this.startTime);

    const event = {
      event_type: eventType,
      x: Number(Number(x).toFixed(2)),
      y: Number(Number(y).toFixed(2)),
      t_ms: Math.floor(t_ms),
      meta: meta || {},
    };

    this.buffer.push(event);
  }

  /**
   * Transmit queued events to POST /telemetry/batch.
   * Slices up to maxBatchSize (500), and only removes from buffer once the backend confirms.
   */
  async flush() {
    if (!this.runId || this.buffer.length === 0 || this.isFlushing) {
      return;
    }

    this.isFlushing = true;

    try {
      while (this.buffer.length > 0 && this.runId) {
        const batch = this.buffer.slice(0, this.maxBatchSize);
        await sendTelemetryBatch(this.runId, batch);
        // Remove successfully ingested events
        this.buffer.splice(0, batch.length);
      }
    } catch (err) {
      console.warn('[Telemetry] Batch ingestion failed, events preserved for retry:', err?.message || err);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Finalize run telemetry: stop timer and flush remaining queued events.
   */
  async endRun() {
    this.stop();
    await this.flush();
  }
}
