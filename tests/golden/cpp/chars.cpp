#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    char c = 'a';
    cout << c + 1 << " " << (char) (c + 1) << " " << c << endl;
    c++;
    c += 2;
    cout << c << " " << (int) c << " " << 'z' - 'a' << " " << (char) toupper(c) << endl;
    string s = "abc";
    s += 'd';
    s += "ef";
    cout << s << " " << s.size() << " " << s[1] << endl;
    return 0;
}
