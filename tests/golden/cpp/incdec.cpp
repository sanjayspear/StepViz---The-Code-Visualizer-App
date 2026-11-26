#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    int i = 5;
    int a = i++;
    int b = ++i;
    cout << a << " " << b << " " << i << endl;
    int k = 2;
    k += 3;
    k *= k - 1;
    cout << k << endl;
    return 0;
}
