export async function getActiveTabURL(): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log('Tabs:', tabs); // Debugging
        if (tabs && tabs.length > 0) {
          const url = tabs[0].url || '';
          console.log('Active Tab URL:', url); // Debugging
          resolve(url);
        } else {
          console.warn('No active tabs found.');
          resolve('');
        }
      });
    } catch (error) {
      console.error('Error querying tabs:', error);
      reject(error);
    }
  });
}