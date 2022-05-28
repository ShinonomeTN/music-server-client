export class Work {
  disabled = false

  /**
   * The Constructor
   * @param { function() } body
   * @param { String } name
   * @param { Boolean } restartWhenError
   */
  constructor({ body, name, restartWhenError }) {
    this.body = body;
    this.name = name;
    this.restartWhenError = restartWhenError;
  }
}

const workerConfig = {
  isRunning: false,
  scheduleInterval: 1000,
  /** @type { Work[] } */
  works: [],
  currentTimeout: null,
};

function workerKickStart() {
  workerConfig.currentTimeout = setTimeout(() => {
    for (const work of workerConfig.works) {
      if (work.disabled) continue;
      console.debug('Invoking worker: ', work.name);
      try {
        work.body.bind(work)();
      } catch (e) {
        console.warn(`Work '${work.name}' meet error:`, e);
        if (!work.restartWhenError) {
          console.warn(`Work ${work.name} disabled.`);
          work.disabled = true;
        }
      }
    }

    if (workerConfig.isRunning) workerKickStart();
  }, workerConfig.scheduleInterval);
}

export default {
  start() {
    if (workerConfig.isRunning) return;
    workerConfig.isRunning = true;
    console.debug('Worker started.');
    workerKickStart();
  },
  stop() {
    if (!workerConfig.isRunning) return;
    workerConfig.isRunning = false;
    const { currentTimeout } = workerConfig;
    if (currentTimeout) { cancelIdleCallback(currentTimeout); }
  },

  /**
   * Start a new work later
   * @param { function } body work content
   * @param { string } name work name
   * @param { boolean } restartIfError continue if worker meets error
   */
  newWork(body, name, restartIfError) {
    const work = new Work({ body, name, restartWhenError: restartIfError });
    workerConfig.works.push(work);
    return work;
  },

  /**
   * Remote a work
   * @param { Work } work
   */
  unregisterWork(work) {
    workerConfig.works.deleteWhere((item) => work === item);
  },
};
