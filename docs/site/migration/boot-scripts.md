---
lang: en
title: 'Migrating boot scripts'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-boot-scripts.html
---

In LoopBack 3, predefined boot scripts are organized in the `/server/boot`
directory, and are executed right before the server starts to perform some
custom application initialization. The same functionality can also be achieved
in LoopBack 4 application by adding observers.

The LoopBack 3 boot script is mapped to LoopBack 4 observer's `start` function.
And moreover, besides participating in an application's start phase, an observer
also allows you to perform logic in the stop phase.

## Migrating Boot Scripts

### LoopBack 3 Boot Script

LoopBack 3 has different signatures for synchronized and asynchronized boot
scripts:

They both have the first parameter as `server`(some people are used to name it
as `app`). A synchronized script only has one parameter, for example, the
following is a boot script that prints out a datasource's name before
application runs:

```js
// a typical synchronized boot script
// in file `server/boot/print-info.js`
'use strict';

module.exports = function printInfo(server) {
  // SUPPOSE your application has a datasource called `db`, which is usually the default
  // memory datasource in a sample LoopBack application created by CLI, regardless it's
  // an LB3 app or LB4 app
  const db = server.datasources.db;
  console.log('This is a synchronized script.');
  console.log('Your app has a datasource called: ', db.name);
};
```

While a typical asynchronized script has a callback function as the second
parameter:

```js
// a typical asynchronized boot script
// in file `server/boot/create-sample.js`
'use strict';

module.exports = function createSample(server, done) {
  // SUPPOSE your application has a Todo model
  const Todo = server.models.Todo;
  const sample = {title: 'a todo sample', desc: 'Something to do.'};
  Todo.create(sample)
    .then(result => {
      console.log('Sample created as: ', result);
    })
    .then(done);
};
```

Since LoopBack 4 application is created in TypeScript, which supports the latest
ECMAScript features including
[`async/await`](https://javascript.info/async-await), there is no such signature
difference any more, the `start` function in the observer is always an `async`
function.

### Migrating to LoopBack 4 Observer

To perform the same logic defined in a LoopBack 3 boot script, you should create
a corresponding observer in your LoopBack 4 application.

LoopBack 4 has its own life cycles at runtime and has `boot`, `start`, `stop` as
its transition states. Observer allows you to participate in the `start` state,
which is equivalent to the LoopBack 3 custom boot script.

_Note: We highly recommend you learn about
[Life cycle events and observers](https://loopback.io/doc/en/lb4/Life-cycle.html)
first before reading the following guide._

Take the two scripts(`server/boot/print-info.js` and
`server/boot/create-sample.js`) above as examples, let's first migrate
`server/boot/print-info.js` to your LoopBack 4 application.

#### Creating Observer

Run command `lb4 observer` to create an observer called `printInfo`:

```sh
lb4 observer
? Observer name: printInfo
? Observer group:
   create src/observers/print-info.observer.ts
   update src/observers/index.ts

Observer PrintInfo was created in src/observers/
```

You will find a file called `PrintInfo.observer.ts` created in folder
`src/observers/`. Open that file, there is a class called `PrintInfoObserver`,
which implements `LifeCycleObserver` and has `start` and `stop` functions. The
`start` function is where you should copy over the content of LB3's `printInfo`
function.

#### Injecting Application

The LoopBack 3 boot script takes in `server` as its first parameter, which is
essentially the `application` injected using key
`CoreBindings.APPLICATION_INSTANCE`:

```ts
// ... imports
export class PrintInfoObserver implements LifeCycleObserver {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {
    // ... other class members
  }
```

Now within the class `PrintInfoObserver` you have access to the application.

#### Migrating Artifacts

A boot script usually accesses or manipulates an application's artifacts like
models, datasources, etc... So when moving its content to the `start` function,
make sure you edit the code to retrieve those artifacts in LoopBack 4's way.

For the print info script, since it retrieves a datasource's info, you need to
**MIGRATE** the LoopBack datasource `db` to your LoopBack 4 application. The
steps are well documented on page [migration/datasources.md](./datasources.md).
And in the `start` function, **EDIT CODE** to retrieve the datasource using
`this.app.getSync('datasources.db')`:

_The code snippet is the complete observer file, the LB3 boot script logic is
only in the `start` function_

```ts
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
@lifeCycleObserver('')
export class PrintInfoObserver implements LifeCycleObserver {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}

  /**
   * This method will be invoked when the application starts
   */
  async start(): Promise<void> {
    // Add your logic for start
    console.log('This is a migrated synchronized boot script.');

    const db: juggler.DataSource = this.app.getSync('datasources.db');
    console.log(`Your app has a datasource called: ${db.name}`);
  }

  /**
   * This method will be invoked when the application stops
   */
  async stop(): Promise<void> {
    // Add your logic for stop
    console.log('print message observer has stopped.');
  }
}
```

For the other script `server/boot/create-sample.js`, the creation of its
corresponding observer is exactly the same as `server/boot/print-info.js`. To
avoid duplicate content, the steps are omitted here. The script retrieves
LoopBack 3 model `Todo` and creates a sample through `Todo.create()`. While in
LoopBack 4, model only describes the shape of data, and repository processes the
persistence-related behavior. Therefore you need to call
`TodoRepository.create(sample)` instead to create the sample. To migrate the
`Todo` model, you can follow the steps in
[Migrating model definitions and built-in APIs](./models/core.md).

The migrated boot script as `CreateSampleObserver`'s start function:

_The code snippet is the complete observer file, the LB3 boot script logic is
only in the `start` function_

```ts
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
@lifeCycleObserver('')
export class CreateSampleObserver implements LifeCycleObserver {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}

  /**
   * This method will be invoked when the application starts
   */
  async start(): Promise<void> {
    // Add your logic for start
    console.log('This is a migrated asynchronized boot script');

    // Retrieve the repository by key 'repositories.TodoRepository'
    const TodoRepo: TodoRepository = this.app.getSync(
      'repositories.TodoRepository',
    );
    const sample = {title: 'a todo sample', desc: 'Something to do.'};
    // Create the sample by calling TodoRepo.create()
    const result = await TodoRepo.create(sample);
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
```

### Predefined LoopBack 3 Boot Scripts

LoopBack 3 application has two predefined boot scripts: `/server/boot/root.js`
and `/server/boot/authentication.js`. Please do not create corresponding
observers for them because:

In LoopBack 4, the router is automatically registered in the
[rest server](../Server.md) and the authentication system is enabled by
[applying the `authentication` component](../LoopBack-component-authentication.md).
