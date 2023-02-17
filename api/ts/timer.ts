export default function timeoutTimer(ms: number) {
  const timerPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Scraping stopped after 9 seconds'));
    }, ms);
  });
  return timerPromise;
}

export function timeoutTimerPageLoad(ms: number) {
  const timerPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('resolved page load');
      resolve('resolved');
    }, ms);
  });
  return timerPromise;
}
