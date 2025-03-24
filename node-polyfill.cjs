// This is a module that will be preloaded by Node.js
// It adds Promise.withResolvers for Node.js < 21

if (!Promise.withResolvers) {
  console.log("[Polyfill] Adding Promise.withResolvers() for Node.js compatibility");
  Object.defineProperty(Promise, 'withResolvers', {
    configurable: true,
    writable: true,
    value: function() {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }
  });
}
