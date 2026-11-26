import java.util.*;

public class Main {
    public static void main(String[] args) {
        String s = "Hello, World";
        System.out.println(s.length() + " " + s.charAt(4) + " " + s.indexOf('o') + " " + s.lastIndexOf("o") + " " + s.indexOf("zz"));
        System.out.println(s.substring(7) + "|" + s.substring(0, 5) + "|" + s.toUpperCase() + "|" + s.replace('l', 'L'));
        System.out.println("  pad ".trim() + "|" + "a,b,,c".split(",").length + "|" + String.join("-", "x", "y"));
        System.out.println("apple".compareTo("banana") + " " + "b".compareTo("a") + " " + "abc".compareTo("ab") + " " + "B".compareTo("a"));
        System.out.println("abc".contains("bc") + " " + "abc".startsWith("ab") + " " + "abc".equals("ABC") + " " + "abc".equalsIgnoreCase("ABC"));
        String t = "";
        for (int i = 0; i < 3; i++) t += i;
        System.out.println(t + " " + "ab".repeat(3) + " " + "Hello".length());
    }
}
