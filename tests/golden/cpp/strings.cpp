#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

int main() {
    string s = "Hello, World";
    cout << s.length() << " " << s[4] << " " << s.find('o') << " " << s.rfind("o") << " " << (s.find("zz") == string::npos) << endl;
    cout << s.substr(7) << "|" << s.substr(0, 5) << "|" << s.substr(3, 100) << endl;
    string t = s;
    t[0] = 'J';
    cout << t << " " << s << " " << (s < t) << " " << (string("B") < string("a")) << endl;
    cout << to_string(42) << " " << to_string(3.14) << " " << stoi("123abc") << " " << stod("2.5") << endl;
    s.insert(5, "!!");
    s.erase(0, 2);
    cout << s << endl;
    return 0;
}
