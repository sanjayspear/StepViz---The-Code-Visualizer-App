import java.util.*;

public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("abc");
        sb.append(1).append('x').append(2.5).append(true);
        sb.insert(0, "[").append("]");
        System.out.println(sb + " " + sb.length() + " " + sb.indexOf("x"));
        sb.reverse();
        System.out.println(sb);
        sb.setLength(3);
        System.out.println(sb + "|" + sb.charAt(1));
    }
}
