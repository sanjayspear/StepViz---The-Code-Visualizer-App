#include <stdio.h>
#include <string.h>
#include <math.h>

int main() {
    char c = 'a';
    printf("%d %c %c\n", c + 1, c + 1, c);
    c += 2;
    printf("%c %d\n", c, c - 'a');
    for (char x = 'a'; x < 'e'; x++) putchar(x);
    putchar('\n');
    puts("done");
    return 0;
}
