import java.util.*;

public class Main {
    public static void main(String[] args) {
        int total = 0;
        for (int i = 1; i <= 10; i++) {
            if (i % 3 == 0) continue;
            if (i == 8) break;
            total += i;
        }
        System.out.println(total);
        int n = 0;
        do { n += 2; } while (n < 7);
        System.out.println(n);
        String r = "";
        for (int i = 0; i < 3; i++)
            for (int j = 0; j < 2; j++)
                r += i * j;
        System.out.println(r);
        switch (3) {
            case 1: System.out.println("one");
            case 3: System.out.println("three");
            case 4: System.out.println("four");
                break;
            default: System.out.println("other");
        }
    }
}
