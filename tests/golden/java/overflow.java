import java.util.*;

public class Main {
    public static void main(String[] args) {
        int a = 1000000;
        System.out.println(a * a);
        long b = 1000000;
        System.out.println(b * b);
        System.out.println(Integer.MIN_VALUE - 1 + " " + Math.abs(Integer.MIN_VALUE) + " " + (-Integer.MIN_VALUE));
        int h = 0;
        for (char c : "hello".toCharArray()) h = 31 * h + c;
        System.out.println(h + " " + "hello".hashCode());
        System.out.println((char) 97 + " " + (int) 'a' + " " + ('a' + 1) + " " + (char) ('a' + 1));
    }
}
