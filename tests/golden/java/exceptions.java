import java.util.*;

public class Main {
    public static void main(String[] args) {
        try {
            int[] a = new int[3];
            a[5] = 1;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println(e.getMessage());
        }
        try {
            String s = "abc";
            s.charAt(10);
        } catch (StringIndexOutOfBoundsException e) {
            System.out.println(e.getMessage());
        }
        try {
            Integer.parseInt("12x");
        } catch (NumberFormatException e) {
            System.out.println(e);
        }
        try {
            System.out.println(10 / 0);
        } catch (ArithmeticException e) {
            System.out.println(e);
        }
        try {
            List<Integer> l = new ArrayList<>();
            l.get(2);
        } catch (IndexOutOfBoundsException e) {
            System.out.println(e.getMessage());
        }
    }
}
