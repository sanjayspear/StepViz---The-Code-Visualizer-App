#include <stdio.h>
#include <string.h>
#include <math.h>

int main() {
    int n;
    double d;
    char w[20];
    scanf("%d %lf %s", &n, &d, w);
    printf("%d %.2f %s\n", n * 2, d / 2, w);
    return 0;
}
