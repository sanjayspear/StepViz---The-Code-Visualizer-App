import java.util.*;

public class Main {
    public static void main(String[] args) {
        int i = 5;
        int a = i++ + ++i;
        System.out.println(a + " " + i);
        int j = 3;
        j = j++;
        System.out.println(j);
        int k = 2;
        k += k++ * 3;
        System.out.println(k);
        int[] arr = {1, 2, 3};
        int p = 0;
        arr[p++] = arr[p] * 10;
        System.out.println(Arrays.toString(arr) + " " + p);
    }
}
