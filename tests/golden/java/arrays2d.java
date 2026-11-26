import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[][] g = new int[3][4];
        for (int i = 0; i < 3; i++)
            for (int j = 0; j < 4; j++)
                g[i][j] = i * j;
        System.out.println(Arrays.deepToString(g));
        int[][] jag = {{1}, {2, 3}, {}};
        System.out.println(jag[1].length + " " + jag[2].length + " " + Arrays.toString(jag[1]));
        char[] cs = {'d', 'a', 'c'};
        Arrays.sort(cs);
        System.out.println(new String(cs) + " " + String.valueOf(cs) + " " + cs.length);
    }
}
