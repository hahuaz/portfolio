---
title: "Node.js Runtime"
summary: "Brief overview of Node.js runtime environment and its components."
createdAt: "2025-02-05"
tags: ['js', "nodejs"]
image: '/images/posts/nodejs-runtime/nodejs-runtime.png'
---

![nodejs-runtime](/images/posts/nodejs-runtime/nodejs-runtime.png)


Node.js itself is a runtime, not a language, that executes JavaScript code on the server.

JavaScript is single-threaded, meaning it can only execute one operation at a time on a single CPU core. 
However, Node.js runtime is non-blocking. When it encounters an operation that takes time to complete, such as fetching data from an API or reading a file from disk, it doesn’t wait for it to finish to move to the next operation. Instead, it delegates the operation to other parts of the runtime and continues executing the next operation.

For example, imagine an API that fetches data from a database and returns it to users. The only time-consuming part is reading from the database. If two users send requests at the same time, the server can handle both without waiting for the first request to finish. This happens because the single thread doesn’t pause execution while waiting for the database response. Instead, it delegates the database read operation to other parts of the runtime and immediately starts processing the second request.


We will explain the components of the runtime in the next section.

## Components of the Node.js Runtime

**Javascript engine** and **Libuv** are the two main components of the Node.js runtime.
JavaScript engine is responsible for executing JavaScript code, while Libuv is responsible for handling asynchronous operations. Async operations are HTTP requests (fetch), handling timers (setTimeout/setInterval), interacting with operation system (fs.readFile), and more. 

Call stack and heap are part of the JavaScript engine, while event queue, event loop, and thread pool are part of the Libuv.

1. Call Stack: 
The call stack is a Last In, First Out (LIFO) structure that keeps track of function calls. When a function is called in the main thread, it is added to the top of the call stack, , and once it completes execution, it is removed.

2. Heap: 
The heap is where objects and variables are stored in memory. It is managed by the garbage collector, which automatically frees up memory when objects are no longer needed.

3. Event Queue: 
When an asynchronous operation is completed, its callback function is added to the event queue. They are waiting there to be added to the call stack and executed by the main thread. 

4. Event Loop: 
It's a mechanism that continuously checks the call stack and the event queue. If the call stack is empty, it takes the first event from the queue and pushes it onto the stack.

5. thread pool:
It's the place where asynchronous operations are executed.


## Async operation journey in Node.js
When a script is run by V8 JavaScript engine, it reads the code line by line from top to bottom and interacts with other components to fulfill the operations.

When an async operation is initiated, Node.js delegates it to the Libuv through **bindings**, allowing JavaScript to continue executing other operations without waiting. 
Libuv then handles the operation in a separate thread pool, and once it is completed, libuv places its corresponding callback function into the event queue. The event loop then moves the callback function to the call stack for execution.

## Example of Asynchronous Operation

```js
function taskOne() {
  console.log('Task 1: Start');
  setTimeout(() => {
    console.log('Task 1: Done');
  }, 0);
}

console.log('Script is started');
taskOne()
console.log('Continue doing other operations...');

// Output:
// Script is started
// Task 1: Start
// Continue doing other operations...
// Task 1: Done
```

In the above example, the `setTimeout` function is an asynchronous operation that is delegated to the Libuv. 
Even though the `setTimeout` function is set to 0 milliseconds, it is still executed after the  `Continue doing other operations...` log. This is because the `setTimeout` function is executed in a separate thread pool, and its callback function is placed in the event queue. Once the main thread is done executing the synchronous code, the event loop moves the callback function to the call stack for execution.
Take away is the asynchronous operation is handled **after** the synchronous code has finished executing in the call stack.


## Why multi-threaded model is not efficient for web servers?

Other server-side languages like Java, Python, and Ruby use a multi-threaded model to handle multiple requests. Each request is handled by a separate thread, which can be executed in parallel. However, this model is not efficient because:
1. **Thread is blocked**: Thread is blocked when waiting for I/O operations to complete, which can lead to resource wastage. Web servers are I/O heavy, and most of the time is spent waiting.
2. **High Memory Consumption**: Each thread requires its own memory stack, which can lead to a significant increase in memory usage.
3. **Thread can't scale**: To handle more requests, more threads need to be created. However, there is a limit to the number of threads that can be created, which can lead to performance degradation.

Multi-threaded models are efficient for CPU-heavy tasks such as:
- Image processing
- Video encoding
- Machine learning
- Cryptography
