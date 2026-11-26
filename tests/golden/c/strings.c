#include <stdio.h>
#include <string.h>
#include <math.h>

int main() {
    char s[20] = "hello";
    char t[20];
    strcpy(t, s);
    strcat(t, " world");
    printf("%s %d %d %c\n", t, (int) strlen(t), strcmp(s, "hello") == 0, t[4]);
    char name[10] = "Bo";
    printf("[%5s][%-5s]\n", name, name);
    return 0;
}
