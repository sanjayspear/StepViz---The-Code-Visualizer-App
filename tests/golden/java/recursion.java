import java.util.*;

public class Main {
    static int fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }
    static long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
    static int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
    static int power(int b, int e) { int r = 1; while (e-- > 0) r *= b; return r; }

    public static void main(String[] args) {
        System.out.println(fib(15) + " " + fact(20) + " " + gcd(84, 36) + " " + power(3, 13));
    }
}
