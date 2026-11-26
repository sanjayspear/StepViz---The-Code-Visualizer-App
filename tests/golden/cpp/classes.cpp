#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <algorithm>
#include <cmath>
using namespace std;

class Animal {
protected:
    string name;
public:
    Animal(string n) : name(n) {}
    virtual string sound() { return "..."; }
    string describe() { return name + " says " + sound(); }
    virtual ~Animal() {}
};

class Dog : public Animal {
    int age;
public:
    Dog(string n, int a) : Animal(n), age(a) {}
    string sound() override { return "Woof"; }
    void birthday() { age++; }
    int getAge() const { return age; }
};

class Shape {
public:
    virtual double area() = 0;
    virtual ~Shape() {}
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() override { return 3.141592653589793 * r * r; }
};

class Rect : public Shape {
    int w, h;
public:
    Rect(int w, int h) : w(w), h(h) {}
    double area() override { return w * h; }
};

int main() {
    Dog d("Rex", 3);
    d.birthday();
    cout << d.describe() << " " << d.getAge() << endl;
    Animal* a = new Dog("Bo", 1);
    cout << a->sound() << " " << a->describe() << endl;
    delete a;
    vector<Shape*> shapes = {new Circle(1.5), new Rect(2, 3)};
    double total = 0;
    for (Shape* s : shapes) total += s->area();
    cout << fixed << setprecision(3) << total << endl;
    return 0;
}
