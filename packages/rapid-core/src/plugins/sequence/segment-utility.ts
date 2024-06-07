export function padSegment(segment: string, length?: number, fillString?: string) {
  if (!length) {
    return segment;
  }

  if (segment.length > length) {
    return segment.substring(segment.length - length);
  } else {
    return segment.padStart(length, fillString || " ");
  }
}
