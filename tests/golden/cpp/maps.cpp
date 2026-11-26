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
    map<string, int> m;
    string words[] = {"the", "cat", "and", "the", "dog", "and", "the"};
    for (const string& w : words) m[w]++;
    for (auto& [k, v] : m) cout << k << ":" << v << " ";
    cout << endl;
    cout << m.size() << " " << m.count("cat") << " " << m.count("cow") << " " << m["the"] << endl;
    set<int> s = {5, 1, 9, 1, 3};
    s.insert(4);
    s.erase(9);
    for (int x : s) cout << x << " ";
    cout << s.size() << endl;
    return 0;
}
