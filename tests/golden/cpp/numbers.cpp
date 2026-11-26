#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    cout << 7 / 2 << " " << -7 / 2 << " " << 7 % 3 << " " << -7 % 3 << " " << 7 % -3 << endl;
    cout << 0.1 + 0.2 << " " << 1e6 << " " << 1e5 << " " << 123456789.0 << " " << 100.0 / 3 << " " << 1e-5 << endl;
    cout << 2.0 << " " << 2.5 << " " << 1.0 / 3 << " " << 1234567.0 << " " << 0.0001 << " " << 0.00001234 << endl;
    cout << (int) -2.7 << " " << (int) 2.7 << " " << round(-2.5) << " " << round(2.5) << " " << floor(-1.5) << " " << ceil(-1.5) << endl;
    cout << 5 / 2.0 << " " << (double) 5 / 2 << " " << sqrt(2) << " " << pow(2, 10) << " " << abs(-7) << endl;
    cout << 1.0 / 0 << " " << -1.0 / 0 << endl;
    return 0;
}
