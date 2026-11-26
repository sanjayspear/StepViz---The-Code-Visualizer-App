import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println(String.format("%.2f %.1f %.0f %.3f", 2.345, 0.25, 2.5, 1.0005));
        System.out.printf("%5d|%-5d|%05d|%x|%X|%o%n", 42, 42, 42, 255, 255, 8);
        System.out.printf("%s %10s %-10s|%n", "a", "right", "left");
        System.out.printf("%e %.2e%n", 12345.678, 0.000123);
        System.out.printf("%,d %b %c %%%n", 1234567, true, 'z');
        System.out.printf("%.2f%n", 1.005);
        System.out.printf("%.1f %.1f %.1f%n", 0.05, 0.15, 0.35);
    }
}
