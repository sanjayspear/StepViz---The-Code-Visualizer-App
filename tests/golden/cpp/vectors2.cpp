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
    vector<string> names = {"bob", "Alice", "carl", "Bea"};
    sort(names.begin(), names.end());
    for (string& s : names) cout << s << " ";
    cout << endl;
    vector<vector<int>> g(3, vector<int>(3, 0));
    for (int i = 0; i < 3; i++) g[i][i] = i + 1;
    for (auto& row : g) { for (int x : row) cout << x; cout << " "; }
    cout << endl;
    vector<double> d = {2.5, 1.25};
    d.push_back(3);
    cout << d.size() << " " << d[2] << " " << d.at(1) << endl;
    return 0;
}
