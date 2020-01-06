import {
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver,
  inject,
  CoreBindings,
  Application, // The interface
} from '@loopback/core';
import {juggler} from '@loopback/repository';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver()
export class PrintInfoObserver implements LifeCycleObserver {
  constructor(
    // inject app if you need access to other artifacts by `await this.app.get()`
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    // inject a datasource with key `datasources.${dsName}`
    @inject('datasources.db') private ds: juggler.DataSource,
  ) {}

  /**
   * This method will be invoked when the application starts
   */
  async start(): Promise<void> {
    // Add your logic for start
    console.log(
      'This is a migrated synchronous boot script. ' +
        "Now it maps to PrintInfoObserver's start function",
    );
    console.log(`Your app has a datasource called: ${this.ds.name}`);
  }

  /**
   * This method will be invoked when the application stops
   */
  async stop(): Promise<void> {
    // Add your logic for stop
    console.log('print message observer has stopped.');
  }
}
