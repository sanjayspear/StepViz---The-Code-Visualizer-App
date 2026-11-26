import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        double d = sc.nextDouble();
        sc.nextLine();
        String line = sc.nextLine();
        String w = sc.next();
        System.out.println(n * 2 + " " + d / 2 + " [" + line + "] " + w.toUpperCase());
    }
}
