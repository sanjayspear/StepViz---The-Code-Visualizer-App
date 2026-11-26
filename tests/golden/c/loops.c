#include <stdio.h>
#include <string.h>
#include <math.h>

int main() {
    int total = 0;
    for (int i = 1; i <= 10; i++) {
        if (i % 3 == 0) continue;
        if (i == 8) break;
        total += i;
    }
    printf("%d\n", total);
    int a[5] = {3, 1, 4, 1, 5};
    int max = a[0];
    for (int i = 1; i < 5; i++) if (a[i] > max) max = a[i];
    printf("%d\n", max);
    return 0;
}
