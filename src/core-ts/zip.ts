// Mini ZIP reader (simplified for XLSX structure)
export class ZipReader {
  private view: DataView;
  private decoder = new TextDecoder();

  constructor(private buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  async readEntries(): Promise<Map<string, Uint8Array>> {
    const entries = new Map<string, Uint8Array>();

    // Find End of Central Directory (EOCD)
    const eocdOffset = this.findEOCD();
    if (eocdOffset === -1) {
      throw new Error('Invalid ZIP file: EOCD not found');
    }

    // Read central directory
    const cdOffset = this.view.getUint32(eocdOffset + 16, true);
    const entryCount = this.view.getUint16(eocdOffset + 10, true);

    let offset = cdOffset;
    for (let i = 0; i < entryCount; i++) {
      const signature = this.view.getUint32(offset, true);
      if (signature !== 0x02014b50) break;

      const nameLen = this.view.getUint16(offset + 28, true);
      const extraLen = this.view.getUint16(offset + 30, true);
      const commentLen = this.view.getUint16(offset + 32, true);
      const localHeaderOffset = this.view.getUint32(offset + 42, true);

      // Validate lengths to prevent "Invalid array length" errors
      if (nameLen < 0 || nameLen > 1000 || offset + 46 + nameLen > this.buffer.byteLength) {
        console.warn(`Invalid nameLen: ${nameLen} at offset ${offset}`);
        continue;
      }

      const nameBytes = new Uint8Array(this.buffer, offset + 46, nameLen);
      const name = this.decoder.decode(nameBytes);

      // Read local file header
      const localSig = this.view.getUint32(localHeaderOffset, true);
      if (localSig === 0x04034b50) {
        const compMethod = this.view.getUint16(localHeaderOffset + 8, true);
        const compSize = this.view.getUint32(localHeaderOffset + 18, true);
        const uncompSize = this.view.getUint32(localHeaderOffset + 22, true);
        const localNameLen = this.view.getUint16(localHeaderOffset + 26, true);
        const localExtraLen = this.view.getUint16(localHeaderOffset + 28, true);

        const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;

        // Validate compSize to prevent "Invalid array length" errors
        if (compSize < 0 || compSize > this.buffer.byteLength || dataOffset + compSize > this.buffer.byteLength) {
          console.warn(`Invalid compSize: ${compSize} for file ${name}`);
          continue;
        }

        const compData = new Uint8Array(this.buffer, dataOffset, compSize);

        // Decompress if needed
        let data: Uint8Array;
        if (compMethod === 0) {
          data = compData; // Stored (no compression)
        } else if (compMethod === 8) {
          // DEFLATE - use DecompressionStream
          data = await this.inflateData(compData, uncompSize);
        } else {
          throw new Error(`Unsupported compression method: ${compMethod}`);
        }

        entries.set(name, data);
      }

      offset += 46 + nameLen + extraLen + commentLen;
    }

    return entries;
  }

  private findEOCD(): number {
    // Search from end for EOCD signature (0x06054b50)
    const minOffset = Math.max(0, this.buffer.byteLength - 65536);
    for (let i = this.buffer.byteLength - 22; i >= minOffset; i--) {
      if (this.view.getUint32(i, true) === 0x06054b50) {
        return i;
      }
    }
    return -1;
  }

  private async inflateData(compData: Uint8Array, _uncompSize: number): Promise<Uint8Array> {
    // Use browser's DecompressionStream API
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(compData as BufferSource);
    writer.close();

    const reader = ds.readable.getReader();
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalLength += value.length;
    }

    // Combine chunks
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }
}
