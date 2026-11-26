#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }
long long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
void swapRef(int& x, int& y) { int t = x; x = y; y = t; }

int main() {
    cout << fib(15) << " " << fact(20) << " " << gcd(84, 36) << endl;
    int a = 1, b = 2;
    swapRef(a, b);
    cout << a << b << endl;
    return 0;
}
