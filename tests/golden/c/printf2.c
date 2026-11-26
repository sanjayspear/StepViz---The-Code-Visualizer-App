#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main() {
    printf("%d%%\n", 50);
    printf("[%8.3f][%-8.2f][%+.1f]\n", 3.14159, 2.5, 7.0);
    printf("%ld %lld %u\n", 1234567890L, 123456789012LL, 42u);
    printf("%c%c%c\n", 72, 105, 33);
    printf("%5s|%-5s|%.2s\n", "ab", "cd", "xyz");
    return 0;
}
