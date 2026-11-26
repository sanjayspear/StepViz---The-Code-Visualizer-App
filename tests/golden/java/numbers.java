import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println(7 / 2 + " " + (-7) / 2 + " " + 7 % 3 + " " + (-7) % 3 + " " + 7 % -3);
        System.out.println(0.1 + 0.2);
        System.out.println(1e7 + " " + 1e-5 + " " + 100.0 / 3 + " " + 123456789.0 + " " + 1.0 / 0 + " " + 0.0 / 0);
        System.out.println((int) -2.7 + " " + (int) 2.7 + " " + Math.round(-2.5) + " " + Math.round(2.5) + " " + Math.round(-0.5));
        System.out.println(Integer.MAX_VALUE + 1);
        System.out.println(5 / 2.0 + " " + (double) 5 / 2 + " " + (double) (5 / 2));
        System.out.println(-0.0 + " " + (0.0 == -0.0) + " " + Math.sqrt(-1) + " " + Math.pow(2, 10));
        System.out.println(1.0 + " " + 3.0 * 1.1);
    }
}
