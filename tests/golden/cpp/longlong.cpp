#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    long long big = 1LL << 40;
    cout << big << " " << big * 3 << " " << big / 7 << " " << big % 1000 << endl;
    long long f = 1;
    for (int i = 1; i <= 20; i++) f *= i;
    cout << f << endl;
    int a = 7, b = -2;
    cout << a / b << " " << a % b << " " << (a >> 1) << " " << (b >> 1) << " " << (a << 3) << endl;
    cout << (5 & 3) << " " << (5 | 3) << " " << (5 ^ 3) << " " << (~5) << endl;
    return 0;
}
