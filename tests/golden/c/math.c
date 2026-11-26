#include <stdio.h>
#include <string.h>
#include <math.h>
#include <stdlib.h>

int main() {
    printf("%.4f %.4f %.1f %.1f %.0f %.0f\n", sqrt(2), pow(2, 0.5), floor(-1.5), ceil(-1.5), round(2.5), round(-2.5));
    printf("%d %.3f\n", abs(-5), fabs(-2.25));
    return 0;
}
