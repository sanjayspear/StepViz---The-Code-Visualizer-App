#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    printf("%.2f %.1f %.0f %.3f\n", 2.345, 0.25, 2.5, 1.0005);
    printf("%5d|%-5d|%05d|%x|%X|%o\n", 42, 42, 42, 255, 255, 8);
    printf("%s %10s %-10s|\n", "a", "right", "left");
    printf("%e %.2e %g %g %g\n", 12345.678, 0.000123, 0.0001, 123456789.0, 100.0);
    printf("%c %% %+d %i\n", 'z', 5, -3);
    printf("%.1f %.1f %.1f\n", 0.05, 0.15, 0.35);
    return 0;
}
