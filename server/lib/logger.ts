class LoggingUtil {
  private tryStringify(log: any) {
    try {
      return JSON.stringify(log);
    } catch (e) {
      return log;
    }
  }

  private shouldStringify(log: any, enabled: boolean) {
    return enabled ? this.tryStringify(log) : log;
  }

  debug(log: any, stringify = true) {
    // eslint-disable-next-line no-console
    console.debug(this.shouldStringify(log, stringify));
  }

  log(log: any, stringify = true) {
    // eslint-disable-next-line no-console
    console.log(this.shouldStringify(log, stringify));
  }

  error(...e: string | Error | any) {
    console.error(e);
  }
}

export const Logger = new LoggingUtil();
