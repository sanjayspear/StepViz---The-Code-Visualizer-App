import java.util.*;

public class Main {
    static int sumDigits(int n) { return n == 0 ? 0 : n % 10 + sumDigits(n / 10); }
    static boolean isPal(String s) { return s.length() < 2 || (s.charAt(0) == s.charAt(s.length() - 1) && isPal(s.substring(1, s.length() - 1))); }
    static String binary(int n) { return n < 2 ? "" + n : binary(n / 2) + n % 2; }
    static int hanoi(int n) { return n == 0 ? 0 : 2 * hanoi(n - 1) + 1; }
    static void bubble(int[] a) {
        for (int i = 0; i < a.length - 1; i++)
            for (int j = 0; j < a.length - 1 - i; j++)
                if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; }
    }
    static int bsearch(int[] a, int x) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) { int mid = (lo + hi) / 2; if (a[mid] == x) return mid; if (a[mid] < x) lo = mid + 1; else hi = mid - 1; }
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(sumDigits(98765) + " " + isPal("racecar") + " " + isPal("abca") + " " + binary(10) + " " + hanoi(4));
        int[] arr = {5, 2, 9, 1, 7};
        bubble(arr);
        System.out.println(Arrays.toString(arr) + " " + bsearch(arr, 7));
    }
}
