#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    int n;
    double d;
    string w;
    cin >> n >> d >> w;
    string line;
    getline(cin, line);
    getline(cin, line);
    cout << n * 2 << " " << d / 2 << " " << w << " [" << line << "]" << endl;
    return 0;
}
