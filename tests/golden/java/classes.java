import java.util.*;

public class Main {
    static abstract class Animal {
        protected String name;
        Animal(String name) { this.name = name; }
        abstract String sound();
        String describe() { return name + " says " + sound(); }
    }

    static class Dog extends Animal {
        static int count = 0;
        private int age;
        Dog(String name, int age) {
            super(name);
            this.age = age;
            count++;
        }
        void birthday() { age++; }
        int getAge() { return age; }
        String sound() { return "Woof"; }
        public String toString() { return "Dog(" + name + ", " + age + ")"; }
    }

    interface Shape { double area(); }

    static class Circle implements Shape {
        double r;
        Circle(double r) { this.r = r; }
        public double area() { return Math.PI * r * r; }
    }

    static class Rect implements Shape {
        int w, h;
        Rect(int w, int h) { this.w = w; this.h = h; }
        public double area() { return w * h; }
    }

    public static void main(String[] args) {
        Dog d = new Dog("Rex", 3);
        d.birthday();
        System.out.println(d + " " + d.getAge() + " " + Dog.count);
        Animal a = new Dog("Bo", 1);
        System.out.println(a.sound() + " " + (a instanceof Dog) + " " + a.describe());
        Shape[] shapes = {new Circle(1.5), new Rect(2, 3)};
        double total = 0;
        for (Shape s : shapes) total += s.area();
        System.out.printf("%.3f%n", total);
    }
}
