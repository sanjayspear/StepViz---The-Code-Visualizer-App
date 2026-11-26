#include <stdio.h>
#include <string.h>
#include <stdlib.h>

struct Student {
    char name[20];
    int age;
    double grade;
};

int main() {
    struct Student s = {"Ana", 17, 88.5};
    struct Student* p = &s;
    p->age++;
    printf("%s %d %.1f\n", s.name, s.age, p->grade);
    struct Student all[2] = {{"Bo", 15, 70.0}, {"Cy", 16, 91.25}};
    double total = 0;
    for (int i = 0; i < 2; i++) total += all[i].grade;
    printf("%.2f %s\n", total / 2, all[1].name);
    return 0;
}
