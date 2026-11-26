import java.util.*;

public class Main {
    public static void main(String[] args) {
        Set<String> hs = new HashSet<>(List.of("pear", "apple", "fig", "kiwi"));
        System.out.println(hs);
        Set<Integer> ts = new TreeSet<>(List.of(5, 1, 9, 3));
        System.out.println(ts + " " + ts.contains(9));
        Map<Character, Integer> freq = new TreeMap<>();
        for (char c : "hello world".toCharArray()) if (c != ' ') freq.put(c, freq.getOrDefault(c, 0) + 1);
        System.out.println(freq);
        List<String> words = new ArrayList<>(List.of("delta", "Alpha", "charlie", "bravo"));
        words.sort(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        System.out.println(words);
        Map<String, Integer> lhm = new LinkedHashMap<>();
        lhm.put("z", 1); lhm.put("a", 2); lhm.put("m", 3);
        for (Map.Entry<String, Integer> e : lhm.entrySet()) System.out.print(e.getKey() + e.getValue() + " ");
        System.out.println();
    }
}
