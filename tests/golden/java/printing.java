import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.print("a");
        System.out.print(1);
        System.out.print('c');
        System.out.print(2.0);
        System.out.print(true);
        System.out.println();
        System.out.println(new int[0].length + " " + Arrays.toString(new String[2]) + " " + Arrays.toString(new boolean[2]) + " " + Arrays.toString(new double[]{1, 2.5}) + " " + Arrays.toString(new char[]{'x', 'y'}));
        String o = null;
        System.out.printf("%-6s|%6.2f|%3d|%s%n", "ab", 3.14159, 7, o);
        System.out.println(String.format("%08.3f|%+d|%x", -3.5, 5, -1));
    }
}
