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
    for (int i = 0; i < 5; i++) {
        for (int j = 0; j <= i; j++) cout << "*";
        cout << endl;
    }
    int n = 12345, rev = 0;
    while (n > 0) { rev = rev * 10 + n % 10; n /= 10; }
    cout << rev << endl;
    int count = 0;
    for (int i = 2; i < 50; i++) {
        bool prime = true;
        for (int j = 2; j * j <= i; j++) if (i % j == 0) { prime = false; break; }
        if (prime) count++;
    }
    cout << count << endl;
    return 0;
}
