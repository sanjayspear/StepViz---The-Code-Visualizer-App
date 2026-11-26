import java.util.*;

public class Main {
    public static void main(String[] args) {
        String s = null;
        System.out.println("value: " + s);
        String a = "Java";
        a = a.concat("!") + 1 + 2;
        System.out.println(a + " " + (1 + 2 + "x") + " " + ("x" + 1 + 2));
        String csv = "a, b ,c";
        for (String p : csv.split(",")) System.out.print("[" + p.trim() + "]");
        System.out.println();
        System.out.println("banana".replace("an", "AN") + " " + "banana".indexOf("an", 2) + " " + "Mississippi".lastIndexOf('s') + " " + "abc".charAt(0) + "abc".substring(1, 1) + "|");
        System.out.println(String.valueOf(new char[]{'h', 'i'}) + " " + "a-b-c".split("-").length + " " + "  x ".isEmpty() + " " + "".isEmpty() + " " + "Hello".toLowerCase().equals("hello"));
    }
}
