import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> xs = new ArrayList<>(List.of(5, 3, 8, 3));
        xs.remove(Integer.valueOf(3));
        xs.remove(0);
        xs.add(1, 9);
        System.out.println(xs + " " + xs.indexOf(8) + " " + xs.contains(3));
        Collections.sort(xs);
        System.out.println(xs);
        List<String> names = new ArrayList<>(List.of("bob", "Alice", "carl"));
        Collections.sort(names);
        System.out.println(names + " " + Collections.max(xs));
        double[] ds = {1.5, 2.0, 0.1};
        Arrays.sort(ds);
        System.out.println(Arrays.toString(ds));
    }
}
