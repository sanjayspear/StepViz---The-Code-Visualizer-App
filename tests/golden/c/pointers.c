#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void swap(int* x, int* y) {
    int t = *x;
    *x = *y;
    *y = t;
}

int main() {
    int a = 3, b = 4;
    swap(&a, &b);
    printf("%d %d\n", a, b);
    int arr[5] = {1, 2, 3, 4, 5};
    int* p = arr;
    p += 2;
    printf("%d %d %d\n", *p, p[1], *(p - 1));
    int sum = 0;
    for (int* q = arr; q < arr + 5; q++) sum += *q;
    printf("%d\n", sum);
    return 0;
}
