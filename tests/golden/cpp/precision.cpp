#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    cout << setprecision(3) << 3.14159 << " " << 1234.5 << " " << 0.000123456 << endl;
    cout << setprecision(10) << 1.0 / 3 << " " << 0.1 << endl;
    cout << 100.0 << " " << 1e15 << " " << 1e16 << endl;
    return 0;
}
