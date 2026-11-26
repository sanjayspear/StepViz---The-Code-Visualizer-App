import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println(Math.sqrt(16) + " " + Math.pow(2, 0.5) + " " + Math.max(3, 4) + " " + Math.min(-1.5, 2) + " " + Math.abs(-3.5));
        System.out.println(Math.floor(2.7) + " " + Math.ceil(2.1) + " " + Math.round(2.4) + " " + Math.round(2.6) + " " + Math.PI);
        System.out.println(10 % 3.5 + " " + -10 % 3.5 + " " + 7.0 / 2 + " " + 1 / 3 * 3 + " " + 1.0 / 3 * 3);
        System.out.println(Integer.parseInt("-42") + Integer.valueOf("8") + " " + Double.parseDouble("1e3") + " " + String.valueOf(10 / 4.0));
    }
}
