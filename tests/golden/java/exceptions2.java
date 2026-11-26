import java.util.*;

public class Main {
    static class Animal {}

    public static void main(String[] args) {
        try {
            Animal a = new Animal();
            throw new ClassCastException("x");
        } catch (ClassCastException e) {
            System.out.println("cce");
        }
        try {
            throw new IllegalStateException("bad state");
        } catch (RuntimeException e) {
            System.out.println(e.getMessage() + " | " + e);
        } finally {
            System.out.println("finally");
        }
        try {
            String t = null;
            t.length();
        } catch (NullPointerException e) {
            System.out.println("npe");
        }
        int[] a = {1, 2};
        try {
            a[2] = 3;
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}
