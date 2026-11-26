class Animal {
  constructor(name) { this.name = name; }
  speak() { return this.name + " makes a sound"; }
  get upper() { return this.name.toUpperCase(); }
  set rename(v) { this.name = v; }
  static create(n) { return new Animal(n); }
}
class Dog extends Animal {
  speak() { return super.speak() + " (woof)"; }
}
const d = new Dog("Rex");
console.log(d.speak(), d.upper);
d.rename = "Max";
console.log(d.name, Animal.create("Cat").speak(), d instanceof Animal);
const obj = { x: 10, getX() { return this.x; } };
console.log(obj.getX());
