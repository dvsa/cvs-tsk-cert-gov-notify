import { StreamingBlobPayloadOutputTypes } from "@smithy/types";
import { Readable } from "stream";

function convertStringToStreamingPayload(str: string): StreamingBlobPayloadOutputTypes {
  const uint8Array = new TextEncoder().encode(str);
  const stream = new Readable({
    read() {
      this.push(uint8Array);
      this.push(null);
    },
  });
  return stream as StreamingBlobPayloadOutputTypes;
}

export { convertStringToStreamingPayload };
