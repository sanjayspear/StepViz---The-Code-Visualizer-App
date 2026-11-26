import java.util.*;

public class Main {
    public static void main(String[] args) {
        int x = 5;
        String s = x > 3 ? "big" : "small";
        boolean b = x > 3 && x < 10 || x == 0;
        System.out.println(s + " " + b + " " + !b + " " + (x & 3) + " " + (x | 8) + " " + (x ^ 1) + " " + (~x) + " " + (x << 3) + " " + (-17 >> 2) + " " + (-17 >>> 28));
    }
}
