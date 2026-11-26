#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    int total = 0;
    for (int i = 1; i <= 10; i++) {
        if (i % 3 == 0) continue;
        if (i == 8) break;
        total += i;
    }
    cout << total << endl;
    int n = 0;
    do { n += 2; } while (n < 7);
    cout << n << endl;
    switch (3) {
        case 1: cout << "one" << endl;
        case 3: cout << "three" << endl;
        case 4: cout << "four" << endl;
            break;
        default: cout << "other" << endl;
    }
    int x = 10;
    while (x > 1) x /= 3;
    cout << x << endl;
    return 0;
}
