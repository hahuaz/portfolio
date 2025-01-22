---
title: "Inheritance in JavaScript"
summary: "A glimpse into constructor functions, prototype objects, and prototype chains in JavaScript."
createdAt: "2025-01-22"
tags: ['js']
image: '/images/posts/general/js.png'
---

Inheritance allows objects to access properties and methods from other objects.
Main purpose is to reduce duplication and memory usage by using shared methods and props.

In JavaScript, every object has a **prototype object**, which serves as a container for shared methods and properties. These prototype objects are linked together to form a **prototype chain**. When you attempt to access a property or method on an object, JavaScript follows these steps:
1. It first checks if the property or method exists on the object itself.
2. If not found, it traverses up the prototype chain, checking each linked prototype object.
3. This process continues until the property or method is found or the chain ends with null.

## Constructor function and prototype object

![constructor-and-prototype-object](/images/posts/inheritance-in-javascript/constructor-and-prototype-object.png)

```js	
function Person(name, birth) {
  this.name = name;
  this.birth = birth;
}

Person.prototype.calcAge = function () {
  return new Date().getFullYear() - this.birth;
};
```


We've created a Person constructor function that takes two arguments: `name` and `birth`. We've also added a `calcAge` method to the `Person.prototype` object. 


### Show prop references over code

```js
const person1 = new Person('Alice', 1990);

console.log(Person.prototype.constructor === Person); // true 
console.log(person1.__proto__ === Person.prototype); // true
```

`Person.prototype.constructor` is a reference to the constructor function itself. In this case, it points back to the `Person` constructor function.

`person1.__proto__` is a reference to the prototype object. In this case, it points to the `Person.prototype` object. This is how the `person1` instance can access the `calcAge` method because it `holds` a reference to the prototype object.

### There is only one calcAge method in the memory

```js
const person1 = new Person('Alice', 1990);
const person2 = new Person('Bob', 1985);

console.log(person1.calcAge === person2.calcAge); // true
```

If you would declare the `calcAge` method in the constructor function, every instance would have a direct `calcAge` method, so there would be two `calcAge` methods in the memory and equal check would return false.

## Inheritance using prototype chain
![constructor-and-prototype-object](/images/posts/inheritance-in-javascript/prototype-chain.png)


```js
function Person(name, birth) {
  this.name = name;
  this.birth = birth;
}

Person.prototype.calcAge = function () {
  return new Date().getFullYear() - this.birth;
};

// Create a Teacher constructor function
function Teacher (name, birth, branch) {
  Person.call(this, name, birth);
  this.branch = branch;
};

Teacher.prototype = Object.create(Person.prototype);

Object.defineProperty(Teacher.prototype, 'constructor', {
  value: Teacher,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true,
});

Teacher.prototype.teach = () => console.log('I am teaching');

```

We've created a Teacher constructor function and inside the constructor function, we've called the Person constructor function using the call method. The `call()` method calls a function with a given `this` value and arguments provided individually. Passed `this` value is the Teacher instance that is being created. 

We've also created a prototype chain between Teacher and Person by setting `Teacher.prototype` to an object created by `Object.create(Person.prototype)`. This is the action that connects `Teacher.prototype.__proto__` to `Person.prototype`.

We've also set the `constructor` property of Teacher.prototype to Teacher. This fix is necessary because when we chain the prototype in the previous line, the constructor property of Teacher.prototype is set to Person. Since it's not correct, we've set it to Teacher.

Lastly, we've added a `teach` method to Teacher.prototype. This method is specific to Teacher instances and is not available to Person instances.

Test if the prototype chain is working correctly:

```js
const teacher1 = new Teacher('Alice', 1990, 'Math');

console.log(teacher1.calcAge()); // 35
teacher1.teach(); // I am teaching
```

Important thing to know here prototype chain was possible thanks to `__proto__` property. The `Teacher.prototype.__proto__` is equal to `Person.prototype` thus the `teacher1` instance can access the `calcAge` method defined on the `Person.prototype` object.

```js
console.log(Teacher.prototype.__proto__ === Person.prototype); // true
```



## Using class declarations for inheritance

As you can see, working with constructor functions can be hard to implement a prototype chain. So we can use class declarations. Class declaration is just syntactic sugar and constructor functions are still used under the hood.

```js	

class Person {
  constructor(name, birth) {
    this.name = name;
    this.birth = birth;
  }

  // calcAge is added to the Person.prototype object directly
  calcAge() {
    return new Date().getFullYear() - this.birth;
  }
}

class Teacher extends Person {
  constructor(name, birth, branch) {
    super(name, birth);
    this.branch = branch;
  }

  // teach is added to the Teacher.prototype object directly
  teach() {
    console.log('I am teaching');
  }
}

```

In repositories or your everday work, you will see class declarations more often than constructor functions. It's easier to read and write. But it's always good to know what's happening under the hood.