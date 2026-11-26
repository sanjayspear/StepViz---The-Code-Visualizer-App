import java.util.*;

public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127, c = 128, d = 128;
        System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));
        String s1 = "hi", s2 = "hi", s3 = new String("hi");
        System.out.println((s1 == s2) + " " + (s1 == s3) + " " + s1.equals(s3));
        List<Integer> l = new ArrayList<>();
        l.add(1000);
        l.add(1000);
        System.out.println(l.get(0) == l.get(1));
    }
}
