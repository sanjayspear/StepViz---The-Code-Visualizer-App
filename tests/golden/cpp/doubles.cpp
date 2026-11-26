#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    double sum = 0;
    for (int i = 0; i < 10; i++) sum += 0.1;
    cout << sum << " " << (sum == 1.0) << endl;
    cout << setprecision(17) << sum << endl;
    cout << setprecision(6) << 1e21 << " " << 1e20 << " " << -0.0 << " " << 5.0e-324 << endl;
    int i = 7;
    double d = i / 2;
    cout << d << " " << i / 2.0 << endl;
    return 0;
}
