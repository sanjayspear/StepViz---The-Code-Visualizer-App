import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<>();
        String[] words = {"the", "cat", "and", "the", "dog", "and", "the"};
        for (String w : words) m.put(w, m.getOrDefault(w, 0) + 1);
        System.out.println(m);
        Map<String, Integer> t = new TreeMap<>(m);
        System.out.println(t + " " + t.keySet() + " " + t.values());
        Map<Integer, String> h = new HashMap<>();
        for (int i = 20; i > 0; i -= 3) h.put(i, "v" + i);
        System.out.println(h);
    }
}
