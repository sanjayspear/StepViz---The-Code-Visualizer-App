import java.util.*;

public class Main {
    public static void main(String[] args) {
        char c = 'a';
        System.out.println(c + 1);
        System.out.println((char) (c + 1));
        System.out.println('a' + 'b' + "x" + 'a' + 'b');
        c++;
        c += 2;
        System.out.println(c + " " + (int) c + " " + Character.isDigit('5') + " " + Character.toUpperCase(c));
        int x = 'z' - 'a';
        System.out.println(x);
    }
}
