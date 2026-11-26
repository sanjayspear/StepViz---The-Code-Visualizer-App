import java.util.*;

public class Main {
    public static void main(String[] args) {
        String day = "TUE";
        switch (day) {
            case "MON": System.out.println(1); break;
            case "TUE":
            case "WED": System.out.println(2); break;
            default: System.out.println(0);
        }
        char g = 'B';
        switch (g) {
            case 'A' -> System.out.println("top");
            case 'B', 'C' -> System.out.println("ok");
            default -> System.out.println("low");
        }
        int m = 4;
        int days = switch (m) { case 2 -> 28; case 4, 6, 9, 11 -> 30; default -> 31; };
        System.out.println(days);
    }
}
