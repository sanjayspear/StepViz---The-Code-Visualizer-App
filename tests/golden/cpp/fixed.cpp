#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    cout << fixed << setprecision(2) << 2.345 << " " << 2.355 << " " << 1.005 << " " << 0.125 << " " << 2.5 << endl;
    cout << setprecision(0) << 2.5 << " " << 3.5 << " " << 0.5 << endl;
    cout << setprecision(3) << 1.0 / 3 << " " << 100.0 << endl;
    return 0;
}
