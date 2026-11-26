import java.util.*;

public class Main {
    public static void main(String[] args) {
        int big = 300;
        char ch = (char) big;
        System.out.println((int) ch + " " + (char) 65 + " " + (int) 'A');
        int i = 10;
        i += 2.7;
        System.out.println(i);
        i -= 0.5;
        System.out.println(i);
        long l = Integer.MAX_VALUE;
        l++;
        System.out.println(l + " " + (int) l);
        double d = 7;
        System.out.println(d + " " + 7 / 2 * 2.0);
    }
}
