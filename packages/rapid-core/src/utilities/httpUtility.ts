export async function fetchWithTimeout(url: string, reqInit: RequestInit, timeout?: number): Promise<Response> {
  if (!timeout) {
    return await fetch(url, reqInit);
  }

  let timer: any;
  const [res] = await Promise.all([
    fetch(url, reqInit).then((res) => {
      clearTimeout(timer);
      return res;
    }),
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Request to "${url}" was timeout.`));
      }, timeout);
    }),
  ]);
  return res;
}
