import {
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver,
  inject,
  CoreBindings,
  Application, // The interface
} from '@loopback/core';
import {TodoRepository} from '../repositories';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver()
export class CreateSampleObserver implements LifeCycleObserver {
  constructor(
    // inject app if you need access to other artifacts by `await this.app.get()`
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    // inject a repository with key `repositories.${repoName}`
    // or with the shortcut injector:
    // `@repository(TodoRepository) private todoRepo: TodoRepository`
    @inject('repositories.TodoRepository') private todoRepo: TodoRepository,
  ) {}

  /**
   * This method will be invoked when the application starts
   */
  async start(): Promise<void> {
    // Add your logic for start
    console.log(
      'This is a migrated asynchronous boot script. ' +
        "Now it maps to CreateSampleObserver's start function",
    );

    const sample = {title: 'a todo sample', desc: 'Something to do.'};
    const result = await this.todoRepo.create(sample);
    console.log(`Sample created as: ${result}`);
  }

  /**
   * This method will be invoked when the application stops
   */
  async stop(): Promise<void> {
    // Add your logic for stop
    console.log('create sample observer has stopped.');
  }
}
