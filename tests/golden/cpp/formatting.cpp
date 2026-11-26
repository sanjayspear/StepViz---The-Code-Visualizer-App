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
    cout << setw(5) << 42 << "|" << setw(5) << left << 42 << "|" << endl;
    cout << right << setw(8) << 3.14159 << "|" << endl;
    cout << setfill('0') << setw(4) << 7 << endl;
    cout << setfill(' ') << boolalpha << true << " " << false << noboolalpha << " " << true << endl;
    cout << 'A' << " " << (int) 'A' << " " << char(66) << " " << 'a' + 1 << endl;
    return 0;
}
