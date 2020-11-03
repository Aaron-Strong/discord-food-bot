export const doSomething = (something: Function) => {
  let running = true;
  let nextCheck = () => {
    return 1800000 - (new Date().getTime() % 1800000); // Check every 30 mins
  };
  let nextCall = setTimeout(() => {
    something();
    doSomething(something);
  }, nextCheck());
  return {
    next() {
      return running ? nextCheck() : -1;
    },
    exec() {
      something();
    },
    stop() {
      clearTimeout(nextCall);
      running = false;
    },
    start() {
      clearTimeout(nextCall);
      nextCall = setTimeout(() => {
        something();
        doSomething(something);
      }, nextCheck());
      running = true;
    },
  };
};
