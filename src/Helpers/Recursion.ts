export const recursion = (something: Function) => {
  let running = true;
  let nextCheck = () => {
    return 1800000 - (new Date().getTime() % 1800000); // Check every 30 mins
  };
  let nextCall = setTimeout(() => {
    something();
    recursion(something);
  }, nextCheck());
  return {
    next() {
      return running ? nextCheck() : -1;
    },
    exec() {
      console.log('doing something uwu...');
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
        recursion(something);
      }, nextCheck());
      running = true;
    },
  };
};
