#include <stdio.h>
#include <string.h>
#include <math.h>

int main() {
    printf("%d %d %d %d %d\n", 7 / 2, -7 / 2, 7 % 3, -7 % 3, 7 % -3);
    printf("%f %f %.2f %g %e\n", 0.1 + 0.2, 1.0 / 3, 2.675, 1e6, 123.456);
    printf("%d %d %ld\n", (int) -2.7, (int) 2.7, 123456789L * 10);
    printf("%5.1f|%-6.2f|%06.2f\n", 3.14159, 2.5, -1.5);
    return 0;
}
