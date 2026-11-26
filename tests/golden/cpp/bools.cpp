#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    int x = 5;
    bool b = x > 3 && x < 10;
    cout << b << " " << !b << " " << boolalpha << b << " " << (x & 3) << " " << (x | 8) << " " << (x ^ 1) << " " << (~x) << " " << (x << 3) << " " << (-17 >> 2) << endl;
    cout << (x > 3 ? "big" : "small") << endl;
    return 0;
}
