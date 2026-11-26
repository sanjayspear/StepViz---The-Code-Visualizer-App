import java.util.*;

public class Main {
    public static void main(String[] args) {
        double sum = 0;
        for (int i = 0; i < 10; i++) sum += 0.1;
        System.out.println(sum + " " + (sum == 1.0) + " " + (int) sum);
        System.out.println(1.0 / 3 + " " + 2.0 / 3 + " " + 10.0 / 4 + " " + 1e21 + " " + 1e20 + " " + 0.001 + " " + 0.0001);
        System.out.println(Math.floor(-1.5) + " " + Math.ceil(-1.5) + " " + Math.abs(-7) + " " + Math.max(3, 7.5) + " " + Math.min(-0.0, 0.0));
        System.out.println((long) 1e19 + " " + (int) 1e10 + " " + (int) Double.NaN);
        System.out.println(String.valueOf(3.0) + Double.parseDouble("2.50") + Integer.toString(42));
    }
}
